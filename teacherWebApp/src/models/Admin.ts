import mongoose, { Schema, models, Model } from 'mongoose';

export interface IAdmin extends mongoose.Document {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'superadmin';
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const adminSchema = new Schema<IAdmin>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
  role: { type: String, enum: ['admin', 'superadmin'], default: 'admin' },
}, { timestamps: true });

// Hash password before save (simple sha256 for now; replace with bcrypt in prod)
adminSchema.pre('save', function(next) {
  if (!this.isModified('password')) return next();
  try {
    const crypto = require('crypto');
    this.password = crypto.createHash('sha256').update(this.password).digest('hex');
    next();
  } catch (err) { (next as any)(err instanceof Error ? err : new Error(String(err))); }
});

adminSchema.methods.comparePassword = async function(candidatePassword: string) {
  const crypto = require('crypto');
  const hashed = crypto.createHash('sha256').update(candidatePassword).digest('hex');
  return hashed === this.password;
};

const Admin: Model<IAdmin> = models.Admin || mongoose.model<IAdmin>('Admin', adminSchema);
export default Admin;
