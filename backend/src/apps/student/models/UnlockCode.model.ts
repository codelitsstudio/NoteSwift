import mongoose, { Schema, models } from 'mongoose';
import { TUnlockCode } from '@core/models/common/UnlockCode';

const unlockCodeSchema = new Schema<TUnlockCode>({
  code: { type: String }, // Plain text code for admin visibility
  codeHash: { type: String, required: true, unique: true },
  courseId: { type: String, required: true },
  issuedTo: { type: String },
  issuedBy: { type: String, required: true },
  isUsed: { type: Boolean, required: true, default: false },
  usedByUserId: { type: String },
  usedDeviceHash: { type: String },
  usedTimestamp: { type: Date },
  expiresOn: { type: Date },
  transactionId: { type: String, required: true },
}, { timestamps: true });

// Index for quick lookup (codeHash already indexed via unique: true)
unlockCodeSchema.index({ courseId: 1, isUsed: 1 });

const UnlockCode = models.UnlockCode || mongoose.model('UnlockCode', unlockCodeSchema);

export default UnlockCode;