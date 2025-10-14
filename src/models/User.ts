import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
    googleId?: string;
    email: string;
    password?: string;
    name: string;
    avatar?: string;
    createdAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        googleId: {
            type: String,
            required: false,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: false,
        },
        name: {
            type: String,
            required: true,
        },
        avatar: {
            type: String,
            required: false,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    }
);

export default mongoose.model<IUser>("User", UserSchema);