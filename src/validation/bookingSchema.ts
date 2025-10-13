import { z } from 'zod'

export const bookingSchema = z.object({
    date: z
        .string()
        .min(1, 'Дата обязательна')
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Дата должна быть в формате YYYY-MM-DD'),

    time: z
        .string()
        .min(1, 'Время обязательно')
        .regex(/^([0-1]\d|2[0-3]):[0-5]\d$/, 'Неверный формат времени (HH:mm)'),

    name: z
        .string()
        .min(2, 'Имя должно содержать минимум 2 символа'),

    phone: z
        .string()
        .min(1, 'Телефон обязателен')
        .regex(/^\+?\d{7,15}$/, 'Телефон должен быть в международном формате'),

    comment: z
        .string()
        .max(300, 'Комментарий не должен превышать 300 символов')
        .optional()
})

export type BookingInput = z.infer<typeof bookingSchema>
