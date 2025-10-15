import { Router } from "express";
import BookingRouter from "./Booking";
import AuthRouter from "./Auth";
import ProfileRouter from "./Profile";
import AvatarRouter from "./Avatar";
import AdminRouter from "./Admin";

const router = Router();

router.get("/", (req, res) => {
    res.json({ message: "PSY API" });
});

router.use('/auth', AuthRouter);
router.use('/booking', BookingRouter);
router.use('/profile', ProfileRouter);
router.use('/avatar', AvatarRouter);
router.use('/admin', AdminRouter);

export default router;
