import mongoose, { Schema, models, Model } from 'mongoose';

export interface IStudent extends mongoose.Document {
  name: string;
  email: string;
  batches: mongoose.Types.ObjectId[];
  courses: mongoose.Types.ObjectId[];
  progress: {
    [courseId: string]: {
      chaptersCompleted: number;
      timeSpentMinutes: number;
      testsTaken: number;
      averageScore: number;
    }
  };
  createdAt: Date;
  updatedAt: Date;
}

const studentSchema = new Schema<IStudent>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  batches: [{ type: Schema.Types.ObjectId, ref: 'Batch' }],
  courses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
  progress: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true });

const Student: Model<IStudent> = models.Student || mongoose.model<IStudent>('Student', studentSchema);

export default Student;
