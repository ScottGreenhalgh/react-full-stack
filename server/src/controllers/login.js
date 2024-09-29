import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connect } from "../utils/connect.js";

const db = connect();

export const loginHandler = async (request, response) => {
  const { username, password } = request.body;
  const { action } = request.query;
  console.log(request.query);
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
      return response
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
        // sign identifier token
        const token = jwt.sign({ username }, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });
        console.log("Generated token: ", token);
        return response
          .status(200)
          .json({ message: "Login successful", token: token });
      } else {
        return response.status(401).json({ error: "Incorrect password" });
      }
    }
  } catch (error) {
    // check for specific error where username already exists
    if (error.code === "23505" && error.constraint === "login_username_key") {
      return response.status(409).json({
        error: { name: error.name, message: "Username already exists" },
      }); //confict error code
    }

    console.error("Database error: ", error);
    response
      .status(500)
      .json({ error: { name: error.name, message: error.message } });
  }
};
