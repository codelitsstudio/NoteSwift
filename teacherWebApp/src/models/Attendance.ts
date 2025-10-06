import mongoose, { Schema, models, Model } from 'mongoose';

export interface IAttendance extends mongoose.Document {
  student: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  date: Date;
  status: 'present' | 'absent' | 'late';
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>({
  student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['present', 'absent', 'late'], required: true },
  note: { type: String },
}, { timestamps: true });

const Attendance: Model<IAttendance> = models.Attendance || mongoose.model<IAttendance>('Attendance', attendanceSchema);

export default Attendance;
