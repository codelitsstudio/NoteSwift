import mongoose, { Schema, models } from 'mongoose';

export interface ICourse {
  _id: string;
  title: string;
  description: string;
  subjects?: {
    name: string;
    description?: string;
    modules?: {
      name: string;
      description: string;
      duration?: string;
    }[];
  }[];
  tags: string[];
  status: string;
  type: 'featured' | 'pro' | 'free';
  price?: number;
  program?: string; // SEE, +2, Bachelor, CTEVT
  duration?: string;
  rating?: number;
  enrolledCount?: number;
  skills?: string[];
  features?: string[];
  learningPoints?: string[];
  offeredBy?: string; // teacher name
  courseOverview?: string;
  syllabus?: {
    moduleNumber: number;
    title: string;
    description: string;
  }[];
  faq?: {
    question: string;
    answer: string;
  }[];
  icon?: string;
  isFeatured?: boolean;
  keyFeatures?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  subjects: [{
    name: { type: String, required: true },
    description: { type: String },
    modules: [{
      name: { type: String, required: true },
      description: { type: String, required: true },
      duration: { type: String }
    }]
  }],
  tags: { type: [String], default: [] },
  status: { type: String, default: 'Draft' },
  type: { type: String, required: true, enum: ['featured', 'pro', 'free'] },
  price: { type: Number },
  program: { type: String },
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
  isFeatured: { type: Boolean, default: false },
  keyFeatures: { type: [String], default: [] },
}, { timestamps: true });

const Course = models.Course || mongoose.model<ICourse>('Course', courseSchema);

export default Course;
