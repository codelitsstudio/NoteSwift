import mongoose, { Schema, Types, models } from "mongoose";
import { TSubject } from "@shared/model/admin/subject";

const subjectSchema = new Schema<TSubject>(
  {
    subject_name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Subject =
  models.Subject || mongoose.model("Subject", subjectSchema);
