import { Router } from "express";
import passport from "../services/GoogleService";
import { generateToken } from "../services/JwtService";

const router = Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('google/callback', passport.authenticate('google', { session: false }),
    (req, res) => {
        const token = generateToken({ id: req.userId });
        res.redirect(`${process.env.CLIENT_URL}/auth?token=${token}`);
    }
)

export default router;