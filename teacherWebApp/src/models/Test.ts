import mongoose, { Schema, models, Model } from 'mongoose';

export type QuestionType = 'mcq' | 'numerical' | 'short' | 'long';

export interface IQuestion extends mongoose.Document {
  questionNumber: number;
  questionText: string;
  questionType: 'mcq' | 'true-false' | 'short-answer' | 'essay';
  options?: string[];
  correctAnswer?: string | number;
  correctAnswers?: string[];
  marks: number;
  negativeMarking?: number;
  imageUrl?: string;
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface ITest extends mongoose.Document {
  title: string;
  description: string;
  instructions?: string;
  subjectContentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  courseName: string;
  subjectName: string;
  moduleNumber?: number;
  moduleName?: string;
  teacherId: mongoose.Types.ObjectId;
  teacherName: string;
  teacherEmail: string;
  type: 'mcq' | 'mixed' | 'pdf' | 'subjective';
  category: 'quiz' | 'assignment' | 'mid-term' | 'final' | 'practice';
  questions: IQuestion[];
  totalQuestions: number;
  totalMarks: number;
  passingMarks?: number;
  pdfUrl?: string;
  pdfFileName?: string;
  answerKeyUrl?: string;
  duration: number;
  startTime?: Date;
  endTime?: Date;
  allowMultipleAttempts: boolean;
  maxAttempts?: number;
  showResultsImmediately: boolean;
  showCorrectAnswers: boolean;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  targetAudience: 'all' | 'batch' | 'specific';
  batchIds?: mongoose.Types.ObjectId[];
  studentIds?: mongoose.Types.ObjectId[];
  attempts: any[];
  totalAttempts: number;
  avgScore?: number;
  passRate?: number;
  status: 'draft' | 'scheduled' | 'active' | 'closed' | 'archived';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema<IQuestion>({
  questionNumber: { type: Number, required: true },
  questionText: { type: String, required: true },
  questionType: { 
    type: String, 
    enum: ['mcq', 'true-false', 'short-answer', 'essay'],
    required: true
  },
  options: [{ type: String }],
  correctAnswer: { type: Schema.Types.Mixed },
  correctAnswers: [{ type: String }],
  marks: { type: Number, required: true, min: 0 },
  negativeMarking: { type: Number, min: 0, default: 0 },
  imageUrl: { type: String },
  explanation: { type: String },
  difficulty: { 
    type: String, 
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  }
}, { _id: false });

const testSchema = new Schema<ITest>({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  instructions: { type: String },
  subjectContentId: { 
    type: Schema.Types.ObjectId, 
    ref: 'SubjectContent', 
    required: true,
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
  teacherId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Teacher', 
    required: true,
    index: true 
  },
  teacherName: { type: String, required: true },
  teacherEmail: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['mcq', 'mixed', 'pdf', 'subjective'],
    required: true
  },
  category: { 
    type: String, 
    enum: ['quiz', 'assignment', 'mid-term', 'final', 'practice'],
    default: 'quiz'
  },
  questions: [questionSchema],
  totalQuestions: { type: Number, default: 0 },
  totalMarks: { type: Number, default: 0 },
  passingMarks: { type: Number },
  pdfUrl: { type: String },
  pdfFileName: { type: String },
  answerKeyUrl: { type: String },
  duration: { type: Number, required: true, min: 0 },
  startTime: { type: Date },
  endTime: { type: Date },
  allowMultipleAttempts: { type: Boolean, default: false },
  maxAttempts: { type: Number, min: 1, default: 1 },
  showResultsImmediately: { type: Boolean, default: true },
  showCorrectAnswers: { type: Boolean, default: true },
  shuffleQuestions: { type: Boolean, default: false },
  shuffleOptions: { type: Boolean, default: false },
  targetAudience: { 
    type: String, 
    enum: ['all', 'batch', 'specific'],
    default: 'all'
  },
  batchIds: [{ type: Schema.Types.ObjectId, ref: 'Batch' }],
  studentIds: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
  attempts: [{ type: Schema.Types.Mixed }],
  totalAttempts: { type: Number, default: 0 },
  avgScore: { type: Number },
  passRate: { type: Number },
  status: { 
    type: String, 
    enum: ['draft', 'scheduled', 'active', 'closed', 'archived'],
    default: 'draft'
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Indexes
testSchema.index({ teacherId: 1, subjectName: 1, status: 1 });
testSchema.index({ courseId: 1, status: 1 });
testSchema.index({ startTime: 1, endTime: 1 });
testSchema.index({ 'attempts.studentId': 1 });

export const Question: Model<IQuestion> = models.Question || mongoose.model<IQuestion>('Question', questionSchema);

const Test: Model<ITest> = 
  (() => {
    // Clear any cached model
    delete mongoose.models.Test;
    return mongoose.model<ITest>('Test', testSchema);
  })();

export default Test;
