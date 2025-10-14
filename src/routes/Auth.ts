import { Router, Request, Response, NextFunction } from "express";
import { default as gpassport } from "../services/GoogleService";
import LocalAuthStrategy from "../services/LocalAuthService";
import { generateToken } from "../services/JwtService";
import User from "../models/User";
import bcrypt from "bcryptjs";

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email or password is missing" });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hash = await bcrypt.hash(password, 10);
        const user = await User.create({ email, password: hash });

        return res.status(201).json({ message: "Success", user: { id: user._id, email } });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
});

router.post(
    "/login",
    async (req: Request, res: Response, next: NextFunction) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email or password is missing" });
        }

        try {
            LocalAuthStrategy.authenticate(
                "local",
                { session: false },
                (
                    error: unknown,
                    user: any,
                    info: { message?: string } | undefined
                ) => {
                    if (error) return next(error);
                    if (!user)
                        return res.status(401).json({ message: info?.message || "Unauthorized" });

                    const token = generateToken({ id: user.id });
                    return res.status(200).json({ message: "Success", token });
                }
            )(req, res, next);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Server error" });
        }
    }
);

router.get('/google', gpassport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', gpassport.authenticate('google', { session: false }),
    (req, res) => {
        const token = generateToken({ id: req.userId });
        res.redirect(`${process.env.CLIENT_URL}/auth?token=${token}`);
    }
)

export default router;