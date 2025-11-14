import mongoose, { Schema, model, Document } from 'mongoose'
import { IUser } from './User'

export interface SMSLog extends Document {
    sms_id: number;
    status: string;
    parts: number;
}

const phoneVerificationSchema = new Schema<SMSLog>({
    sms_id: { type: Number, primary: true, required: true },
    status: { type: String, required: true },
    parts: { type: Number, required: true },
})

export const SMSLog = model<SMSLog>('SMSLog', phoneVerificationSchema)
