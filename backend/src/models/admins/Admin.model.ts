import mongoose, { Schema, Document, Model } from "mongoose";
import { TAdmin } from "@shared/model/admin/Admin"
const adminSchema = new Schema<TAdmin>({
  full_name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensure no duplicate emails
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
});

export const Admin: Model<TAdmin> = (mongoose.models.Admin as Model<TAdmin>) || mongoose.model("Admin", adminSchema);