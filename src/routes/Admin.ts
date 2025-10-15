

import { Router } from 'express'
import { adminRole, authenticateJWT } from '../middleware/auth'
import User from '../models/User'

const router = Router()

router.get('/users', authenticateJWT, adminRole, async (req: any, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const users = await User.find().skip((page - 1) * limit).limit(limit).exec();
        console.log(users)
        return res.json({ users })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
})

router.get('/users/:id', authenticateJWT, adminRole, async (req: any, res) => {
    try {
        const user = await User.findById(req.params.id).exec();
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }
        return res.json({ user })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
})

export default router
