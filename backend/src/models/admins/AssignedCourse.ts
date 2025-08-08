
import { TCourseAssigned } from "@shared/model/admin/CourseAssigned";
import mongoose, { Schema, models, Types } from "mongoose";

const assignedCourseschema = new Schema<TCourseAssigned>({
  teacher_id: {
    type: Schema.Types.ObjectId,
    ref: "Teacher",
    required: true,
  },
  courses: [
    {
      type: Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
  assigned_date: {
    type: Date,
    required: true
  }
},
{
    timestamps: true
});

export const AssignedCourse = models.AssignedCourse || mongoose.model("AssignedCourse", assignedCourseschema);
