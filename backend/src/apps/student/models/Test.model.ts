import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IQuestion {
  questionNumber: number;
  questionText: string;
  questionType: 'mcq' | 'true-false' | 'short-answer' | 'essay';
  
  // MCQ options
  options?: string[];
  correctAnswer?: string | number; // For MCQ/true-false
  correctAnswers?: string[]; // For multiple correct answers
  
  // Scoring
  marks: number;
  negativeMarking?: number;
  
  // Media
  imageUrl?: string;
  
  // Explanation
  explanation?: string;
  
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface ITestAttempt {
  studentId: mongoose.Types.ObjectId;
  studentName: string;
  studentEmail: string;
  
  startedAt: Date;
  submittedAt?: Date;
  timeSpent: number; // in seconds
  
  answers: {
    questionNumber: number;
    answer: string | string[];
    isCorrect?: boolean;
    marksAwarded?: number;
  }[];
  
  // Scoring
  totalScore: number;
  percentage: number;
  status: 'in-progress' | 'submitted' | 'evaluated' | 'incomplete';
  
  // Grading (for subjective)
  gradedAt?: Date;
  gradedBy?: mongoose.Types.ObjectId;
  feedback?: string;
  
  attemptNumber: number;
}

export interface ITest extends Document {
  title: string;
  description: string;
  instructions?: string;
  
  // Subject-scoped: teacher can only create for their assigned subject
  subjectContentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  courseName: string;
  subjectName: string;
  moduleNumber?: number;
  moduleName?: string;
  
  // Teacher who created it
  teacherId: mongoose.Types.ObjectId;
  teacherName: string;
  teacherEmail: string;
  
  // Test details
  type: 'mcq' | 'mixed' | 'pdf' | 'subjective';
  category: 'quiz' | 'assignment' | 'mid-term' | 'final' | 'practice';
  
  // Questions
  questions: IQuestion[];
  totalQuestions: number;
  totalMarks: number;
  passingMarks?: number;
  
  // PDF test (if type is 'pdf')
  pdfUrl?: string;
  pdfFileName?: string;
  answerKeyUrl?: string;
  
  // Timing
  duration: number; // in minutes
  startTime?: Date;
  endTime?: Date;
  
  // Settings
  allowMultipleAttempts: boolean;
  maxAttempts?: number;
  showResultsImmediately: boolean;
  showCorrectAnswers: boolean;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  
  // Targeting
  targetAudience: 'all' | 'batch' | 'specific';
  batchIds?: mongoose.Types.ObjectId[];
  studentIds?: mongoose.Types.ObjectId[];
  
  // Attempts
  attempts: ITestAttempt[];
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

const testAttemptSchema = new Schema<ITestAttempt>({
  studentId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Student', 
    required: true 
  },
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true },
  
  startedAt: { type: Date, default: Date.now },
  submittedAt: { type: Date },
  timeSpent: { type: Number, default: 0 },
  
  answers: [{
    questionNumber: { type: Number, required: true },
    answer: { type: Schema.Types.Mixed, required: true },
    isCorrect: { type: Boolean },
    marksAwarded: { type: Number, min: 0 }
  }],
  
  totalScore: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['in-progress', 'submitted', 'evaluated', 'incomplete'],
    default: 'in-progress'
  },
  
  gradedAt: { type: Date },
  gradedBy: { type: Schema.Types.ObjectId, ref: 'Teacher' },
  feedback: { type: String },
  
  attemptNumber: { type: Number, default: 1 }
}, { _id: true, timestamps: true });

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
  
  attempts: [testAttemptSchema],
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

// Calculate derived fields before save
testSchema.pre('save', function(next) {
  this.totalQuestions = this.questions.length;
  this.totalMarks = this.questions.reduce((sum, q) => sum + q.marks, 0);
  this.totalAttempts = this.attempts.length;
  
  if (this.attempts.length > 0) {
    const evaluatedAttempts = this.attempts.filter(a => a.status === 'evaluated');
    if (evaluatedAttempts.length > 0) {
      this.avgScore = evaluatedAttempts.reduce((sum, a) => sum + a.totalScore, 0) / evaluatedAttempts.length;
      const passed = evaluatedAttempts.filter(a => 
        this.passingMarks ? a.totalScore >= this.passingMarks : a.percentage >= 40
      ).length;
      this.passRate = (passed / evaluatedAttempts.length) * 100;
    }
  }
  
  next();
});

const Test: Model<ITest> = 
  mongoose.models.Test || 
  mongoose.model<ITest>('Test', testSchema);

export default Test;
