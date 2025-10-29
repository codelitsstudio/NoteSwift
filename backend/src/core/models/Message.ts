import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  studentId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  subjectName: string;
  courseName: string;
  message: string;
  senderType: 'student' | 'teacher';
  timestamp: Date;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  teacherId: {
    type: Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  subjectName: {
    type: String,
    required: true
  },
  courseName: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  senderType: {
    type: String,
    enum: ['student', 'teacher'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
MessageSchema.index({ studentId: 1, teacherId: 1, subjectName: 1, createdAt: -1 });
MessageSchema.index({ teacherId: 1, createdAt: -1 });
MessageSchema.index({ studentId: 1, teacherId: 1, subjectName: 1, isRead: 1 });

// Virtual for conversation ID (student-teacher-subject combination)
MessageSchema.virtual('conversationId').get(function() {
  return `${this.studentId}-${this.teacherId}-${this.subjectName}`;
});

export const Message = mongoose.model<IMessage>('Message', MessageSchema);