import { TTeacher } from "@shared/model/teacher/Teacher";

import mongoose, { models, Schema, Types } from "mongoose";

const teahcerSchema = new Schema<TTeacher>({
  full_name: {
    type: String,
    required: true,
  },
  phone_number: {
    type: String,
    required: true,
    unique: true,
  },
  designation: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  grades_taught: {
    type: [Number],
    required: true,
  },
  password: {
    type: String,
    required: true
  },
  years_of_experience: {
    type: Number
  },
  profile_pic: {
    type: String,
    required: false
  }
},
{
    timestamps: true
});

export const Teacher = models.Teacher || mongoose.model("Teacher", teahcerSchema);