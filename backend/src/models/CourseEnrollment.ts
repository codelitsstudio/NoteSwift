// backend/models/CourseEnrollment.ts
import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ICourseEnrollment extends Document {
  _id: mongoose.Types.ObjectId;
  id: string;
  courseId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  enrolledAt: Date;
  progress: number;
  isActive: boolean;
  completedAt?: Date;
  lastAccessedAt: Date;
  completedLessons: Array<{
    lessonId: mongoose.Types.ObjectId;
    completedAt: Date;
  }>;
  moduleProgress: Array<{
    moduleNumber: number;
    videoCompleted: boolean;
    videoCompletedAt?: Date;
    notesCompleted: boolean;
    notesCompletedAt?: Date;
    progress: number; // 0-100 based on video (50%) + notes (50%)
  }>;
  assessments: Array<{
    assessmentId: mongoose.Types.ObjectId;
    score: number;
    attemptedAt: Date;
    passed: boolean;
  }>;
  certificate: {
    issued: boolean;
    issuedAt?: Date;
    certificateId?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  
  // Instance methods
  updateProgress(): Promise<ICourseEnrollment>;
  calculateOverallProgress(): number;
  updateModuleProgress(moduleNumber: number, videoCompleted?: boolean, notesCompleted?: boolean): Promise<ICourseEnrollment>;
  markComplete(): Promise<ICourseEnrollment>;
}

export interface ICourseEnrollmentModel extends Model<ICourseEnrollment> {
  findActiveEnrollments(studentId: string): Promise<ICourseEnrollment[]>;
  isEnrolled(studentId: string, courseId: string): Promise<boolean>;
}

const courseEnrollmentSchema = new Schema<ICourseEnrollment>({
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  completedAt: {
    type: Date,
    default: null
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  completedLessons: [{
    lessonId: {
      type: Schema.Types.ObjectId,
      required: true
    },
    completedAt: {
      type: Date,
      default: Date.now
    }
  }],
  moduleProgress: [{
    moduleNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    videoCompleted: {
      type: Boolean,
      default: false
    },
    videoCompletedAt: {
      type: Date,
      default: null
    },
    notesCompleted: {
      type: Boolean,
      default: false
    },
    notesCompletedAt: {
      type: Date,
      default: null
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  }],
  assessments: [{
    assessmentId: {
      type: Schema.Types.ObjectId,
      required: true
    },
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    attemptedAt: {
      type: Date,
      default: Date.now
    },
    passed: {
      type: Boolean,
      default: false
    }
  }],
  certificate: {
    issued: {
      type: Boolean,
      default: false
    },
    issuedAt: {
      type: Date,
      default: null
    },
    certificateId: {
      type: String,
      unique: true,
      sparse: true
    }
  }
}, {
  timestamps: true
});

// Compound indexes for better query performance
courseEnrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
courseEnrollmentSchema.index({ studentId: 1, isActive: 1 });
courseEnrollmentSchema.index({ courseId: 1, isActive: 1 });
courseEnrollmentSchema.index({ enrolledAt: -1 });

// Instance methods
courseEnrollmentSchema.methods.updateProgress = function(this: ICourseEnrollment): Promise<ICourseEnrollment> {
  this.lastAccessedAt = new Date();
  return this.save();
};

courseEnrollmentSchema.methods.calculateOverallProgress = function(this: ICourseEnrollment): number {
  if (this.moduleProgress.length === 0) return 0;
  
  const totalProgress = this.moduleProgress.reduce((sum, module) => sum + module.progress, 0);
  return Math.round(totalProgress / this.moduleProgress.length);
};

courseEnrollmentSchema.methods.updateModuleProgress = function(
  this: ICourseEnrollment, 
  moduleNumber: number, 
  videoCompleted?: boolean, 
  notesCompleted?: boolean
): Promise<ICourseEnrollment> {
  // Find or create module progress entry
  let moduleEntry = this.moduleProgress.find(m => m.moduleNumber === moduleNumber);
  if (!moduleEntry) {
    moduleEntry = {
      moduleNumber,
      videoCompleted: false,
      notesCompleted: false,
      progress: 0
    };
    this.moduleProgress.push(moduleEntry);
  }

  // Update completion status
  if (videoCompleted !== undefined) {
    moduleEntry.videoCompleted = videoCompleted;
    if (videoCompleted && !moduleEntry.videoCompletedAt) {
      moduleEntry.videoCompletedAt = new Date();
    }
  }

  if (notesCompleted !== undefined) {
    moduleEntry.notesCompleted = notesCompleted;
    if (notesCompleted && !moduleEntry.notesCompletedAt) {
      moduleEntry.notesCompletedAt = new Date();
    }
  }

  // Calculate module progress
  let moduleProgress = 0;
  if (moduleNumber === 1) {
    // Module 1: 50% video + 50% notes
    if (moduleEntry.videoCompleted) moduleProgress += 50;
    if (moduleEntry.notesCompleted) moduleProgress += 50;
  } else {
    // Modules 2-5: 100% notes only
    if (moduleEntry.notesCompleted) moduleProgress = 100;
  }
  moduleEntry.progress = moduleProgress;

  // Update overall progress
  this.progress = this.calculateOverallProgress();
  
  // Mark as completed if all modules are 100%
  if (this.progress === 100 && !this.completedAt) {
    this.completedAt = new Date();
  }

  this.lastAccessedAt = new Date();
  return this.save();
};

courseEnrollmentSchema.methods.markComplete = function(this: ICourseEnrollment): Promise<ICourseEnrollment> {
  this.progress = 100;
  this.completedAt = new Date();
  this.isActive = false;
  return this.save();
};

// Static methods
courseEnrollmentSchema.statics.findActiveEnrollments = function(studentId: string) {
  return this.find({ studentId, isActive: true }).populate('courseId');
};

courseEnrollmentSchema.statics.isEnrolled = async function(studentId: string, courseId: string): Promise<boolean> {
  const enrollment = await this.findOne({ studentId, courseId });
  return !!enrollment;
};

// Virtual for ID compatibility
courseEnrollmentSchema.virtual('id').get(function(this: ICourseEnrollment) {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
courseEnrollmentSchema.set('toJSON', {
  virtuals: true
});

export default (mongoose.models.CourseEnrollment as mongoose.Model<ICourseEnrollment, ICourseEnrollmentModel>) || mongoose.model<ICourseEnrollment, ICourseEnrollmentModel>('CourseEnrollment', courseEnrollmentSchema);