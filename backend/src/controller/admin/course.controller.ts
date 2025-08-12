import JsonResponse from "lib/Response";
import { Controller } from "types/controller";
import CourseModel from "models/admins/Course.model";
import { Course } from "@shared/api/admin/course";
import { Subject } from "models/admins/Subject.model";
import { Admin } from "models/admins/Admin.model";
import { AuditService } from "services/audit.service";

export const createCourse: Controller = async (req, res) => {
    const jsonResponse = new JsonResponse(res);

    try {


        const {
            name,
            description,
            subject,
            content,
            has_published,
            grade,
        }: Course.Req = req.body;

        if (
            [name, description, subject, content].some((f) => !f || f.trim() === "")
        ) {
            return jsonResponse.clientError("All field required.");
        }

        if (!grade) {
            return jsonResponse.clientError("Grade is required to make course.");
        }

        const existSubject = await Subject.findById({ _id: subject });

        if (!existSubject) {
            return jsonResponse.clientError("Subject is not exist for provided id.");
        }

        const course = new CourseModel({
            name,
            description,
            subject,
            content,
            grade,
            has_published: has_published,
        });

        await course.save();

        // Log the course creation
        await AuditService.logCourseAction(
            admin._id,
            'CREATE',
            course._id.toString(),
            course.name,
            req
        );

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
                [c.name, c.description, c.subject, c.content].some(
                    (f) => !f || f.trim() === ""
                )
            ) {
                return jsonResponse.clientError(
                    "Each course must have non-empty title, description, and subject."
                );
            }
        }

        const existSubjects = await Promise.all(
            courses.map(async (c) => {
                return await Subject.findById(c.subject);
            })
        );

        if (!existSubjects) {
            return jsonResponse.clientError(
                "All subject id is reauired to make subject."
            );
        }

        const preparedCourses = courses.map((c) => ({
            name: c.name.trim(),
            description: c.description.trim(),
            subject: c.subject.trim(),
            has_published: c.has_published,
            content: c.content,
            subjecg: c.subject,
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
       
        const id = req.params.id as string;

        if (!id) {
            return jsonResponse.clientError(
                "Course id is required to delete the course"
            );
        }

        const courseExist = await CourseModel.findById(id);

        if (!courseExist) {
            return jsonResponse.clientError("Course is not exist to delete.");
        }

        // Log before deletion
        await AuditService.logCourseAction(
            admin._id,
            'DELETE',
            courseExist._id.toString(),
            courseExist.name,
            req
        );

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

        const { name, description }: Partial<Course.Req> =
            req.body;

        if (!id) {
            return jsonResponse.clientError("Id is required to update course.");
        }

        const courseExist = await CourseModel.findById(id);

        if (!courseExist) {
            return jsonResponse.notFound("Course not found by the provided id.");
        }

        const updateCourse: Partial<Course.Req> = {};

        if (name !== undefined) updateCourse.name = name.trim();
        if (description !== undefined)
            updateCourse.description = description.trim();

        if (Object.keys(updateCourse).length === 0) {
            return jsonResponse.clientError(
                "At least one field is required to update."
            );
        }

        const updatedCourse = await CourseModel.findByIdAndUpdate(
            id,
            { $set: updateCourse },
            { new: true, runValidators: true }
        );

        // Log the course update
        await AuditService.logCourseAction(
            admin._id,
            'UPDATE',
            courseExist._id.toString(),
            courseExist.name,
            req
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

        return jsonResponse.success(
            {
                courses,
                pagination: {
                    total,
                    totalPages,
                    page,
                    limit,
                },
            },
            "Courses retrieved successfully."
        );
    } catch (error) {
        console.error(error);
        jsonResponse.serverError();
    }
};

export const publishCourse: Controller = async (req, res) => {
    const jsonResponse = new JsonResponse(res);
    try {
        // const { has_published }: Partial<Course.Req> = req.body;
        const id = req.params.id as string;

        if (!id) {
            return jsonResponse.clientError(
                "Id is required to change the status of publised."
            );
        }

        const courseExist = await CourseModel.findById(id);

        if (!courseExist) {
            return jsonResponse.clientError("Course is not exist.");
        }

        const updatedCourse = await CourseModel.findByIdAndUpdate(
            id,

            {
                $set: {
                    has_published: true,
                },
            },
            { new: true, runValidators: true }
        );

        // Log the course publish action
        await AuditService.logCourseAction(
            admin._id,
            'PUBLISH',
            courseExist._id.toString(),
            courseExist.name,
            req
        );

        return jsonResponse.success(updatedCourse, "Subject published successfully.");
    } catch (error) {
        console.log(error);
        jsonResponse.serverError();
    }
};

export const unPublishCourse: Controller = async (req, res) => {
    const jsonResponse = new JsonResponse(res);
    try {
        const admin = res.locals.admin;

        if (!admin || !admin._id) {
            return jsonResponse.notAuthorized("Unauthorized access.");
        }

        const eAdmin = await Admin.findById({ _id: admin._id })

        if (!eAdmin) {
            return jsonResponse.notAuthorized("Unauthorized access.");
        }
        
        // const { has_published }: Partial<Course.Req> = req.body;
        const id = req.params.id as string;

        if (!id) {
            return jsonResponse.clientError(
                "Id is required to change the status of publised."
            );
        }

        const courseExist = await CourseModel.findById(id);

        if (!courseExist) {
            return jsonResponse.clientError("Course is not exist.");
        }

        const updatedCourse = await CourseModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    has_published: false,
                },
            },
            { new: true, runValidators: true }
        );

        // Log the course unpublish action
        await AuditService.logCourseAction(
            admin._id,
            'UNPUBLISH',
            courseExist._id.toString(),
            courseExist.name,
            req
        );

        return jsonResponse.success(updatedCourse, "Subject unpublished successfully.");
    } catch (error) {
        console.log(error);
        jsonResponse.serverError();
    }
};

export const getCourseById: Controller = async (req, res) => {
    const jsonResponse = new JsonResponse(res);
    try {

        const id = req.params.id as string;

        if (!id) {
            return jsonResponse.clientError(
                "Id is required to change the status of publised."
            );
        }

        const courseExist = await CourseModel.findById(id);

        if (!courseExist) {
            return jsonResponse.clientError("Course is not exist.");
        }

        const getCourse = await CourseModel.findById(id)
            .populate("subject", "subject_name");

        return jsonResponse.success(getCourse, "Subject published successfully.");
    } catch (error) {
        console.log(error);
        jsonResponse.serverError();
    }
};
