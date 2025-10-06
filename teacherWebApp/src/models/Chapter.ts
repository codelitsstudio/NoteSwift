import mongoose, { Schema, models, Model } from 'mongoose';

export interface IChapter extends mongoose.Document {
  course: mongoose.Types.ObjectId;
  title: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const chapterSchema = new Schema<IChapter>({
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

const Chapter: Model<IChapter> = models.Chapter || mongoose.model<IChapter>('Chapter', chapterSchema);

export default Chapter;
