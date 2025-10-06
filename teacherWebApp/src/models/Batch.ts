import mongoose, { Schema, models, Model } from 'mongoose';

export interface IBatch extends mongoose.Document {
  name: string;
  course: mongoose.Types.ObjectId;
  students: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const batchSchema = new Schema<IBatch>({
  name: { type: String, required: true },
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  students: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
}, { timestamps: true });

const Batch: Model<IBatch> = models.Batch || mongoose.model<IBatch>('Batch', batchSchema);

export default Batch;
