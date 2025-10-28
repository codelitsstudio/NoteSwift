import mongoose, { Schema, models } from 'mongoose';

export interface IAppUpdate {
  _id: string;
  isActive: boolean;
  title: string;
  subtitle: string;
  verificationCode?: string | null;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
}

const appUpdateSchema = new Schema<IAppUpdate>({
  isActive: {
    type: Boolean,
    default: false,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  subtitle: {
    type: String,
    required: true,
    trim: true
  },
  verificationCode: {
    type: String,
    required: false,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  createdBy: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// Ensure only one active app update at a time
appUpdateSchema.pre('save', async function(next) {
  if (this.isActive) {
    // Deactivate all other active updates
    await mongoose.model('AppUpdate').updateMany(
      { _id: { $ne: this._id }, isActive: true },
      { isActive: false }
    );
  }
  next();
});

const AppUpdate = models.AppUpdate || mongoose.model<IAppUpdate>('AppUpdate', appUpdateSchema);

export default AppUpdate;