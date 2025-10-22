import mongoose, { Schema, models } from 'mongoose';
import { TCourse } from '@core/models/common/Course';

const courseSchema = new Schema<TCourse>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  subjects: [{
    name: { type: String, required: true },
    description: { type: String },
    modules: [{
      name: { type: String, required: true },
      description: { type: String, required: true },
      duration: { type: String },
      hasVideo: { type: Boolean, default: false },
      hasNotes: { type: Boolean, default: false },
      hasTest: { type: Boolean, default: false },
      hasLiveClass: { type: Boolean, default: false },
      videoTitle: { type: String },
      notesTitle: { type: String },
      videoUrl: { type: String },
      notesUrl: { type: String },
      liveClassSchedule: { type: [Object], default: [] },
      order: { type: Number },
      isActive: { type: Boolean, default: true }
    }]
  }],
  tags: { type: [String], default: [] },
  status: { type: String, default: 'Draft' },
  type: { type: String, required: true, enum: ['featured', 'pro', 'free', 'recommended', 'upcoming'] },
  price: { type: Number },
  program: { type: String, required: true }, // see, plus2, bachelor, ctevt
  duration: { type: String },
  rating: { type: Number },
  enrolledCount: { type: Number, default: 0 },
  skills: { type: [String], default: [] },
  features: { type: [String], default: [] },
  learningPoints: { type: [String], default: [] },
  offeredBy: { type: String },
  courseOverview: { type: String },
  syllabus: [{
    moduleNumber: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true }
  }],
  faq: [{
    question: { type: String, required: true },
    answer: { type: String, required: true }
  }],
  icon: { type: String },
  thumbnail: { type: String },
  isFeatured: { type: Boolean, default: false },
  keyFeatures: { type: [String], default: [] },
  // AI-powered recommendation metadata
  recommendationData: {
    targetGrades: { type: [String], default: [] },
    targetAudience: { type: String, default: '' },
    difficultyLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'] },
    recommendedFor: { type: [String], default: [] },
    confidence: { type: Number, min: 0, max: 1 },
    lastAnalyzed: { type: Date },
  },
}, { timestamps: true });

const Course = models.Course || mongoose.model('Course', courseSchema);

export default Course;
