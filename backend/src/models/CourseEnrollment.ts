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