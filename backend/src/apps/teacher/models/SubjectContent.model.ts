import mongoose, { Schema, Document, Model } from 'mongoose';

// Interface for video content
export interface IVideoContent {
  url: string;
  title: string;
  duration?: string;
  uploadedAt?: Date;
}

// Interface for module content configuration
export interface IModuleContent {
  moduleNumber: number;
  moduleName: string;
  description?: string; // Add description field
  hasVideo: boolean;
  videos?: IVideoContent[]; // Support multiple videos
  // Keep backward compatibility
  videoUrl?: string;
  videoTitle?: string;
  videoDuration?: string;
  videoUploadedAt?: Date;
  
  hasNotes: boolean;
  notesUrl?: string;
  notesTitle?: string;
  notesUploadedAt?: Date;
  
  hasLiveClass: boolean;
  liveClassSchedule?: {
    scheduledAt: Date;
    duration: number; // in minutes
    meetingLink?: string;
    status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  }[];
  
  hasTest: boolean;
  testIds?: mongoose.Types.ObjectId[]; // Reference to Test collection
  
  hasQuestions: boolean;
  questionIds?: mongoose.Types.ObjectId[]; // Reference to Question/Doubt collection
  // Likes stored as student ObjectId references
  likes?: mongoose.Types.ObjectId[];
  
  order: number;
  isActive: boolean;
}

// Interface for subject content
export interface ISubjectContent extends Document {
  courseId: mongoose.Types.ObjectId;
  courseName: string;
  subjectName: string;
  teacherId: mongoose.Types.ObjectId;
  teacherName: string;
  teacherEmail: string;
  
  modules: IModuleContent[];
  
  // Subject-level metadata
  description?: string;
  syllabus?: string;
  objectives?: string[];
  
  // Status
  isActive: boolean;
  lastUpdated: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const moduleContentSchema = new Schema<IModuleContent>({
  moduleNumber: { type: Number, required: true },
  moduleName: { type: String, required: true },
  description: { type: String }, // Add description field
  
  hasVideo: { type: Boolean, default: false },
  videos: [{ // Support multiple videos
    url: { type: String, required: true },
    title: { type: String, required: true },
    duration: { type: String },
    uploadedAt: { type: Date, default: Date.now }
  }],
  // Likes: allow tracking student likes for a module (optional)
  likes: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
  // Keep backward compatibility
  videoUrl: { type: String },
  videoTitle: { type: String },
  videoDuration: { type: String },
  videoUploadedAt: { type: Date },
  
  hasNotes: { type: Boolean, default: false },
  notesUrl: { type: String },
  notesTitle: { type: String },
  notesUploadedAt: { type: Date },
  
  hasLiveClass: { type: Boolean, default: false },
  liveClassSchedule: [{
    scheduledAt: { type: Date, required: true },
    duration: { type: Number, required: true },
    meetingLink: { type: String },
    status: { 
      type: String, 
      enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
      default: 'scheduled'
    }
  }],
  
  hasTest: { type: Boolean, default: false },
  testIds: [{ type: Schema.Types.ObjectId, ref: 'Test' }],
  
  hasQuestions: { type: Boolean, default: false },
  questionIds: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
  
  order: { type: Number, required: true },
  isActive: { type: Boolean, default: true }
}, { _id: false });

const subjectContentSchema = new Schema<ISubjectContent>({
  courseId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true,
    index: true 
  },
  courseName: { type: String, required: true },
  subjectName: { type: String, required: true, index: true },
  teacherId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Teacher', 
    required: true,
    index: true 
  },
  teacherName: { type: String, required: true },
  teacherEmail: { type: String, required: true },
  
  modules: [moduleContentSchema],
  
  description: { type: String },
  syllabus: { type: String },
  objectives: [{ type: String }],
  
  isActive: { type: Boolean, default: true },
  lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true });

// Compound index for efficient queries
subjectContentSchema.index({ courseId: 1, subjectName: 1 });
subjectContentSchema.index({ teacherId: 1, isActive: 1 });

// Update lastUpdated on save
subjectContentSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

const SubjectContent: Model<ISubjectContent> = 
  mongoose.models.SubjectContent || 
  mongoose.model<ISubjectContent>('SubjectContent', subjectContentSchema);

export default SubjectContent;
