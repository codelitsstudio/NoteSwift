import mongoose, { Schema, models, Model } from 'mongoose';

export type ContentType = 'video' | 'pdf' | 'slides' | 'assignment' | 'question_bank';

export interface IContent extends mongoose.Document {
  chapter: mongoose.Types.ObjectId;
  type: ContentType;
  title: string;
  description?: string;
  url?: string;
  attachments?: { name: string; url: string }[];
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const contentSchema = new Schema<IContent>({
  chapter: { type: Schema.Types.ObjectId, ref: 'Chapter', required: true },
  type: { type: String, enum: ['video', 'pdf', 'slides', 'assignment', 'question_bank'], required: true },
  title: { type: String, required: true },
  description: { type: String },
  url: { type: String },
  attachments: [{ name: String, url: String }],
  deadline: { type: Date },
}, { timestamps: true });

const Content: Model<IContent> = models.Content || mongoose.model<IContent>('Content', contentSchema);

export default Content;
