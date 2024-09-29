import { Router } from "express";
import { loginHandler } from "../controllers/login.js";
import { profileHandler } from "../controllers/profile.js";
import { sessionHandler } from "../controllers/session.js";

export const routes = Router();

// Login routes (handle register, login)
routes.post("/login", loginHandler);

// Profile routes (handle fetch and update)
routes.post("/profile", profileHandler);

// Session route
routes.get("/session", sessionHandler);
