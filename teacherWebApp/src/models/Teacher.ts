import mongoose, { Schema, models, Model, Document } from 'mongoose';

export interface IAssignedCourse {
  courseId: string;
  courseName: string;
  subject: string;
  assignedAt: Date;
}

export interface VerificationFile {
  name: string;
  mimeType: string;
  size: number;
  url: string;
  publicId?: string;
  uploadedAt: Date;
}

export interface ITeacher extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  gender?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  institution?: {
    name?: string;
    type?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      zipCode?: string;
    };
  };
  subjects?: any[];
  qualifications?: any[];
  experience?: any;
  bio?: string;
  verificationDocuments?: Record<string, VerificationFile[]>;
  agreementAccepted?: boolean;
  onboardingComplete?: boolean;
  onboardingStep?: string;
  status?: string;
  approvalStatus?: string;
  approvedAt?: Date;
  rejectedAt?: Date;
}

const verificationFileSchema = new Schema<VerificationFile>({
  name: String,
  mimeType: String,
  size: Number,
  url: String,
  publicId: String,
  uploadedAt: Date,
}, { _id: false });

const teacherSchema = new Schema<ITeacher>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phoneNumber: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
  },
  institution: {
    name: String,
    type: String,
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },
  },
  subjects: { type: Array, default: [] },
  qualifications: { type: Array, default: [] },
  experience: { type: Schema.Types.Mixed },
  bio: { type: String },
  verificationDocuments: { type: Schema.Types.Mixed, default: {} },
  agreementAccepted: { type: Boolean, default: false },
  onboardingComplete: { type: Boolean, default: false },
  onboardingStep: { type: String, default: 'personal_info' },
  status: { type: String, default: 'pending_approval' },
  approvalStatus: { type: String, default: 'pending' },
  approvedAt: Date,
  rejectedAt: Date,
}, { timestamps: true });

teacherSchema.methods.comparePassword = async function(candidatePassword: string) {
  const crypto = require('crypto');
  const hashed = crypto.createHash('sha256').update(candidatePassword).digest('hex');
  return hashed === this.password;
};

teacherSchema.methods.updateLastLogin = function() {
  return this.updateOne({ lastLogin: new Date() });
};

const Teacher: Model<ITeacher> = (models.Teacher as any) || mongoose.model<ITeacher>('Teacher', teacherSchema);

export default Teacher;
