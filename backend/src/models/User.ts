// backend/src/models/User.ts
import { Schema, model } from 'mongoose';

export interface IUser {
  username: string;
  passwordHash: string;
  avatarEmoji: string;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  avatarEmoji: { type: String, required: true },
});

export const User = model<IUser>('User', userSchema);