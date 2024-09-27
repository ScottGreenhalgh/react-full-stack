import express, { response } from "express";
import cors from "cors";
import pg from "pg";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();
const db = new pg.Pool({
  connectionString: process.env.DB_URL,
});

app.get("/", function (request, response) {
  response.status(200).json("root route");
});

app.post("/session", async function (request, response) {
  try {
    const token = request.headers.authorization.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
      if (error) {
        return response.status(401).json({ error: "Invalid or expired token" });
      }
      const username = decoded.username;
      response.status(200).json({ username });
    });
  } catch (error) {
    return response.status(401).json({ error: "Invalid or expired token" });
  }
});

app.post("/profile", async function (request, response) {
  const { background_url, profile_img, displayname } = request.body;
  const { action } = request.query;
  // decode token
  const token = request.headers.authorization.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, async (error, decoded) => {
    if (error) {
      return response.status(401).json({ error: "Invalid or expired token" });
    }
    const username = decoded.username;
    console.log(request.query);
    console.log(`Profile request from: ${username}`);
    // check if username is present
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
        let index = 2; // username being $1
        if (background_url) {
          updateFields.push(`background_url = $${index++}`);
          updateValues.push(background_url);
        }
        if (profile_img) {
          updateFields.push(`profile_img = $${index++}`);
          updateValues.push(profile_img);
        }
        if (displayname) {
          updateFields.push(`displayname = $${index++}`);
          updateValues.push(displayname);
        }
        if (updateFields.length > 0) {
          await db.query(
            `UPDATE preferences
          SET ${updateFields.join(", ")}
          WHERE user_id = (SELECT id FROM login WHERE username = $1);`,
            [username, ...updateValues]
          );
          return response.status(200).json({
            message: "Profile updated successfully",
            username,
          });
        } else {
          return response
            .status(400)
            .json({ error: "Invalid action specified" });
        }
      }
    } catch (error) {
      console.error("Database error: ", error);
      response
        .status(500)
        .json({ error: { name: error.name, message: error.message } });
    }
  });
});

app.post("/login", async function (request, response) {
  const { username, password } = request.body;
  const { action } = request.query;
  // sign identifier token
  const token = jwt.sign({ username }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  // check if both username and password are present
  if (!username || !password) {
    return response
      .status(401)
      .json({ error: "Username or password not provided" });
  }
  try {
    // register logic
    if (action === "register") {
      // hash password so plain text isn't stored in the db
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      // store username and password in login table
      const loginResult = await db.query(
        `INSERT INTO login (username, password) VALUES ($1, $2) RETURNING id`,
        [username, hashedPassword]
      );
      // create entry in preferences table using login id
      const userId = loginResult.rows[0].id;
      await db.query(
        `INSERT INTO preferences (user_id, displayname) VALUES ($1, $2)`,
        [userId, userId]
      );
      response
        .status(200)
        .json({ success: "User registered successfully", data: loginResult });
      //login logic
    } else if (action === "login") {
      const results = await db.query(
        `SELECT password FROM login WHERE username = $1`,
        [username]
      );
      if (results.rows.length === 0) {
        return response.status(404).json({ error: "User not found" });
      }
      // compare stored password to given password
      const storedHashedPassword = results.rows[0].password;
      const isPasswordMatch = await bcrypt.compare(
        password,
        storedHashedPassword
      );
      if (isPasswordMatch) {
        return response
          .status(200)
          .json({ message: "Login sucessful", token: token });
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
