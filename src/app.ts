import express from "express";
import { json } from "express";
import { connectDB } from "./config/db";
import routes from "./routes";
import { initSlots } from "./config/initSlots";
import cors from "cors";
import morgan from "morgan";
import session from "express-session";
import passport from "./services/GoogleService";

connectDB().then(() => initSlots());

const app = express();
app.use(json());
app.use(cors());
app.use(
    session({
        secret: process.env.SESSION_SECRET || "session_secret",
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 60000 },
    })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(morgan("dev"));
app.use("/api", routes);

export default app;
