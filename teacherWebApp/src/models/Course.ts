import mongoose, { Schema, models } from 'mongoose';

const courseSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  subject: { type: String, required: true },
  tags: { type: [String], default: [] },
  status: { type: String, default: 'Draft' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Course = models.Course || mongoose.model('Course', courseSchema);

export default Course;
