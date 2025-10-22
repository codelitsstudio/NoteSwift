export interface TUnlockCode {
  _id: string;
  codeHash: string; // SHA-256 hash of the code
  courseId: string;
  issuedTo?: string; // name or phone
  issuedBy: string; // admin username
  isUsed: boolean;
  usedByUserId?: string;
  usedDeviceHash?: string;
  usedTimestamp?: Date;
  expiresOn?: Date;
  transactionId: string;
  createdAt: Date;
  updatedAt: Date;
}