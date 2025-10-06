import mongoose, { Schema, models, Model } from 'mongoose';

export interface IAttendanceRecord {
  student: mongoose.Types.ObjectId;
  joinedAt: Date;
  leftAt?: Date;
}

export interface ILiveClass extends mongoose.Document {
  course: mongoose.Types.ObjectId;
  subject: string;
  chapter?: mongoose.Types.ObjectId;
  scheduledAt: Date;
  durationMinutes: number;
  platform: 'jitsi' | 'zoom' | 'custom';
  meetingUrl: string;
  recordingUrl?: string;
  attendance: IAttendanceRecord[];
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendanceRecord>({
  student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  joinedAt: { type: Date, required: true },
  leftAt: { type: Date },
});

const liveClassSchema = new Schema<ILiveClass>({
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  subject: { type: String, required: true },
  chapter: { type: Schema.Types.ObjectId, ref: 'Chapter' },
  scheduledAt: { type: Date, required: true },
  durationMinutes: { type: Number, required: true },
  platform: { type: String, enum: ['jitsi', 'zoom', 'custom'], default: 'jitsi' },
  meetingUrl: { type: String, required: true },
  recordingUrl: { type: String },
  attendance: { type: [attendanceSchema], default: [] },
}, { timestamps: true });

const LiveClass: Model<ILiveClass> = models.LiveClass || mongoose.model<ILiveClass>('LiveClass', liveClassSchema);

export default LiveClass;
