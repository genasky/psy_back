import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
    googleId?: string;
    email: string;
    password?: string;
    name?: string;
    avatar?: string;
    createdAt: Date;

    comparePassword(password: string): boolean;
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
            required: false,
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

UserSchema.methods.comparePassword = function (password: string) {
    return bcrypt.compareSync(password, this.password);
}

const User = mongoose.model<IUser>("User", UserSchema);

export default User;

