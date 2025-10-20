import { Router } from 'express'
import { authenticateJWT } from '../middleware/auth'
import User from '../models/User'
import bcrypt from 'bcryptjs'

const router = Router()

router.get('/', authenticateJWT, async (req: any, res) => {
    const user = await User.findById(req.user.userId).exec();
    console.log(req.user)
    if (!user) {
        return res.status(404).json({ message: 'User not found' })
    }
    return res.json({ user })
})

router.get('/role', authenticateJWT, async (req: any, res) => {
    const user = await User.findById(req.user.userId).exec();
    if (!user) {
        return res.status(404).json({ message: 'User not found' })
    }
    return res.json({ role: user.role })
})

router.post('/change-password', authenticateJWT, async (req: any, res) => {
    const { password, confirmedPassword } = req.body;

    if (!password || !confirmedPassword) {
        return res.status(400).json({ message: 'Password is missing' });
    }

    if (password !== confirmedPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    try {
        const user = await User.findById(req.user.userId).exec();
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.password = await bcrypt.hash(password, 10);
        await user.save();

        return res.status(200).json({ message: 'Password changed' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
})

export default router
