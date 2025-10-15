import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBatch extends Document {
  name: string;
  code: string; // Unique batch code like "MATH-11-A"
  description?: string;
  
  // Subject-scoped: batch belongs to a specific subject
  subjectContentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  courseName: string;
  subjectName: string;
  
  // Teacher who manages it
  teacherId: mongoose.Types.ObjectId;
  teacherName: string;
  teacherEmail: string;
  
  // Students
  students: {
    studentId: mongoose.Types.ObjectId;
    studentName: string;
    studentEmail: string;
    enrolledAt: Date;
    status: 'active' | 'inactive' | 'dropped';
  }[];
  totalStudents: number;
  activeStudents: number;
  
  // Schedule (optional - for regular classes)
  schedule?: {
    dayOfWeek: number; // 0-6 (Sunday-Saturday)
    startTime: string; // "10:00"
    endTime: string; // "11:30"
  }[];
  
  // Batch settings
  maxStudents?: number;
  isPublic: boolean; // Can students self-enroll?
  requireApproval: boolean;
  
  // Dates
  startDate: Date;
  endDate?: Date;
  
  status: 'active' | 'completed' | 'archived';
  isActive: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

const batchSchema = new Schema<IBatch>({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true, index: true },
  description: { type: String },
  
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
  
  teacherId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Teacher', 
    required: true,
    index: true 
  },
  teacherName: { type: String, required: true },
  teacherEmail: { type: String, required: true },
  
  students: [{
    studentId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Student', 
      required: true 
    },
    studentName: { type: String, required: true },
    studentEmail: { type: String, required: true },
    enrolledAt: { type: Date, default: Date.now },
    status: { 
      type: String, 
      enum: ['active', 'inactive', 'dropped'],
      default: 'active'
    }
  }],
  totalStudents: { type: Number, default: 0 },
  activeStudents: { type: Number, default: 0 },
  
  schedule: [{
    dayOfWeek: { type: Number, min: 0, max: 6, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true }
  }],
  
  maxStudents: { type: Number, min: 1 },
  isPublic: { type: Boolean, default: false },
  requireApproval: { type: Boolean, default: true },
  
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  
  status: { 
    type: String, 
    enum: ['active', 'completed', 'archived'],
    default: 'active',
    index: true
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Indexes
batchSchema.index({ teacherId: 1, subjectName: 1, status: 1 });
batchSchema.index({ courseId: 1, status: 1 });
batchSchema.index({ 'students.studentId': 1 });

// Update student counts before save
batchSchema.pre('save', function(next) {
  this.totalStudents = this.students.length;
  this.activeStudents = this.students.filter(s => s.status === 'active').length;
  next();
});

const Batch: Model<IBatch> = 
  mongoose.models.Batch || 
  mongoose.model<IBatch>('Batch', batchSchema);

export default Batch;
