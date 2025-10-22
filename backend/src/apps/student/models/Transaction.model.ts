import mongoose, { Schema, models } from 'mongoose';
import { TTransaction } from '@core/models/common/Transaction';

const transactionSchema = new Schema<TTransaction>({
  buyerName: { type: String, required: true },
  contact: { type: String, required: true },
  paymentReferenceType: { type: String, enum: ['transaction-id', 'screenshot'] },
  paymentReference: { type: String },
  paymentMethod: { type: String, required: true, enum: ['esewa-personal', 'bank-transfer', 'cash', 'other'] },
  courseId: { type: String, required: true },
  amount: { type: Number, required: true },
  notes: { type: String },
  status: { type: String, required: true, enum: ['pending-code-redemption', 'completed', 'cancelled'], default: 'pending-code-redemption' },
  unlockCodeId: { type: String },
  issuedBy: { type: String, required: true },
}, { timestamps: true });

const Transaction = models.Transaction || mongoose.model('Transaction', transactionSchema);

export default Transaction;