import mongoose, { model, Schema } from "mongoose";
import { TStudent } from "@core/models/students/Student"

const schema = new Schema<TStudent<mongoose.Types.ObjectId>>({
    full_name: {
        type: String,
        required: true
    },
    grade: {
        type: Number,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    address: {
        institution: {
            type: String,
            required: true
        },
        district: {
            type: String,
            required: true
        },
        province: {
            type: String,
            required: true
        }
    },
    password: {
        type: String,
        required: true
    },
    avatarEmoji: {
        type: String,
        required: true // Assigned at registration, never changes
    },
    profileImage: {
        type: String,
        required: false // Optional uploaded image URL
    },
    notification_preferences: {
        push_notifications: {
            type: Boolean,
            default: true
        },
        email_notifications: {
            type: Boolean,
            default: true
        },
        lesson_reminders: {
            type: Boolean,
            default: true
        },
        progress_updates: {
            type: Boolean,
            default: true
        },
        course_announcements: {
            type: Boolean,
            default: true
        },
        study_streak_reminders: {
            type: Boolean,
            default: true
        },
        weekly_progress_report: {
            type: Boolean,
            default: false
        },
        new_content_alerts: {
            type: Boolean,
            default: true
        }
    }
}, {timestamps: true});

// Virtual for ID compatibility (frontend uses both _id and id)
schema.virtual('id').get(function() {
  return this._id.toHexString();
});

schema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  },
});
export const Student = mongoose.models.Student || model("Student", schema);