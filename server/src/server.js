import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { routes } from "./routes/routes.js"; // note: .js doesn't autofill

const app = express();

dotenv.config();

//Middleware
app.use(cors());
app.use(express.json());

app.use((request, response, next) => {
  next();
});

app.use("/api", routes);

app.listen(8080, () => console.log("App running on port 8080"));
