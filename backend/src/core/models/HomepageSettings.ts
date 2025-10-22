// backend/src/core/models/HomepageSettings.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IHomepageSettings extends Document {
  _id: mongoose.Types.ObjectId;
  selectedFeaturedCourses: string[]; // Array of course IDs
  createdAt: Date;
  updatedAt: Date;
}

const HomepageSettingsSchema = new Schema<IHomepageSettings>({
  selectedFeaturedCourses: {
    type: [String],
    default: [],
    required: true
  }
}, {
  timestamps: true,
  collection: 'homepage_settings'
});

// Ensure only one document exists
HomepageSettingsSchema.pre('save', async function(next) {
  const count = await mongoose.model('HomepageSettings').countDocuments();
  if (count > 0 && !this.isNew) {
    // Allow updates to existing document
    next();
  } else if (count > 0 && this.isNew) {
    // Prevent creating multiple documents
    const error = new Error('Only one homepage settings document can exist');
    next(error);
  } else {
    // First document, allow creation
    next();
  }
});

// Check if model already exists to prevent OverwriteModelError
const HomepageSettings = mongoose.models.HomepageSettings || mongoose.model<IHomepageSettings>('HomepageSettings', HomepageSettingsSchema);

export default HomepageSettings;