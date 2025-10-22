import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISubmission {
  studentId: mongoose.Types.ObjectId;
  studentName: string;
  studentEmail: string;
  
  submittedAt: Date;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  textAnswer?: string;
  
  // Grading
  status: 'submitted' | 'graded' | 'returned' | 'late';
  score?: number;
  feedback?: string;
  gradedAt?: Date;
  gradedBy?: mongoose.Types.ObjectId;
  
  attemptNumber: number;
  isLate: boolean;
}

export interface IAssignment extends Document {
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
  
  // Assignment details
  type: 'homework' | 'project' | 'lab' | 'essay' | 'presentation';
  totalMarks: number;
  passingMarks?: number;
  
  // Deadline
  assignedDate: Date;
  deadline: Date;
  allowLateSubmission: boolean;
  latePenalty?: number; // Percentage deduction
  
  // Targeting
  targetAudience: 'all' | 'batch' | 'specific';
  batchIds?: mongoose.Types.ObjectId[];
  studentIds?: mongoose.Types.ObjectId[];
  
  // Submissions
  submissions: ISubmission[];
  totalSubmissions: number;
  pendingGrading: number;
  
  // Attachments (reference materials)
  attachments?: {
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
  
  // Settings
  allowMultipleAttempts: boolean;
  maxAttempts?: number;
  requireFile: boolean;
  requireText: boolean;
  
  status: 'draft' | 'active' | 'closed' | 'archived';
  isActive: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

const submissionSchema = new Schema<ISubmission>({
  studentId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Student', 
    required: true 
  },
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true },
  
  submittedAt: { type: Date, default: Date.now },
  fileUrl: { type: String },
  fileName: { type: String },
  fileSize: { type: Number },
  textAnswer: { type: String },
  
  status: { 
    type: String, 
    enum: ['submitted', 'graded', 'returned', 'late'],
    default: 'submitted'
  },
  score: { type: Number, min: 0 },
  feedback: { type: String },
  gradedAt: { type: Date },
  gradedBy: { type: Schema.Types.ObjectId, ref: 'Teacher' },
  
  attemptNumber: { type: Number, default: 1 },
  isLate: { type: Boolean, default: false }
}, { _id: true, timestamps: true });

const assignmentSchema = new Schema<IAssignment>({
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
    enum: ['homework', 'project', 'lab', 'essay', 'presentation'],
    default: 'homework'
  },
  totalMarks: { type: Number, required: true, min: 0 },
  passingMarks: { type: Number, min: 0 },
  
  assignedDate: { type: Date, default: Date.now },
  deadline: { type: Date, required: true },
  allowLateSubmission: { type: Boolean, default: true },
  latePenalty: { type: Number, min: 0, max: 100, default: 10 },
  
  targetAudience: { 
    type: String, 
    enum: ['all', 'batch', 'specific'],
    default: 'all'
  },
  batchIds: [{ type: Schema.Types.ObjectId, ref: 'Batch' }],
  studentIds: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
  
  submissions: [submissionSchema],
  totalSubmissions: { type: Number, default: 0 },
  pendingGrading: { type: Number, default: 0 },
  
  attachments: [{
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, required: true },
    size: { type: Number, required: true }
  }],
  
  allowMultipleAttempts: { type: Boolean, default: false },
  maxAttempts: { type: Number, min: 1, default: 1 },
  requireFile: { type: Boolean, default: true },
  requireText: { type: Boolean, default: false },
  
  status: { 
    type: String, 
    enum: ['draft', 'active', 'closed', 'archived'],
    default: 'draft'
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Indexes
assignmentSchema.index({ teacherId: 1, subjectName: 1, status: 1 });
assignmentSchema.index({ courseId: 1, status: 1 });
assignmentSchema.index({ deadline: 1, status: 1 });
assignmentSchema.index({ 'submissions.studentId': 1 });

// Update submission counts before save
assignmentSchema.pre('save', function(next) {
  this.totalSubmissions = this.submissions.length;
  this.pendingGrading = this.submissions.filter(s => s.status === 'submitted').length;
  next();
});

const Assignment: Model<IAssignment> = 
  mongoose.models.Assignment || 
  mongoose.model<IAssignment>('Assignment', assignmentSchema);

export default Assignment;
