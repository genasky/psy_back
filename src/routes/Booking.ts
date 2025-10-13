import { Router } from 'express'
import { Booking } from '../models/Booking'
import {validate} from "../middleware/validate";
import {bookingSchema} from "../validation/bookingSchema";
import {Slot} from "../models/Slot";

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

        const booking = new Booking({ date, time, name, phone, comment })
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

router.get('/slots', async (req, res) => {
    try {
        const { date } = req.query
        if (!date || typeof date !== 'string') {
            return res.status(400).json({ message: 'Параметр date обязателен (YYYY-MM-DD)' })
        }

        // все слоты из базы
        const allSlots = await Slot.find().sort({ time: 1 })

        // занятые слоты на дату
        const bookings = await Booking.find({ date })
        const bookedTimes = bookings.map(b => b.time)

        const slotsWithAvailability = allSlots.map(slot => ({
            time: slot.time,
            available: slot.available && !bookedTimes.includes(slot.time)
        }))

        res.json({ date, slots: slotsWithAvailability })
    } catch (err) {
        console.error('Ошибка при получении слотов:', err)
        res.status(500).json({ message: 'Ошибка сервера' })
    }
})

export default router
