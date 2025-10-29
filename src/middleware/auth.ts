import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { Booking } from "../models/Booking";

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Invalid token" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; role: string };
        req.user = { userId: decoded.userId, role: decoded.role };
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

export const adminRole = (req: Request, res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (role !== "admin") {
        return res.status(401).json({ message: "Unauthorized" });
    }
    next();
};

export const phoneVerifiedRole = async (req: any, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user.userId).exec();
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    if (!user?.phoneVerified) {
        return res.status(401).json({ message: "Phone not verified" });
    }

    next();
};

export const bookingRole = async (req: any, res: Response, next: NextFunction) => {
    const { id } = req.params
    if (req.user.role !== 'admin') {
        const user = await User.findById(req.user.userId).exec();
        const booking = await Booking.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }
        if (!user.phoneVerified) {
            return res.status(401).json({ message: 'Not access' })
        }
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' })
        }
        if (booking.phone !== user.phone) {
            return res.status(401).json({ message: 'Not access' })
        }
        next()
    }
}