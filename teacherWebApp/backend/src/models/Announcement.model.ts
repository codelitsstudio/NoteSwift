import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAnnouncement extends Document {
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  
  // Subject-scoped: teacher can only create for their assigned subject
  subjectContentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  courseName: string;
  subjectName: string;
  
  // Teacher who created it
  teacherId: mongoose.Types.ObjectId;
  teacherName: string;
  teacherEmail: string;
  
  // Targeting
  targetAudience: 'all' | 'batch' | 'specific';
  batchIds?: mongoose.Types.ObjectId[];
  studentIds?: mongoose.Types.ObjectId[];
  
  // Scheduling
  scheduledFor?: Date;
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled';
  
  // Delivery tracking
  sentAt?: Date;
  totalRecipients: number;
  readBy: mongoose.Types.ObjectId[]; // Student IDs who read it
  readCount: number;
  
  // Attachments
  attachments?: {
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
  
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const announcementSchema = new Schema<IAnnouncement>({
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true },
  priority: { 
    type: String, 
    enum: ['high', 'medium', 'low'], 
    default: 'medium' 
  },
  
  subjectContentId: { 
    type: Schema.Types.ObjectId, 
    ref: 'SubjectContent', 
    required: true,
    index: true 
  },
  courseId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true,
    index: true 
  },
  courseName: { type: String, required: true },
  subjectName: { type: String, required: true },
  
  teacherId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Teacher', 
    required: true,
    index: true 
  },
  teacherName: { type: String, required: true },
  teacherEmail: { type: String, required: true },
  
  targetAudience: { 
    type: String, 
    enum: ['all', 'batch', 'specific'],
    default: 'all'
  },
  batchIds: [{ type: Schema.Types.ObjectId, ref: 'Batch' }],
  studentIds: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
  
  scheduledFor: { type: Date },
  status: { 
    type: String, 
    enum: ['draft', 'scheduled', 'sent', 'cancelled'],
    default: 'draft'
  },
  
  sentAt: { type: Date },
  totalRecipients: { type: Number, default: 0 },
  readBy: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
  readCount: { type: Number, default: 0 },
  
  attachments: [{
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, required: true },
    size: { type: Number, required: true }
  }],
  
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Indexes for efficient queries
announcementSchema.index({ teacherId: 1, subjectName: 1, status: 1 });
announcementSchema.index({ courseId: 1, status: 1 });
announcementSchema.index({ scheduledFor: 1, status: 1 });

const Announcement: Model<IAnnouncement> = 
  mongoose.models.Announcement || 
  mongoose.model<IAnnouncement>('Announcement', announcementSchema);

export default Announcement;
