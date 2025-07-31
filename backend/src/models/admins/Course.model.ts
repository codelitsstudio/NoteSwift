import mongoose, { Schema, models } from "mongoose";
import { TCourse } from "@shared/model/common/Course";

const courseSchema = new Schema<TCourse>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    content: {
      type: String,
      required: true,
    },
    subject: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    grade: {
      type: Number,
      require: true,
    },
    has_published: { type: Boolean, default: false },
    // assigned_teacher_id: {
    //   type: Schema.Types.ObjectId
    // }
  },
  { timestamps: true }
);

const Course = models.Course || mongoose.model("Course", courseSchema);

export default Course;
