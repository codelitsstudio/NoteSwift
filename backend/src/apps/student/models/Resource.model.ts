import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IResource extends Document {
  title: string;
  description: string;
  
  // Subject-scoped: resource belongs to a subject
  subjectContentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  courseName: string;
  subjectName: string;
  moduleNumber?: number;
  moduleName?: string;
  topicName?: string;
  
  // Teacher who uploaded it
  teacherId: mongoose.Types.ObjectId;
  teacherName: string;
  teacherEmail: string;
  
  // File details
  fileUrl: string;
  fileName: string;
  fileType: string; // pdf, doc, ppt, video, image, etc.
  fileSize: number; // in bytes
  mimeType: string;
  
  // Resource type
  type: 'notes' | 'video' | 'audio' | 'document' | 'presentation' | 'image' | 'link' | 'other';
  category: 'lecture-notes' | 'reference' | 'assignment-solution' | 'extra-reading' | 'practice' | 'other';
  
  // Metadata
  tags?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  
  // Targeting
  targetAudience: 'all' | 'batch' | 'specific';
  batchIds?: mongoose.Types.ObjectId[];
  studentIds?: mongoose.Types.ObjectId[];
  
  // Access control
  isPublic: boolean;
  requiresEnrollment: boolean;
  
  // Analytics
  downloadCount: number;
  viewCount: number;
  lastAccessedAt?: Date;
  
  // Ratings (optional)
  ratings?: {
    studentId: mongoose.Types.ObjectId;
    rating: number;
    review?: string;
    createdAt: Date;
  }[];
  avgRating?: number;
  
  status: 'draft' | 'published' | 'archived';
  isActive: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

const resourceSchema = new Schema<IResource>({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  
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
  moduleNumber: { type: Number },
  moduleName: { type: String },
  topicName: { type: String },
  
  teacherId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Teacher', 
    required: true,
    index: true 
  },
  teacherName: { type: String, required: true },
  teacherEmail: { type: String, required: true },
  
  fileUrl: { type: String, required: true },
  fileName: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: Number, required: true, min: 0 },
  mimeType: { type: String, required: true },
  
  type: { 
    type: String, 
    enum: ['notes', 'video', 'audio', 'document', 'presentation', 'image', 'link', 'other'],
    required: true
  },
  category: { 
    type: String, 
    enum: ['lecture-notes', 'reference', 'assignment-solution', 'extra-reading', 'practice', 'other'],
    default: 'lecture-notes'
  },
  
  tags: [{ type: String, trim: true }],
  difficulty: { 
    type: String, 
    enum: ['easy', 'medium', 'hard']
  },
  
  targetAudience: { 
    type: String, 
    enum: ['all', 'batch', 'specific'],
    default: 'all'
  },
  batchIds: [{ type: Schema.Types.ObjectId, ref: 'Batch' }],
  studentIds: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
  
  isPublic: { type: Boolean, default: false },
  requiresEnrollment: { type: Boolean, default: true },
  
  downloadCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
  lastAccessedAt: { type: Date },
  
  ratings: [{
    studentId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Student', 
      required: true 
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  avgRating: { type: Number, min: 0, max: 5 },
  
  status: { 
    type: String, 
    enum: ['draft', 'published', 'archived'],
    default: 'published',
    index: true
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Indexes
resourceSchema.index({ teacherId: 1, subjectName: 1, status: 1 });
resourceSchema.index({ courseId: 1, status: 1 });
resourceSchema.index({ type: 1, category: 1 });
resourceSchema.index({ tags: 1 });

// Text search
resourceSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Calculate average rating before save
resourceSchema.pre('save', function(next) {
  if (this.ratings && this.ratings.length > 0) {
    const sum = this.ratings.reduce((acc, r) => acc + r.rating, 0);
    this.avgRating = sum / this.ratings.length;
  }
  next();
});

const Resource: Model<IResource> = 
  mongoose.models.Resource || 
  mongoose.model<IResource>('Resource', resourceSchema);

export default Resource;
