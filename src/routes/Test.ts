import { Router } from "express";
import { adminRole, authenticateJWT } from "../middleware/auth";
import { TestResults } from "../models/TestResults";

const router = Router();

router.get('/', authenticateJWT, async (req: any, res) => {
    const { page = 1, limit = 10 } = req.query;
    try {
        const tests = await TestResults.find({ user: req.user.userId }).populate('user').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
        res.status(200).json(tests.map(test => ({ ...test.toObject(), user: { _id: test.user.id, name: test.user.name } })));
    } catch (err) {
        res.status(500).json({ message: 'Error getting tests' });
    }
});

router.post('/save', authenticateJWT, async (req: any, res) => {
    try {
        console.log(req.body.results)
        const test = new TestResults({
            user: req.user.userId,
            type: req.body.type,
            results: req.body.results,
        });
        await test.save();
        res.status(201).json(test);
    } catch (err) {
        res.status(500).json({ message: 'Error saving test' });
    }
});

router.get('/:id', authenticateJWT, async (req: any, res) => {
    try {
        const test = await TestResults.findById(req.params.id).populate('user').exec();
        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

        const response = {
            ...test.toObject(),
            user: { _id: test.user.id, name: test.user.name }
        }
        res.status(200).json(response);
    } catch (err) {
        res.status(500).json({ message: 'Error getting test' });
    }
});

router.get('/byUser/:userId', authenticateJWT, adminRole, async (req: any, res) => {
    const userId = req.params.userId;
    const { page = 1, limit = 10 } = req.query;
    try {
        const tests = await TestResults.find({ user: userId }).populate('user').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
        res.status(200).json(tests.map(test => ({ ...test.toObject(), user: { _id: test.user.id, name: test.user.name } })));
    } catch (err) {
        res.status(500).json({ message: 'Error getting tests' });
    }
});

router.get('/status/:type', authenticateJWT, async (req: any, res) => {
    const { type } = req.params;
    try {
        const tests = await TestResults.find({ type }).sort({ createdAt: -1 });
        res.status(200).json({ status: !!tests.length });
    } catch (err) {
        res.status(500).json({ message: 'Error getting tests' });
    }
});

export default router;