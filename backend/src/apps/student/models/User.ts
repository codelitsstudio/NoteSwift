// backend/src/models/User.ts
import { Schema, model, models } from 'mongoose';

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

export const User = (models.User as any) || model<IUser>('User', userSchema);