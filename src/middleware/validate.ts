import { ZodSchema, ZodError } from 'zod'
import { Request, Response, NextFunction } from 'express'

export const validate =
    (schema: ZodSchema) =>
        (req: Request, res: Response, next: NextFunction) => {
            const parsed = schema.safeParse(req.body)

            if (!parsed.success) {
                const errors = parsed.error.issues.map(e => ({
                    field: e.path.join('.'),
                    message: e.message,
                }))
                return res.status(400).json({ message: 'Ошибка валидации', errors })
            }

            req.body = parsed.data
            next()
        }