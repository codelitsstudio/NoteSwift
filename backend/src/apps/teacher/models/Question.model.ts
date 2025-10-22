import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAnswer {
  answeredBy: mongoose.Types.ObjectId; // Teacher or Student ID
  answeredByName: string;
  answeredByRole: 'teacher' | 'student' | 'admin';
  answerText: string;
  attachments?: {
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
  isAccepted: boolean; // Mark as best answer
  upvotes: mongoose.Types.ObjectId[];
  downvotes: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IQuestion extends Document {
  title: string;
  questionText: string;
  tags?: string[];
  
  // Subject-scoped: question belongs to a subject
  subjectContentId?: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  courseName: string;
  subjectName: string;
  moduleNumber?: number;
  moduleName?: string;
  topicName?: string;
  
  // Student who asked
  studentId: mongoose.Types.ObjectId;
  studentName: string;
  studentEmail: string;
  
  // Privacy
  isAnonymous: boolean;
  isPublic: boolean; // Visible to all students in course or just teacher
  
  // Attachments
  attachments?: {
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
  
  // Priority (can be set by teacher)
  priority: 'low' | 'medium' | 'high';
  
  // Status
  status: 'pending' | 'answered' | 'resolved' | 'closed';
  
  // Answers
  answers: IAnswer[];
  acceptedAnswerId?: mongoose.Types.ObjectId;
  
  // Teacher assignment
  assignedToTeacherId?: mongoose.Types.ObjectId;
  assignedToTeacherName?: string;
  
  // Engagement
  views: number;
  upvotes: mongoose.Types.ObjectId[];
  downvotes: mongoose.Types.ObjectId[];
  
  // Resolution
  resolvedAt?: Date;
  resolvedBy?: mongoose.Types.ObjectId;
  
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const answerSchema = new Schema<IAnswer>({
  answeredBy: { 
    type: Schema.Types.ObjectId, 
    refPath: 'answers.answeredByRole',
    required: true 
  },
  answeredByName: { type: String, required: true },
  answeredByRole: { 
    type: String, 
    enum: ['teacher', 'student', 'admin'],
    required: true 
  },
  answerText: { type: String, required: true },
  attachments: [{
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, required: true },
    size: { type: Number, required: true }
  }],
  isAccepted: { type: Boolean, default: false },
  upvotes: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
  downvotes: [{ type: Schema.Types.ObjectId, ref: 'Student' }]
}, { _id: true, timestamps: true });

const questionSchema = new Schema<IQuestion>({
  title: { type: String, required: true, trim: true },
  questionText: { type: String, required: true },
  tags: [{ type: String, trim: true }],
  
  subjectContentId: { 
    type: Schema.Types.ObjectId, 
    ref: 'SubjectContent',
    index: true 
  },
  courseId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true,
    index: true 
  },
  courseName: { type: String, required: true },
  subjectName: { type: String, required: true },
  moduleNumber: { type: Number },
  moduleName: { type: String },
  topicName: { type: String },
  
  studentId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Student', 
    required: true,
    index: true 
  },
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true },
  
  isAnonymous: { type: Boolean, default: false },
  isPublic: { type: Boolean, default: true },
  
  attachments: [{
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, required: true },
    size: { type: Number, required: true }
  }],
  
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  
  status: { 
    type: String, 
    enum: ['pending', 'answered', 'resolved', 'closed'],
    default: 'pending',
    index: true
  },
  
  answers: [answerSchema],
  acceptedAnswerId: { type: Schema.Types.ObjectId },
  
  assignedToTeacherId: { type: Schema.Types.ObjectId, ref: 'Teacher' },
  assignedToTeacherName: { type: String },
  
  views: { type: Number, default: 0 },
  upvotes: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
  downvotes: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
  
  resolvedAt: { type: Date },
  resolvedBy: { type: Schema.Types.ObjectId },
  
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Indexes
questionSchema.index({ courseId: 1, subjectName: 1, status: 1 });
questionSchema.index({ studentId: 1, status: 1 });
questionSchema.index({ assignedToTeacherId: 1, status: 1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ createdAt: -1 });

// Text search index
questionSchema.index({ title: 'text', questionText: 'text', tags: 'text' });

const Question: Model<IQuestion> = 
  mongoose.models.Question || 
  mongoose.model<IQuestion>('Question', questionSchema);

export default Question;
