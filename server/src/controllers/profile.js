import jwt from "jsonwebtoken";
import { connect } from "../utils/connect.js";

const db = connect();

export const profileHandler = async (request, response) => {
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
};
