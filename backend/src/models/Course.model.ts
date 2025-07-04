import mongoose, { Schema, models } from 'mongoose';
import { TCourse } from "@shared/model/common/Course";

const courseSchema = new Schema<TCourse>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  subject: { type: String, required: true },
  tags: { type: [String], default: [] },
  status: { type: String, default: 'Draft' },
}, {timestamps: true});

const Course = models.Course || mongoose.model('Course', courseSchema);

export default Course;
