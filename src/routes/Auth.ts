
import { Router, Request, Response, NextFunction } from "express";
import { generateToken, verifyToken } from "../services/JwtService";
import User, { IUser } from "../models/User";
import bcrypt from "bcryptjs";
import passport from "passport";
import crypto from "crypto";
import EmailService from "../services/EmailService";
import { JwtPayload } from "jsonwebtoken";

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Email or password is missing" });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hash = await bcrypt.hash(password, 10);

        const user = await User.create({
            email,
            name,
            verified: false,
            password: hash
        });

        const token = await generateToken({ id: user._id, email }, '0.5h');

        EmailService.sendVerificationEmail(user._id as never as string, email, token);

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
            passport.authenticate(
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
                    if (!user.verified)
                        return res.status(401).json({ message: "Email not verified" });

                    const token = generateToken({ userId: user.id, role: user.role });
                    return res.status(200).json({ message: "Success", token });
                }
            )(req, res, next);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Server error" });
        }
    }
);

router.get("/verify/:id/:token", async (req: Request, res: Response) => {
    const { id, token } = req.params;

    if (!token || !id) {
        return res.status(400).json({ message: "Invalid verification link" });
    }

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        const tokenCheck = verifyToken(token as string);
        if (!tokenCheck || tokenCheck.id !== id) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        user.verified = true;
        await user.save();

        return res.status(200).json({ message: "Success" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
});

router.get("/resend-verification", async (req: Request, res: Response) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ message: "Email is missing" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const token = await generateToken({ id: user._id, email }, '0.5h');

        EmailService.sendVerificationEmail(user._id as never as string, email as never as string, token);

        return res.status(200).json({ message: "Success" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
});

router.post("/reset-password", async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is missing" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const token = await generateToken({ id: user._id, email }, '0.5h');

        EmailService.sendResetPasswordEmail(user._id as never as string, email as never as string, token);

        return res.status(200).json({ message: "Success" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
});

router.post("/reset-password/:id/:token", async (req: Request, res: Response) => {
    const { id, token } = req.params;
    const { password, confirmedPassword } = req.body;

    if (!password || !confirmedPassword) {
        return res.status(400).json({ message: "Password is missing" });
    }

    if (password !== confirmedPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
    }

    if (!token || !id) {
        return res.status(400).json({ message: "Invalid verification link" });
    }

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        const tokenCheck = verifyToken(token as string);
        if (!tokenCheck || (tokenCheck as JwtPayload).id !== id) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        user.password = await bcrypt.hash(password, 10);
        await user.save();

        return res.status(200).json({ message: "Success" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
});

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { session: false }),
    (req, res) => {
        // @ts-ignore
        const user = req.user as IUser;
        const token = generateToken({ userId: user?._id, role: user?.role });
        res.redirect(`${process.env.CLIENT_URL}/auth?token=${token}`);
    }
)

router.post('/logout', async (req: Request, res: Response) => {
    req.user = undefined;
    res.status(200).json({ message: "Success" });
});

router.get('/check', async (req: Request, res: Response) => {
    const { user } = req;
    if (!user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    res.status(200).json({ message: "Success", user });
});

export default router;