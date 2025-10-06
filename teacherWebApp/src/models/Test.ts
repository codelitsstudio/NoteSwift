import mongoose, { Schema, models, Model } from 'mongoose';

export type QuestionType = 'mcq' | 'numerical' | 'short' | 'long';

export interface IQuestion extends mongoose.Document {
  test: mongoose.Types.ObjectId;
  type: QuestionType;
  text: string;
  options?: { key: string; text: string }[];
  correctAnswer?: string | string | number;
  points: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  usesLatex?: boolean;
}

export interface ITest extends mongoose.Document {
  course: mongoose.Types.ObjectId;
  chapter?: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  scheduledAt?: Date;
  durationMinutes?: number;
  assignedBatches?: mongoose.Types.ObjectId[];
  assignedStudents?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema<IQuestion>({
  test: { type: Schema.Types.ObjectId, ref: 'Test', required: true },
  type: { type: String, enum: ['mcq', 'numerical', 'short', 'long'], required: true },
  text: { type: String, required: true },
  options: [{ key: String, text: String }],
  correctAnswer: { type: Schema.Types.Mixed },
  points: { type: Number, default: 1 },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  usesLatex: { type: Boolean, default: false },
});

const testSchema = new Schema<ITest>({
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  chapter: { type: Schema.Types.ObjectId, ref: 'Chapter' },
  title: { type: String, required: true },
  description: { type: String },
  scheduledAt: { type: Date },
  durationMinutes: { type: Number },
  assignedBatches: [{ type: Schema.Types.ObjectId, ref: 'Batch' }],
  assignedStudents: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
}, { timestamps: true });

export const Question: Model<IQuestion> = models.Question || mongoose.model<IQuestion>('Question', questionSchema);

const Test: Model<ITest> = models.Test || mongoose.model<ITest>('Test', testSchema);

export default Test;
