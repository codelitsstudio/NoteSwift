import mongoose, { Schema, Document } from 'mongoose';

export interface IChatHistory extends Document {
  studentId: mongoose.Types.ObjectId;
  chatId: string;
  title: string;
  lastMessage: string;
  courseTitle?: string;
  courseId?: string;
  subjectName?: string;
  moduleName?: string;
  messages: Array<{
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const ChatHistorySchema = new Schema<IChatHistory>({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  chatId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  lastMessage: {
    type: String,
    required: true
  },
  courseTitle: {
    type: String
  },
  courseId: {
    type: String
  },
  subjectName: {
    type: String
  },
  moduleName: {
    type: String
  },
  messages: [{
    id: String,
    text: String,
    sender: {
      type: String,
      enum: ['user', 'ai']
    },
    timestamp: String
  }]
}, {
  timestamps: true
});

// Index for efficient queries
ChatHistorySchema.index({ studentId: 1, createdAt: -1 });
ChatHistorySchema.index({ createdAt: 1 }, {
  expireAfterSeconds: 10 * 24 * 60 * 60 // 10 days
});

export const ChatHistory = mongoose.model<IChatHistory>('ChatHistory', ChatHistorySchema);