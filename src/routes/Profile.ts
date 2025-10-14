import { Router } from 'express'
import { authenticateJWT } from '../middleware/auth'

const router = Router()

router.get('/', authenticateJWT, (req: any, res) => {
    res.json({ message: 'Welcome!', user: req.user })
})

export default router
