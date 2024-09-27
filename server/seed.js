import pg from "pg";
import dotenv from "dotenv";

dotenv.config();
const db = new pg.Pool({
  connectionString: process.env.DB_URL,
});

async function resetDb() {
  try {
    await db.query(`TRUNCATE login RESTART IDENTITY`);
    await db.query(`TRUNCATE preferences RESTART IDENTITY`);
  } catch (error) {
    console.error(error);
  }
}

resetDb();
console.log("Reset DB");
