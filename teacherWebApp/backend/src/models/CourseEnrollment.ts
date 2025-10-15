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
    sectionsCompleted: number[];
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
  updateModuleProgress(moduleNumber: number, videoCompleted?: boolean, sectionIndex?: number): Promise<ICourseEnrollment>;
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
    sectionsCompleted: {
      type: [Number],
      default: []
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

// Unified overall progress calculation: average of all module progresses
courseEnrollmentSchema.methods.calculateOverallProgress = function(this: ICourseEnrollment): number {
  if (!this.moduleProgress || this.moduleProgress.length === 0) return 0;
  const totalProgress = this.moduleProgress.reduce((sum, module) => sum + (typeof module.progress === 'number' ? module.progress : 0), 0);
  return Math.round(totalProgress / this.moduleProgress.length);
};

// Unified module progress update logic
courseEnrollmentSchema.methods.updateModuleProgress = async function(
  this: ICourseEnrollment,
  moduleNumber: number,
  videoCompleted?: boolean,
  sectionIndex?: number
): Promise<ICourseEnrollment> {
  // Section breakdowns for each module (user spec)
  const sectionCounts: Record<string, number> = { '1': 8, '2': 4, '3': 3, '4': 4, '5': 5 };
  const sectionWeights: Record<string, number> = { '1': 6.25, '2': 25, '3': 33.33, '4': 25, '5': 20 };

  let moduleEntry = this.moduleProgress.find(m => m.moduleNumber === moduleNumber);
  if (!moduleEntry) {
    moduleEntry = {
      moduleNumber,
      videoCompleted: false,
      notesCompleted: false,
      sectionsCompleted: [],
      progress: 0
    };
    this.moduleProgress.push(moduleEntry);
  }

  // Video completion (Module 1 only)
  if (moduleNumber === 1 && videoCompleted) {
    moduleEntry.videoCompleted = true;
    moduleEntry.videoCompletedAt = new Date();
  }

  // Section completion
  if (typeof sectionIndex === 'number') {
    if (!moduleEntry.sectionsCompleted.includes(sectionIndex)) {
      moduleEntry.sectionsCompleted.push(sectionIndex);
    }
  }

  // Calculate module progress
  let moduleProgress = 0;
  if (moduleNumber === 1) {
    // Video = 50%
    if (moduleEntry.videoCompleted) moduleProgress += 50;
    // Notes = 50% split across 8 sections
    const notesProgress = (moduleEntry.sectionsCompleted.length * sectionWeights['1']);
    moduleProgress += Math.min(notesProgress, 50);
    if (moduleEntry.sectionsCompleted.length === sectionCounts['1']) {
      moduleEntry.notesCompleted = true;
      moduleEntry.notesCompletedAt = new Date();
    }
  } else if (sectionCounts[String(moduleNumber)]) {
    // Modules 2-5: notes only
    const notesProgress = (moduleEntry.sectionsCompleted.length * sectionWeights[String(moduleNumber)]);
    moduleProgress += Math.min(notesProgress, 100);
    if (moduleEntry.sectionsCompleted.length === sectionCounts[String(moduleNumber)]) {
      moduleEntry.notesCompleted = true;
      moduleEntry.notesCompletedAt = new Date();
    }
  }
  moduleEntry.progress = Math.round(moduleProgress * 100) / 100;

  // Update overall progress
  this.progress = this.calculateOverallProgress();

  // Mark as completed if all modules are 100%
  if (this.progress === 100 && !this.completedAt) {
    this.completedAt = new Date();
  }

  // Mark the moduleProgress as modified for Mongoose to detect changes
  this.markModified('moduleProgress');

  this.lastAccessedAt = new Date();
  await this.save();
  return this;
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