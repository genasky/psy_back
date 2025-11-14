

import { Router } from 'express'
import { authenticateJWT } from '../middleware/auth'
import User from '../models/User'
import { PhoneVerification } from '../models/PhoneVerification'
import {sendSmsVerification} from "../services/PhoneService";

const router = Router()

router.post('/add', authenticateJWT, async (req: any, res) => {
    const { phone } = req.body;

    if (!phone) {
        return res.status(400).json({ message: 'Phone is missing' });
    }

    try {
        const user = await User.findById(req.user.userId).exec();
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const existed = await PhoneVerification.findOne({ user: user._id }).exec();
        if (existed) {
            return res.status(400).json({ message: 'Phone already used' });
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        console.log("Verification code:", code);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.phoneVerified = false;
        user.phone = phone;
        user.save();

        const verification = new PhoneVerification({
            user: user._id,
            code,
            expiresAt: new Date(Date.now() + 1000 * 60 * 5),
            accessed: true,
        });

        await verification.save();
        await sendSmsVerification(phone.slice(1), code);

        return res.status(200).json({ message: 'Code sent' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
})

router.post('/verify', authenticateJWT, async (req: any, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ message: 'Отсутствует код подтверждения' });
    }

    try {
        const verification = await PhoneVerification.findOne({ code }).exec();
        if (!verification) {
            return res.status(404).json({ message: 'Неверный код подтверждения' });
        }

        if (!verification.accessed) {
            return res.status(400).json({ message: 'Код уже использовался' });
        }

        if (verification.expiresAt < new Date()) {
            return res.status(400).json({ message: 'Срок жизни кода истек' });
        }

        verification.accessed = false;
        await verification.save();

        const user = await User.findById(verification.user).exec();
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        user.phoneVerified = true;
        await user.save();

        await PhoneVerification.deleteMany({ _id: verification._id }).exec();

        return res.status(200).json({ message: 'Код подвержден' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
})

router.post('/verify/resend', authenticateJWT, async (req: any, res) => {
    const { phone } = req.body;

    if (!phone) {
        return res.status(400).json({ message: 'Phone is missing' });
    }

    try {
        const user = await User.findById(req.user.userId).exec();
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const existed = await PhoneVerification.findOneAndDelete({ user: user._id }).exec();
        if (!existed) {
            return res.status(400).json({ message: 'Phone not found' });
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();


        const verification = new PhoneVerification({
            user: user._id,
            code,
            expiresAt: new Date(Date.now() + 1000 * 60 * 5),
            accessed: true,
        });

        verification.save();

        await sendSmsVerification(phone.slice(1), code);

        return res.status(200).json({ message: 'Code sent' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
})

router.post('/verify/new-phone', authenticateJWT, async (req: any, res) => {
    const { phone } = req.body;

    if (!phone) {
        return res.status(400).json({ message: 'Phone is missing' });
    }

    try {
        const user = await User.findById(req.user.userId).exec();
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await PhoneVerification.findOneAndDelete({ user: user._id }).exec();

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        console.log("Verification code:", code);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.phoneVerified = false;
        user.phone = phone;
        user.save();

        const verification = new PhoneVerification({
            user: user._id,
            code,
            expiresAt: new Date(Date.now() + 1000 * 60 * 5),
            accessed: true,
        });

        await verification.save();
        await sendSmsVerification(phone.slice(1), code);

        return res.status(200).json({ message: 'Code sent' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
})

export default router;