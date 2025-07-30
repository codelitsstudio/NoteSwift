import JsonResponse from "lib/Response";
import { Controller } from "types/controller";
import CourseModel from "models/Course.model";
import { Course } from "@shared/api/course/course";


export const createCourse: Controller = async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const { title, description, subject, tags, status }: Course.Req = req.body;

    if ([title, description, subject].some((f) => !f || f.trim() === "")) {
      return jsonResponse.clientError(
        "Title, description and subject are compulsory fields."
      );
    }

    const course = new CourseModel({
      title,
      description,
      subject,
      tags: tags ?? [],
      status: status ?? "Draft",
    });

    await course.save();

    return jsonResponse.success(course);
  } catch (error) {
    console.log(error);
    jsonResponse.serverError();
  }
};

export const createManyCourses: Controller = async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const courses: Course.Req[] = req.body;

    if (!Array.isArray(courses) || courses.length === 0) {
      return jsonResponse.clientError("Request body can not be empty");
    }

    for (const c of courses) {
      if (
        [c.title, c.description, c.subject].some((f) => !f || f.trim() === "")
      ) {
        return jsonResponse.clientError(
          "Each course must have non-empty title, description, and subject."
        );
      }
    }

    const preparedCourses = courses.map((c) => ({
      title: c.title.trim(),
      description: c.description.trim(),
      subject: c.subject.trim(),
      tags: c.tags ?? [],
      status: c.status ?? "Draft",
    }));

    const createdCourses = await CourseModel.insertMany(preparedCourses);

    return jsonResponse.success(createdCourses);
  } catch (error) {
    console.log(error);
    jsonResponse.serverError();
  }
};

export const deleteCourse: Controller = async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const id = req.query.id as string;

    if (!id) {
      return jsonResponse.clientError(
        "Course id is required to delete the course"
      );
    }

    const courseExist = await CourseModel.findById(id);

    if (!courseExist) {
      return jsonResponse.clientError("Course is not exist to delete.");
    }

    await CourseModel.findByIdAndDelete(id);

    return jsonResponse.success();
  } catch (error) {
    console.log(error);
    jsonResponse.serverError();
  }
};

export const updateCourse: Controller = async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const id: string = req.params.id;

    const { title, description, subject, tags, status }: Partial<Course.Req> = req.body;

    if (!id) {
      return jsonResponse.clientError("Id is required to update course.");
    }

    const courseExist = await CourseModel.findById(id);

    if (!courseExist) {
      return jsonResponse.notFound("Course not found by the provided id.");
    }


    const updateCourse: Partial<Course.Req> = {};

    if (title !== undefined) updateCourse.title = title.trim();
    if (description !== undefined) updateCourse.description = description.trim();
    if (subject !== undefined) updateCourse.subject = subject.trim();
    if (tags !== undefined) updateCourse.tags = tags;
    if (status !== undefined) updateCourse.status = status;

    if (Object.keys(updateCourse).length === 0) {
      return jsonResponse.clientError("At least one field is required to update.");
    }

    
    const updatedCourse = await CourseModel.findByIdAndUpdate(
      id,
      { $set: updateCourse },
      { new: true, runValidators: true }
    );

    return jsonResponse.success(updatedCourse);
  } catch (error) {
    console.error(error);
    return jsonResponse.serverError();
  }
};

export const getAllCourses: Controller = async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
 
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
    const search = (req.query.search as string) || "";

    
    const searchRegex = new RegExp(search, "i");
    const filter = search
      ? {
          $or: [
            { title: searchRegex },
            { description: searchRegex },
            { subject: searchRegex },
          ],
        }
      : {};


    const total = await CourseModel.countDocuments(filter);

 
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    const courses = await CourseModel.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    return jsonResponse.success({
      courses,
      pagination: {
        total,
        totalPages,
        page,
        limit,
      },
    }, "Courses retrieved successfully.");
  } catch (error) {
    console.error(error);
    jsonResponse.serverError();
  }
};


