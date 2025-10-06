import mongoose, { Schema, models, Model } from 'mongoose';

export interface IAnnouncement extends mongoose.Document {
  title: string;
  message: string;
  course?: mongoose.Types.ObjectId;
  batch?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const announcementSchema = new Schema<IAnnouncement>({
  title: { type: String, required: true },
  message: { type: String, required: true },
  course: { type: Schema.Types.ObjectId, ref: 'Course' },
  batch: { type: Schema.Types.ObjectId, ref: 'Batch' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
}, { timestamps: true });

const Announcement: Model<IAnnouncement> = models.Announcement || mongoose.model<IAnnouncement>('Announcement', announcementSchema);

export default Announcement;
