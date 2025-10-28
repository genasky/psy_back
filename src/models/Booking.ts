import { Schema, model, Document } from 'mongoose'

export interface IBooking extends Document {
    date: string        // например: "2025-10-15"
    time: string        // например: "10:00"
    name: string
    phone: string
    messageId?: number;
    comment?: string
    createdAt: Date
}

const bookingSchema = new Schema<IBooking>({
    date: { type: String, required: true },
    time: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    messageId: { type: Number },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now }
})

export const Booking = model<IBooking>('Booking', bookingSchema)
