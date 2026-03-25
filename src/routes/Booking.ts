import { Router } from 'express'
import { Booking } from '../models/Booking'
import { validate } from "../middleware/validate";
import { bookingSchema } from "../validation/bookingSchema";
import { Slot } from "../models/Slot";
import { removeBookingNotification, sendBookingNotification, sendQuickMessageNotification } from "../services/TelegramNotificationService";
import { adminRole, authenticateJWT, bookingRole, phoneVerifiedRole } from '../middleware/auth';
import User from '../models/User';

const router = Router()

// 📌 POST /api/booking
router.post('/', validate(bookingSchema), async (req, res) => {
    try {
        const { date, time, name, phone, comment } = req.body

        // проверка на занятое время
        const existing = await Booking.findOne({ date, time })
        if (existing) {
            return res.status(409).json({ message: 'Это время уже занято' })
        }

        const messageId = await sendBookingNotification({ date, time, name, phone, comment });

        const booking = new Booking({ date, time, name, phone, comment, messageId })
        await booking.save()
        res.status(201).json({
            message: 'Запись успешно создана',
            booking
        })
    } catch (err) {
        console.error('Ошибка при создании записи:', err)
        res.status(500).json({ message: 'Ошибка сервера' })
    }
})

router.post('/create', authenticateJWT, adminRole, async (req, res) => {
    try {
        const { date, time, name, phone, comment } = req.body

        const messageId = await sendBookingNotification({ date, time, name, phone, comment });

        const booking = new Booking({ date, time, name, phone, comment, messageId })
        await booking.save()

        res.status(201).json({
            message: 'Запись успешно создана',
            booking
        })
    } catch (err) {
        console.error('Ошибка при создании записи:', err)
        res.status(500).json({ message: 'Ошибка сервера' })
    }
})

// 📋 GET /api/booking
router.get('/', async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ date: 1, time: 1 })
        res.json(bookings)
    } catch (err) {
        res.status(500).json({ message: 'Ошибка сервера' })
    }
})

router.get('/period', authenticateJWT, adminRole, async (req, res) => {
    try {
        const { from, to } = req.query
        if (!from) {
            return res.status(400).json({ message: 'Параметр from и to обязательны' })
        }

        const bookings = await Booking.find({ date: { $gte: from, $lte: to } }).sort({ date: 1, time: 1 })
        res.status(200).json(bookings)
    } catch (err) {
        res.status(500).json({ message: 'Ошибка сервера' })
    }
})

router.put('/:id', authenticateJWT, bookingRole, async (req, res) => {
    try {
        const { id } = req.params
        const { time } = req.body

        if (!time) {
            return res.status(400).json({ message: 'Параметр time обязателен' })
        }

        // const existing = await Booking.findById({ date, time })
        // if (existing) {
        // return res.status(409).json({ message: 'Это время уже занято' })
        // }

        const booking = await Booking.findById(id)
        if (!booking) {
            return res.status(404).json({ message: 'Запись не найдена' })
        }

        booking.time = time;

        await booking.save()

        res.status(201).json({
            message: 'Запись успешно отредактирована',
            booking
        })
    } catch (err) {
        console.error('Ошибка при создании записи:', err)
        res.status(500).json({ message: 'Ошибка сервера' })
    }
})

router.put('/:id/full', authenticateJWT, bookingRole, async (req, res) => {
    try {
        const { id } = req.params
        const { name, phone, comment } = req.body

        const booking = await Booking.findById(id)
        if (!booking) {
            return res.status(404).json({ message: 'Запись не найдена' })
        }

        booking.name = name;
        booking.phone = phone;
        booking.comment = comment;

        await booking.save()

        res.status(201).json({
            message: 'Запись успешно отредактирована',
            booking
        })
    } catch (err) {
        console.error('Ошибка при создании записи:', err)
        res.status(500).json({ message: 'Ошибка сервера' })
    }
})

router.delete('/:id', authenticateJWT, bookingRole, async (req, res) => {
    try {
        const { id } = req.params
        const booking = await Booking.findByIdAndDelete(id)
        if (!booking) {
            return res.status(404).json({ message: 'Запись не найдена' })
        }

        await removeBookingNotification({ messageId: booking.messageId! });

        res.status(200).json({
            message: 'Запись успешно удалена'
        })
    } catch (err) {
        console.error('Ошибка при удалении записи:', err)
        res.status(500).json({ message: 'Ошибка сервера' })
    }
})

router.get('/slots', async (req, res) => {
    try {
        const { date } = req.query
        if (!date || typeof date !== 'string') {
            return res.status(400).json({ message: 'Параметр date обязателен (YYYY-MM-DD)' })
        }

        // Mock data for development without database
        const mockSlots = [
            '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
        ]

        const slotsWithAvailability = mockSlots.map(time => ({
            time,
            available: true // All slots available in dev mode
        }))

        res.json({ date, slots: slotsWithAvailability })
    } catch (err) {
        console.error('Ошибка при получении слотов:', err)
        res.status(500).json({ message: 'Ошибка сервера' })
    }
})

router.post('/quick-message', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name && !email && !message) {
        return res.status(400).json({ message: "All fields are required" });
    }

    console.log('hello 1')
    await sendQuickMessageNotification({ name, email, message });

    return res.status(200).json({ message: "ok" });
})

router.get('/phone', authenticateJWT, phoneVerifiedRole, async (req: any, res) => {
    try {
        // Mock response for development without database
        const mockBookings = [
            {
                _id: "1",
                date: "2024-01-15",
                time: "10:00",
                name: "John Doe",
                phone: "+1234567890",
                comment: "Test booking"
            }
        ]
        
        res.status(200).json(mockBookings)
    } catch (err) {
        res.status(500).json({ message: 'Ошибка сервера' })
    }
})

export default router
