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

app.get("/profile", async function (request, response) {
  console.log(request.query);
  try {
    if (request.querey.include_username) {
      const profile = (
        await db.query(
          `SELECT login.username, preferences.background_url, preferences.profile_img, preferences.displayname
          FROM login
          INNER JOIN preferences ON login.id = preferences.user_id
          WHERE login.username = $1 ;`,
          [username]
        )
      ).rows;
    } else {
      throw new Error("No username provided");
    }
  } catch (error) {
    response.status(500).json(`{${error.name}, ${error.message}`);
  }
});

app.post("/login"),
  async function (request, response) {
    const { username, password } = request.body;
    try {
      const results = await db.query(
        `INSERT INTO login (username, password) VALUES ($1, $2)`,
        [username, password]
      );
      response.status(200).json({ success: results });
    } catch (error) {
      response.status(500).json(`{${error.name}, ${error.message}`);
    }
  };

app.listen(8080, () => console.log("App running on port 8080"));
