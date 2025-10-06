import mongoose, { Schema, Model, models } from 'mongoose';

export interface IFeedback extends mongoose.Document {
  teacher?: mongoose.Types.ObjectId;
  rating: number;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

const feedbackSchema = new Schema<IFeedback>({
  teacher: { type: Schema.Types.ObjectId, ref: 'Teacher' },
  rating: { type: Number, min: 1, max: 5, required: true },
  message: { type: String, required: true },
}, { timestamps: true });

const Feedback: Model<IFeedback> = models.Feedback || mongoose.model<IFeedback>('Feedback', feedbackSchema);

export default Feedback;
