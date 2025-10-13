import mongoose, { Schema, models, Model } from 'mongoose';

export interface IPendingTeacher extends mongoose.Document {
  email: string;
  password: string;
  verificationCode: string;
  verificationExpiry: Date;
  createdAt: Date;
  updatedAt: Date;
}

const pendingTeacherSchema = new Schema<IPendingTeacher>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  verificationCode: {
    type: String,
    required: true,
  },
  verificationExpiry: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true
});

// TTL index to automatically delete expired pending registrations after 24 hours
pendingTeacherSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 }); // 24 hours

// TTL index to delete expired verification codes
pendingTeacherSchema.index({ verificationExpiry: 1 }, { expireAfterSeconds: 0 });

// Hash password before saving
pendingTeacherSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    const crypto = require('crypto');
    this.password = crypto.createHash('sha256').update(this.password).digest('hex');
  }
  next();
});

// Compare password method
pendingTeacherSchema.methods.comparePassword = function(password: string): boolean {
  const crypto = require('crypto');
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
  return this.password === hashedPassword;
};

// Ensure the model is registered globally
const PendingTeacher: Model<IPendingTeacher> = mongoose.models.PendingTeacher || mongoose.model<IPendingTeacher>('PendingTeacher', pendingTeacherSchema);

export default PendingTeacher;