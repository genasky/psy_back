import { Router } from "express";
import { adminRole, authenticateJWT } from "../middleware/auth";
import { TestResults } from "../models/TestResults";

const router = Router();

router.get('/', authenticateJWT, async (req: any, res) => {
    try {
        const tests = await TestResults.find({ user: req.user.userId }).sort({ createdAt: -1 });
        res.status(200).json(tests);
    } catch (err) {
        res.status(500).json({ message: 'Error getting tests' });
    }
});

router.post('/save', authenticateJWT, async (req: any, res) => {
    try {
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
        const test = await TestResults.findById(req.params.id);
        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }
        res.status(200).json(test);
    } catch (err) {
        res.status(500).json({ message: 'Error getting test' });
    }
});

router.get('/byUser/:userId', authenticateJWT, adminRole, async (req: any, res) => {
    const userId = req.params.userId;
    try {
        const tests = await TestResults.find({ user: userId });
        res.status(200).json(tests);
    } catch (err) {
        res.status(500).json({ message: 'Error getting tests' });
    }
});

export default router;