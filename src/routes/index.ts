import { Router } from "express";
import Booking from "./Booking";

const router = Router();

router.get("/", (req, res) => {
    res.json({ message: "PSY API" });
});

router.use('/booking', Booking);

export default router;
