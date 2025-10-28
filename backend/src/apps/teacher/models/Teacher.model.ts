import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAssignedCourse {
  courseId: string;
  courseName: string;
  subject: string;
  assignedAt: Date;
}

export interface ITeacher extends Document {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  gender?: string;
  profilePhoto?: string;
  address?: any;
  institution?: any;
  subjects?: any[];
  qualifications?: any[];
  experience?: any;
  bio?: string;
  verificationDocuments?: any;
  agreementAccepted?: boolean;
  termsAcceptedAt?: Date;
  onboardingStep?: string;
  onboardingComplete?: boolean;
  registrationStatus?: 'pending' | 'approved' | 'rejected';
  approvalStatus?: string;
  status?: string;
  rejectionReason?: string;
  approvedAt?: Date;
  approvedBy?: mongoose.Types.ObjectId;
  isEmailVerified?: boolean;
  emailVerificationCode?: string;
  emailVerificationExpiry?: Date;
  assignedCourses?: IAssignedCourse[];
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const assignedCourseSchema = new Schema<IAssignedCourse>({
  courseId: { type: String, required: true },
  courseName: { type: String, required: true },
  subject: { type: String, required: true },
  assignedAt: { type: Date, default: Date.now },
}, { _id: false });

const teacherSchema = new Schema<ITeacher>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  firstName: String,
  lastName: String,
  fullName: String,
  phoneNumber: String,
  dateOfBirth: Date,
  gender: String,
  profilePhoto: String,
  address: { type: Schema.Types.Mixed },
  institution: { type: Schema.Types.Mixed },
  subjects: { type: Array, default: [] },
  qualifications: { type: Array, default: [] },
  experience: { type: Schema.Types.Mixed },
  bio: String,
  verificationDocuments: { type: Schema.Types.Mixed },
  agreementAccepted: { type: Boolean, default: false },
  termsAcceptedAt: Date,
  onboardingStep: { type: String, default: 'personal' },
  onboardingComplete: { type: Boolean, default: false },
  status: String,
  approvalStatus: String,
  registrationStatus: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: String,
  approvedAt: Date,
  approvedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationCode: String,
  emailVerificationExpiry: Date,
  assignedCourses: { type: [assignedCourseSchema], default: [] },
  isActive: { type: Boolean, default: true }
}, { timestamps: true, strict: false });

// Update fullName before save
teacherSchema.pre('save', function(next) {
  if (this.firstName && this.lastName) {
    this.fullName = `${this.firstName} ${this.lastName}`;
  }
  next();
});

const Teacher: Model<ITeacher> = 
  mongoose.models.teacher || 
  mongoose.model<ITeacher>('teacher', teacherSchema, 'teachers');

export default Teacher;
