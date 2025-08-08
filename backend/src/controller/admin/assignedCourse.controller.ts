import JsonResponse from "lib/Response";
import { Controller } from "types/controller";
import { AssignedCourse as ACModle } from "models/admins/AssignedCourse";
import { Admin } from "models/admins/Admin.model";
import { Teacher } from "models/teacher/teacher.model";
import Course from "models/admins/Course.model";
import { AssignedCourse } from "@shared/api/admin/assignedCourse";
import mongoose from "mongoose";

export const assignCourse: Controller = async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const admin = res.locals.admin;

    if (!admin || !admin._id) {
      return jsonResponse.notAuthorized("Unauthorized access.");
    }

    const eAdmin = await Admin.findById({ _id: admin._id });

    if (!eAdmin) {
      return jsonResponse.notAuthorized("Unauthorized access.");
    }

    const { teacher_id, courses, assigned_date }: AssignedCourse.Res = req.body;

    if (!teacher_id) {
      return jsonResponse.clientError(
        "Teacher is required to assign the courses."
      );
    }

    if (!Array.isArray(courses) || courses.length === 0) {
      return jsonResponse.clientError(
        "Courses is required to assign the course to teacher."
      );
    }

    const teacherExist = await Teacher.findById({ _id: teacher_id });

    if (!teacherExist) {
      return jsonResponse.notFound("Teacher is not found by the given id.");
    }

    const courseIds = courses.map((id) => new mongoose.Types.ObjectId(id));

    const courseExistCount = await Course.countDocuments({
      _id: { $in: courseIds },
    });

    if (courseExistCount !== courses.length) {
      return jsonResponse.notFound("Some courses is not exist.");
    }

    const courseAssigned = await ACModle.create({
      teacher_id,
      courses: courses,
      assigned_date,
    });

    return jsonResponse.success(
      "Course assigned successfully.",
      courseAssigned
    );
  } catch (error) {
    console.error(error);
    return jsonResponse.serverError();
  }
};

export const deleteAssignCourse: Controller = async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const admin = res.locals.admin;

    if (!admin || !admin._id) {
      return jsonResponse.notAuthorized("Unauthorized access.");
    }

    const eAdmin = await Admin.findById({ _id: admin._id });

    if (!eAdmin) {
      return jsonResponse.notAuthorized("Unauthorized access.");
    }

    const id = req.params.id as string;

    if (!id) {
      return jsonResponse.clientError(
        "Id is required to delete the course assigned."
      );
    }

    const caExist = await ACModle.findById(id);

    if (!caExist) {
      return jsonResponse.notFound("Course is not found by the given id.");
    }

    await ACModle.findByIdAndDelete(id);
    return jsonResponse.success("Course deleted successfully.");
  } catch (error) {
    console.error(error);
    return jsonResponse.serverError();
  }
};
