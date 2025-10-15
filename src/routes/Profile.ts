import { Router } from 'express'
import { authenticateJWT } from '../middleware/auth'
import User from '../models/User'

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

export default router
