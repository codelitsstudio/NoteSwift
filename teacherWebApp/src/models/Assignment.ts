import mongoose, { Schema, models, Model } from 'mongoose';

export interface ISubmission extends mongoose.Document {
  assignment: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  submittedAt: Date;
  answers: any;
  score?: number;
  graded: boolean;
  feedback?: string;
}

export interface IAssignment extends mongoose.Document {
  course: mongoose.Types.ObjectId;
  chapter?: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  deadline?: Date;
  attachments?: { name: string; url: string }[];
  createdAt: Date;
  updatedAt: Date;
}

const submissionSchema = new Schema<ISubmission>({
  assignment: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
  student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  submittedAt: { type: Date, required: true },
  answers: { type: Schema.Types.Mixed },
  score: { type: Number },
  graded: { type: Boolean, default: false },
  feedback: { type: String },
});

const assignmentSchema = new Schema<IAssignment>({
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  chapter: { type: Schema.Types.ObjectId, ref: 'Chapter' },
  title: { type: String, required: true },
  description: { type: String },
  deadline: { type: Date },
  attachments: [{ name: String, url: String }],
}, { timestamps: true });

export const Submission: Model<ISubmission> = models.Submission || mongoose.model<ISubmission>('Submission', submissionSchema);

const Assignment: Model<IAssignment> = models.Assignment || mongoose.model<IAssignment>('Assignment', assignmentSchema);

export default Assignment;
