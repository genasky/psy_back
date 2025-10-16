import { Router } from 'express'
import { adminRole, authenticateJWT } from '../middleware/auth'
import User from '../models/User'

const router = Router()

router.get('/users', authenticateJWT, adminRole, async (req: any, res) => {
  try {
    const { page = 1, limit = 20, verified } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const lim = Number(limit);

    let query = {};

    if (verified === undefined) {
      // без фильтрации
      query = {};
    } else if (verified === 'true') {
      query = { verified: true };
    } else if (verified === 'false') {
      // include users with verified: false OR without verified field
      query = {
        $or: [{ verified: false }, { verified: { $exists: false } }],
      };
    }

    const users = await User.find(query).skip(skip).limit(lim).exec();

    return res.json({ users });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});


router.get('/users/:id', authenticateJWT, adminRole, async (req: any, res) => {
  try {
    const user = await User.findById(req.params.id).exec()
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    return res.json({ user })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Server error' })
  }
})

router.put('/users/:id', authenticateJWT, adminRole, async (req: any, res) => {
  try {
    const user = await User.findById(req.params.id).exec()
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    user.role = 'admin'
    await user.save()
    return res.json({ message: 'User role changed' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Server error' })
  }
})

export default router
