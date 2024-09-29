import pg from "pg";
import dotenv from "dotenv";

dotenv.config();
const db = new pg.Pool({
  connectionString: process.env.DB_URL,
});

async function resetDb() {
  try {
    await db.query(`TRUNCATE login, preferences RESTART IDENTITY CASCADE`);
  } catch (error) {
    console.error(error);
  }
}

// TRUNCATE cannot be used on a table that has foreign-key references from other tables, unless all such tables are also truncated in the same command. Checking validity in such cases would require table scans, and the whole point is not to do one.

// A foreign key with a CASCADE delete means that if a record in the parent table is deleted, then the corresponding records in the child table will automatically be deleted.

resetDb();
console.log("Reset DB");
