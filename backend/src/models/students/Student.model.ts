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
    phone_number: {
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
schema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  },
});
export const Student = model("Student", schema);