import { Document, model, Schema } from "mongoose";


export interface IPost extends Document {
    title: string;
    image: string;
    slug: string;
    content: string;
    published: boolean;
    timeToRead: number;
    createdAt: Date;
}

const postSchema = new Schema<IPost>({
    title: { type: String, required: true },
    image: { type: String },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    published: { type: Boolean, default: false },
    timeToRead: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

export const Post = model<IPost>('Post', postSchema);