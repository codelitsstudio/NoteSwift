// backend/models/Course.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface ICourse extends Document {
  _id: mongoose.Types.ObjectId;
  id: string;
  title: string;
  description: string;
  teacherName: string;
  thumbnail: string;
  originalPrice?: string;
  discountPercentage?: number;
  isActive: boolean;
  isFeatured: boolean;
  duration?: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category?: string;
  tags: string[];
  syllabus: Array<{
    title: string;
    description: string;
    duration: string;
  }>;
  requirements: string[];
  learningOutcomes: string[];
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  teacherName: {
    type: String,
    required: true,
    trim: true
  },
  thumbnail: {
    type: String,
    required: true
  },
  originalPrice: {
    type: String,
    default: null
  },
  discountPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  duration: {
    type: String,
    default: null
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  category: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  syllabus: [{
    title: String,
    description: String,
    duration: String
  }],
  requirements: [String],
  learningOutcomes: [String]
}, {
  timestamps: true
});

// Indexes for better query performance
courseSchema.index({ isActive: 1 });
courseSchema.index({ isFeatured: 1 });
courseSchema.index({ isActive: 1, isFeatured: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ createdAt: -1 });

// Virtual for ID compatibility (frontend uses both _id and id)
courseSchema.virtual('id').get(function(this: ICourse) {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
courseSchema.set('toJSON', {
  virtuals: true
});

export default (mongoose.models.Course as mongoose.Model<ICourse>) || mongoose.model<ICourse>('Course', courseSchema);