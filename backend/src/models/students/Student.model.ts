import mongoose, { model, Schema } from "mongoose";
import { TStudent } from "@shared/model/students/Student"

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