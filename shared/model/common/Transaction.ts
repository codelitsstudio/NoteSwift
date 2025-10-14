export interface TTransaction {
  _id: string;
  buyerName: string;
  contact: string; // phone or email
  paymentReferenceType?: 'transaction-id' | 'screenshot';
  paymentReference?: string; // transaction ID or screenshot URL/base64
  paymentMethod: 'esewa-personal' | 'bank-transfer' | 'cash' | 'other';
  courseId: string;
  amount: number;
  notes?: string;
  status: 'pending-code-redemption' | 'completed' | 'cancelled';
  unlockCodeId?: string;
  issuedBy: string; // admin username
  createdAt: Date;
  updatedAt: Date;
}