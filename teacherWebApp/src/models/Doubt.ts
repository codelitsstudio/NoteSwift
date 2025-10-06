import mongoose, { Schema, models, Model } from 'mongoose';

export interface IMessage {
  senderType: 'student' | 'teacher';
  sender: mongoose.Types.ObjectId;
  text?: string;
  attachments?: { name: string; url: string; type?: string }[];
  createdAt: Date;
}

export interface IDoubt extends mongoose.Document {
  course?: mongoose.Types.ObjectId;
  subject?: string;
  chapter?: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  resolved: boolean;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>({
  senderType: { type: String, enum: ['student', 'teacher'], required: true },
  sender: { type: Schema.Types.ObjectId, required: true },
  text: { type: String },
  attachments: [{ name: String, url: String, type: String }],
  createdAt: { type: Date, default: Date.now },
});

const doubtSchema = new Schema<IDoubt>({
  course: { type: Schema.Types.ObjectId, ref: 'Course' },
  subject: { type: String },
  chapter: { type: Schema.Types.ObjectId, ref: 'Chapter' },
  student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'Teacher' },
  resolved: { type: Boolean, default: false },
  messages: { type: [messageSchema], default: [] },
}, { timestamps: true });

const Doubt: Model<IDoubt> = models.Doubt || mongoose.model<IDoubt>('Doubt', doubtSchema);

export default Doubt;
