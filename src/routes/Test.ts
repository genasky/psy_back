import { Router } from "express";
import { adminRole, authenticateJWT } from "../middleware/auth";
import { TestResults } from "../models/TestResults";
import User from "../models/User";
import mongoose from "mongoose";

const router = Router();

router.get('/', authenticateJWT, async (req: any, res) => {
    const { page = 1, limit = 10 } = req.query;
    try {
        const tests = await TestResults.find({
            user: new mongoose.Types.ObjectId(req.user.userId)
        })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)

        const username = await User.findById(req.user.userId).exec().then(user => user?.name);
        const formatted = tests.map(test => {
            let userData: any;

            if (test.user === 'anonymous') {
                userData = { _id: null, name: 'Аноним' };
            } else if (test.user && typeof test.user === 'object') {
                userData = {
                    _id: test.user._id,
                    name: username,
                };
            } else {
                userData = { _id: null, name: 'Неизвестный' };
            }

            return {
                ...test.toObject(),
                user: userData,
            };
        });
        res.status(200).json(formatted);
    } catch (err) {
        res.status(500).json({ message: 'Error getting tests' });
    }
});

router.post(
    '/save',
    async (req: any, res, next) => {
        const authHeader = req.headers.authorization;
        if (authHeader) {
            return next();
        }

        try {
            const test = new TestResults({
                user: 'anonymous',
                type: req.body.type,
                results: req.body.results,
            });

            await test.save();
            return res.status(201).json(test);
        } catch (err) {
            console.error('Error saving anonymous test:', err);
            return res.status(500).json({ message: 'Error saving anonymous test' });
        }
    },
    authenticateJWT,
    async (req: any, res) => {
        try {
            const test = new TestResults({
                user: req.user.userId,
                type: req.body.type,
                results: req.body.results,
            });

            await test.save();
            res.status(201).json(test);
        } catch (err) {
            console.error('Error saving user test:', err);
            res.status(500).json({ message: 'Error saving user test' });
        }
    }
);

router.get('/:id', async (req: any, res) => {
    try {
        const test = await TestResults.findById(req.params.id).exec();
        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

        let userData: any;

        if (test.user === 'anonymous') {
            userData = { _id: null, name: 'Аноним' };
        } else if (test.user && typeof test.user === 'object') {
            console.log(test.user)
            userData = {
                _id: test.user._id,
                name: await User.findById(test.user._id).exec().then(user => user?.name),
            };
        } else {
            userData = { _id: null, name: 'Неизвестный' };
        }

        const response = {
            ...test.toObject(),
            user: userData,
        };
        res.status(200).json(response);
    } catch (err) {
        res.status(500).json({ message: 'Error getting test' });
    }
});

router.get('/byUser/:userId', authenticateJWT, adminRole, async (req: any, res) => {
    const userId = req.params.userId;
    const { page = 1, limit = 10 } = req.query;
    try {
        const tests = await TestResults.find({
            user: new mongoose.Types.ObjectId(userId)
        })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)

        const username = await User.findById(userId).exec().then(user => user?.name);
        const formatted = tests.map(test => {
            let userData: any;

            if (test.user === 'anonymous') {
                userData = { _id: null, name: 'Аноним' };
            } else if (test.user && typeof test.user === 'object') {
                userData = {
                    _id: test.user._id,
                    name: username,
                };
            } else {
                userData = { _id: null, name: 'Неизвестный' };
            }

            return {
                ...test.toObject(),
                user: userData,
            };
        });
        res.status(200).json(formatted);
    } catch (err) {
        res.status(500).json({ message: 'Error getting tests' });
    }
});

router.get('/status/:type', authenticateJWT, async (req: any, res) => {
    const { type } = req.params;
    try {
        const tests = await TestResults.find({ type, user: req.user.userId }).sort({ createdAt: -1 });
        console.log(tests, type)
        res.status(200).json({ status: !!tests.length });
    } catch (err) {
        res.status(500).json({ message: 'Error getting tests' });
    }
});

export default router;