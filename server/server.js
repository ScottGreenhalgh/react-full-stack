import express, { response } from "express";
import cors from "cors";
import pg from "pg";
import dotenv from "dotenv";

const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();
const db = new pg.Pool({
  connectionString: process.env.DB_URL,
});

app.get("/", function (request, response) {
  response.json("root route");
});

app.post("/profile", async function (request, response) {
  const { username, background_url, profile_img, displayname } = request.body;
  const { action } = request.query;
  console.log(request.query);
  if (!username) {
    return response.status(401).json({ error: "Username not provided" });
  }
  try {
    // fetch logic
    if (action === "fetch") {
      const profile = (
        await db.query(
          `SELECT login.username, preferences.background_url, preferences.profile_img, preferences.displayname
          FROM login
          INNER JOIN preferences ON login.id = preferences.user_id
          WHERE login.username = $1 ;`,
          [username]
        )
      ).rows[0];
      if (!profile) {
        return response.status(404).json({ error: "Profile not found" });
      }
      return response.status(200).json({ profile });
      // update logic
    } else if (action === "update") {
      const updateFields = [];
      const updateValues = [];
      if (background_url) {
        updateFields.push("background_url = $1");
        updateValues.push(background_url);
      }
      if (profile_img) {
        updateFields.push("profile_img = $2");
        updateValues.push(profile_img);
      }
      if (displayname) {
        updateFields.push("displayname = $3");
        updateValues.push(displayname);
      }
      if (updateFields.length > 0) {
        await db.query(
          `UPDATE preferences
          SET ${updateFields.join(", ")}
          WHERE user_id = (SELECT id FROM login WHERE username = $1);`,
          [username, ...updateValues]
        );
        return response
          .status(200)
          .json({ message: "Profile updated successfully" });
      } else {
        return response.status(400).json({ error: "Invalid action specified" });
      }
    }
  } catch (error) {
    console.error("Database error: ", error);
    response
      .status(500)
      .json({ error: { name: error.name, message: error.message } });
  }
});

app.post("/login", async function (request, response) {
  const { username, password } = request.body;
  const { action } = request.query;
  if (!username || !password) {
    return response
      .status(401)
      .json({ error: "Username or password not provided" });
  }
  try {
    // register logic
    if (action === "register") {
      const results = await db.query(
        `INSERT INTO login (username, password) VALUES ($1, $2)`,
        [username, password]
      );
      response
        .status(200)
        .json({ success: "User registered successfully", data: results });
      //login logic
    } else if (action === "login") {
      const results = await db.query(
        `SELECT password FROM login WHERE username = $1`,
        [username]
      );
      if (results.rows.length === 0) {
        return response.status(404).json({ error: "User not found" });
      }
      const storedHashedPassword = results.rows[0].password;
      const isPasswordMatch = await bcrypt.compare(
        password,
        storedHashedPassword
      );
      if (isPasswordMatch) {
        return response.status(200).json({ message: "Login sucessful" });
      } else {
        return response.status(401).json({ error: "Incorrect password" });
      }
    }
  } catch (error) {
    console.error("Database error: ", error);
    response
      .status(500)
      .json({ error: { name: error.name, message: error.message } });
  }
});

app.listen(8080, () => console.log("App running on port 8080"));
