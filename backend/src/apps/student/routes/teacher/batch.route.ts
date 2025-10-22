import { Router } from "express";
import Batch from "../../models/Batch.model";
import SubjectContent from "../../models/SubjectContent.model";
import Teacher from "../../models/Teacher.model";
import CourseEnrollment from "../../models/CourseEnrollment";
import JsonResponse from "../../lib/Response";

const router = Router();

const verifySubjectOwnership = async (teacherEmail: string, subjectContentId: string): Promise<boolean> => {
  const subjectContent = await SubjectContent.findById(subjectContentId);
  return subjectContent ? subjectContent.teacherEmail === teacherEmail : false;
};

// GET /api/teacher/batches - Get teacher's batches
router.get("/", async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const teacher = res.locals.teacher;
    const { subjectContentId, status } = req.query;

    if (!teacher) {
      return jsonResponse.notAuthorized("Teacher not authenticated");
    }

    const query: any = { teacherEmail: teacher.email, isActive: true };
    if (subjectContentId) query.subjectContentId = subjectContentId;
    if (status) query.status = status;

    const batches = await Batch.find(query).sort({ createdAt: -1 });

    const stats = {
      total: batches.length,
      active: batches.filter(b => b.status === 'active').length,
      totalStudents: batches.reduce((sum, b) => sum + b.totalStudents, 0),
      avgStudentsPerBatch: batches.length > 0 ? batches.reduce((sum, b) => sum + b.totalStudents, 0) / batches.length : 0
    };

    jsonResponse.success({ batches, stats });
  } catch (error) {
    console.error('Error fetching batches:', error);
    jsonResponse.serverError("Failed to fetch batches");
  }
});

// POST /api/teacher/batches - Create batch
router.post("/", async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const teacher = res.locals.teacher;
    const {
      name, code, description, subjectContentId,
      schedule, maxStudents, isPublic, requireApproval, startDate, endDate
    } = req.body;

    if (!teacher) {
      return jsonResponse.notAuthorized("Teacher not authenticated");
    }

    if (!await verifySubjectOwnership(teacher.email, subjectContentId)) {
      return jsonResponse.notAuthorized("Not authorized for this subject");
    }

    const subjectContent = await SubjectContent.findById(subjectContentId);
    if (!subjectContent) {
      return jsonResponse.notFound("Subject content not found");
    }

    // Check if code already exists
    const existingBatch = await Batch.findOne({ code: code.toUpperCase() });
    if (existingBatch) {
      return jsonResponse.clientError("Batch code already exists");
    }

    const batch = new Batch({
      name,
      code: code.toUpperCase(),
      description,
      subjectContentId,
      courseId: subjectContent.courseId,
      courseName: subjectContent.courseName,
      subjectName: subjectContent.subjectName,
      teacherId: teacher._id,
      teacherName: teacher.fullName || `${teacher.firstName} ${teacher.lastName}`,
      teacherEmail: teacher.email,
      schedule: schedule || [],
      maxStudents,
      isPublic: isPublic || false,
      requireApproval: requireApproval !== false,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      students: [],
      status: 'active'
    });

    await batch.save();

    jsonResponse.success(batch, "Batch created successfully");
  } catch (error) {
    console.error('Error creating batch:', error);
    jsonResponse.serverError("Failed to create batch");
  }
});

// PATCH /api/teacher/batches/:id - Update batch
router.patch("/:id", async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const teacher = res.locals.teacher;
    const { id } = req.params;
    const updates = req.body;

    if (!teacher) {
      return jsonResponse.notAuthorized("Teacher not authenticated");
    }

    const batch = await Batch.findById(id);
    if (!batch) {
      return jsonResponse.notFound("Batch not found");
    }

    if (batch.teacherEmail !== teacher.email) {
      return jsonResponse.notAuthorized("Not authorized");
    }

    Object.assign(batch, updates);
    await batch.save();

    jsonResponse.success(batch, "Batch updated successfully");
  } catch (error) {
    console.error('Error updating batch:', error);
    jsonResponse.serverError("Failed to update batch");
  }
});

// POST /api/teacher/batches/:id/students - Add students to batch
router.post("/:id/students", async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const teacher = res.locals.teacher;
    const { id } = req.params;
    const { studentIds } = req.body;

    if (!teacher) {
      return jsonResponse.notAuthorized("Teacher not authenticated");
    }

    const batch = await Batch.findById(id);
    if (!batch) {
      return jsonResponse.notFound("Batch not found");
    }

    if (batch.teacherEmail !== teacher.email) {
      return jsonResponse.notAuthorized("Not authorized");
    }

    // Check max students limit
    if (batch.maxStudents && batch.totalStudents + studentIds.length > batch.maxStudents) {
      return jsonResponse.clientError("Batch capacity exceeded");
    }

    // Verify students are enrolled in the course
    const enrollments = await CourseEnrollment.find({
      courseId: batch.courseId,
      studentId: { $in: studentIds },
      status: 'active'
    }).populate('studentId', 'firstName lastName email');

    if (enrollments.length !== studentIds.length) {
      return jsonResponse.clientError("Some students are not enrolled in the course");
    }

    // Add students to batch
    enrollments.forEach((e: any) => {
      // Check if student already in batch
      const existing = batch.students.find(s => s.studentId.toString() === e.studentId._id.toString());
      if (!existing) {
        batch.students.push({
          studentId: e.studentId._id,
          studentName: `${e.studentId.firstName} ${e.studentId.lastName}`,
          studentEmail: e.studentId.email,
          enrolledAt: new Date(),
          status: 'active'
        } as any);
      }
    });

    await batch.save();

    jsonResponse.success(batch, "Students added to batch successfully");
  } catch (error) {
    console.error('Error adding students:', error);
    jsonResponse.serverError("Failed to add students");
  }
});

// DELETE /api/teacher/batches/:id/students/:studentId - Remove student from batch
router.delete("/:id/students/:studentId", async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const teacher = res.locals.teacher;
    const { id, studentId } = req.params;

    if (!teacher) {
      return jsonResponse.notAuthorized("Teacher not authenticated");
    }

    const batch = await Batch.findById(id);
    if (!batch) {
      return jsonResponse.notFound("Batch not found");
    }

    if (batch.teacherEmail !== teacher.email) {
      return jsonResponse.notAuthorized("Not authorized");
    }

    const studentIndex = batch.students.findIndex(s => s.studentId.toString() === studentId);
    if (studentIndex === -1) {
      return jsonResponse.notFound("Student not in batch");
    }

    batch.students[studentIndex].status = 'dropped' as any;
    await batch.save();

    jsonResponse.success(null, "Student removed from batch successfully");
  } catch (error) {
    console.error('Error removing student:', error);
    jsonResponse.serverError("Failed to remove student");
  }
});

// DELETE /api/teacher/batches/:id - Delete batch
router.delete("/:id", async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const teacher = res.locals.teacher;
    const { id } = req.params;

    if (!teacher) {
      return jsonResponse.notAuthorized("Teacher not authenticated");
    }

    const batch = await Batch.findById(id);
    if (!batch) {
      return jsonResponse.notFound("Batch not found");
    }

    if (batch.teacherEmail !== teacher.email) {
      return jsonResponse.notAuthorized("Not authorized");
    }

    batch.isActive = false;
    batch.status = 'archived';
    await batch.save();

    jsonResponse.success(null, "Batch deleted successfully");
  } catch (error) {
    console.error('Error deleting batch:', error);
    jsonResponse.serverError("Failed to delete batch");
  }
});

export default router;