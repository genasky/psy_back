import { Slot } from '../models/Slot'

const WORK_HOURS = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
]

export const initSlots = async () => {
    const count = await Slot.countDocuments()
    console.log(count)
    if (count !== WORK_HOURS.length) {
        await Slot.deleteMany({});
        const slots = WORK_HOURS.map(time => ({ time, available: true }))
        await Slot.insertMany(slots)
        console.log('✅ Базовые слоты созданы')
    }
}
