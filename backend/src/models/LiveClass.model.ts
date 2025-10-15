import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILiveClassAttendee {
  studentId: mongoose.Types.ObjectId;
  studentName: string;
  studentEmail: string;
  joinedAt?: Date;
  leftAt?: Date;
  duration?: number; // in minutes
  status: 'registered' | 'attended' | 'absent';
}

export interface ILiveClass extends Document {
  title: string;
  description: string;
  topic: string;
  
  // Subject-scoped: live class belongs to a subject
  subjectContentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  courseName: string;
  subjectName: string;
  moduleNumber?: number;
  moduleName?: string;
  
  // Teacher who hosts it
  teacherId: mongoose.Types.ObjectId;
  teacherName: string;
  teacherEmail: string;
  
  // Scheduling
  scheduledAt: Date;
  duration: number; // in minutes
  startedAt?: Date;
  endedAt?: Date;
  actualDuration?: number;
  
  // Platform
  platform: 'zoom' | 'meet' | 'teams' | 'jitsi' | 'custom';
  meetingLink: string;
  meetingId?: string;
  meetingPassword?: string;
  
  // Recording
  recordingUrl?: string;
  recordingDuration?: number;
  recordingSize?: number;
  
  // Targeting
  targetAudience: 'all' | 'batch' | 'specific';
  batchIds?: mongoose.Types.ObjectId[];
  studentIds?: mongoose.Types.ObjectId[];
  
  // Attendance
  attendees: ILiveClassAttendee[];
  totalRegistered: number;
  totalAttended: number;
  attendanceRate?: number;
  
  // Content
  agenda?: string[];
  resources?: {
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
  
  // Notifications
  reminderSent: boolean;
  reminderSentAt?: Date;
  
  // Status
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  cancellationReason?: string;
  
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const attendeeSchema = new Schema<ILiveClassAttendee>({
  studentId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Student', 
    required: true 
  },
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true },
  joinedAt: { type: Date },
  leftAt: { type: Date },
  duration: { type: Number, min: 0 },
  status: { 
    type: String, 
    enum: ['registered', 'attended', 'absent'],
    default: 'registered'
  }
}, { _id: false });

const liveClassSchema = new Schema<ILiveClass>({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  topic: { type: String, required: true },
  
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
  
  teacherId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Teacher', 
    required: true,
    index: true 
  },
  teacherName: { type: String, required: true },
  teacherEmail: { type: String, required: true },
  
  scheduledAt: { type: Date, required: true, index: true },
  duration: { type: Number, required: true, min: 0 },
  startedAt: { type: Date },
  endedAt: { type: Date },
  actualDuration: { type: Number, min: 0 },
  
  platform: { 
    type: String, 
    enum: ['zoom', 'meet', 'teams', 'jitsi', 'custom'],
    default: 'meet'
  },
  meetingLink: { type: String, required: true },
  meetingId: { type: String },
  meetingPassword: { type: String },
  
  recordingUrl: { type: String },
  recordingDuration: { type: Number },
  recordingSize: { type: Number },
  
  targetAudience: { 
    type: String, 
    enum: ['all', 'batch', 'specific'],
    default: 'all'
  },
  batchIds: [{ type: Schema.Types.ObjectId, ref: 'Batch' }],
  studentIds: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
  
  attendees: [attendeeSchema],
  totalRegistered: { type: Number, default: 0 },
  totalAttended: { type: Number, default: 0 },
  attendanceRate: { type: Number, min: 0, max: 100 },
  
  agenda: [{ type: String }],
  resources: [{
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, required: true },
    size: { type: Number, required: true }
  }],
  
  reminderSent: { type: Boolean, default: false },
  reminderSentAt: { type: Date },
  
  status: { 
    type: String, 
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
    default: 'scheduled',
    index: true
  },
  cancellationReason: { type: String },
  
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Indexes
liveClassSchema.index({ teacherId: 1, subjectName: 1, status: 1 });
liveClassSchema.index({ courseId: 1, status: 1 });
liveClassSchema.index({ scheduledAt: 1, status: 1 });

// Calculate attendance before save
liveClassSchema.pre('save', function(next) {
  this.totalRegistered = this.attendees.length;
  this.totalAttended = this.attendees.filter(a => a.status === 'attended').length;
  if (this.totalRegistered > 0) {
    this.attendanceRate = (this.totalAttended / this.totalRegistered) * 100;
  }
  next();
});

const LiveClass: Model<ILiveClass> = 
  mongoose.models.LiveClass || 
  mongoose.model<ILiveClass>('LiveClass', liveClassSchema);

export default LiveClass;
