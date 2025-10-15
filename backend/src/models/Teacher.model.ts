import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITeacher extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  fullName?: string;
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
  verificationDocuments?: any;
  agreementAccepted?: boolean;
  termsAcceptedAt?: Date;
  registrationStatus?: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  approvedAt?: Date;
  approvedBy?: mongoose.Types.ObjectId;
  assignedCourses?: {
    courseId: mongoose.Types.ObjectId;
    courseName: string;
    subject: string;
    assignedAt: Date;
  }[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const teacherSchema = new Schema<ITeacher>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  fullName: { type: String },
  phoneNumber: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  institution: {
    name: String,
    type: String,
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    }
  },
  subjects: [{ type: Schema.Types.Mixed }],
  qualifications: [{ type: Schema.Types.Mixed }],
  experience: { type: Schema.Types.Mixed },
  bio: { type: String },
  verificationDocuments: { type: Schema.Types.Mixed },
  agreementAccepted: { type: Boolean, default: false },
  termsAcceptedAt: { type: Date },
  registrationStatus: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: { type: String },
  approvedAt: { type: Date },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
  assignedCourses: [{
    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
    courseName: { type: String },
    subject: { type: String },
    assignedAt: { type: Date, default: Date.now }
  }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Update fullName before save
teacherSchema.pre('save', function(next) {
  if (this.firstName && this.lastName) {
    this.fullName = `${this.firstName} ${this.lastName}`;
  }
  next();
});

const Teacher: Model<ITeacher> = 
  mongoose.models.Teacher || 
  mongoose.model<ITeacher>('Teacher', teacherSchema);

export default Teacher;
