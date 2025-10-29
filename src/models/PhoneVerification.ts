import mongoose, { Schema, model, Document } from 'mongoose'
import { IUser } from './User'

type TestType = 'SMI' | 'Beck' | 'Young'

export interface IPhoneVerification extends Document {
    user: IUser | "anonymous";
    code: string;
    createdAt: Date;
    expiresAt: Date;
    accessed: boolean;
}

const phoneVerificationSchema = new Schema<IPhoneVerification>({
    user: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    code: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: Date.now },
    accessed: { type: Boolean, default: false }
})

export const PhoneVerification = model<IPhoneVerification>('PhoneVerification', phoneVerificationSchema)
