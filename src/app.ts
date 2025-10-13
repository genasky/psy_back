import express from "express";
import { json } from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import routes from "./routes";
import {initSlots} from "./config/initSlots";
import cors from "cors";

dotenv.config();
connectDB().then(() => initSlots());

const app = express();
app.use(json());
app.use(cors());
app.use("/api", routes);

export default app;
