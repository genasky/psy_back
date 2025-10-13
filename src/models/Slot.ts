import { Schema, model, Document } from 'mongoose'

export interface ISlot extends Document {
    time: string           // "10:00"
    available: boolean     // доступен или нет
    date?: string          // можно хранить для конкретной даты
    createdAt: Date
}

const slotSchema = new Schema<ISlot>({
    time: { type: String, required: true },
    available: { type: Boolean, default: true },
    date: { type: String }, // необязательный, если нужно фиксировать на день
    createdAt: { type: Date, default: Date.now }
})

export const Slot = model<ISlot>('Slot', slotSchema)
