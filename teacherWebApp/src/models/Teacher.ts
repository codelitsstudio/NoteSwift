import mongoose, { Schema, models, Model } from 'mongoose';

export interface IAssignedCourse {
  courseId: mongoose.Types.ObjectId;
  courseName: string;
  subject: string;
  assignedAt: Date;
}

export interface ITeacher extends mongoose.Document {
  name: string;
  email: string;
  assignedCourses: IAssignedCourse[]; // Courses/subjects assigned by admin
  bio?: string;
  qualifications?: string;
  photoUrl?: string;
  earnings?: number;
  createdAt: Date;
  updatedAt: Date;
}

const teacherSchema = new Schema<ITeacher>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  assignedCourses: [{
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    courseName: { type: String, required: true },
    subject: { type: String, required: true },
    assignedAt: { type: Date, default: Date.now }
  }],
  bio: { type: String },
  qualifications: { type: String },
  photoUrl: { type: String },
  earnings: { type: Number, default: 0 },
}, { timestamps: true });

const Teacher: Model<ITeacher> = models.Teacher || mongoose.model<ITeacher>('Teacher', teacherSchema);

export default Teacher;
