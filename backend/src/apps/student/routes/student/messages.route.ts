import { Router } from "express";
import { authenticateStudent } from "../../middlewares/student.middleware";
import { Message } from "../../../../core/models/Message";
import { Student } from "../../models/students/Student.model";
import Teacher from '../../../teacher/models/Teacher.model';
import JsonResponse from "../../lib/Response";

const router = Router();

// Apply student authentication to all routes
router.use(authenticateStudent);

// POST /api/student/messages/teacher - Send message from student to teacher
router.post("/teacher", async (req, res) => {
  const jsonResponse = new JsonResponse(res);
  try {
    const { message, subjectName, teacherId } = req.body;
    const student = res.locals.student;

    if (!student?._id || !student?.email) {
      return jsonResponse.notAuthorized("Student not authenticated");
    }

    if (!message || !subjectName || !teacherId) {
      return jsonResponse.clientError("Missing required fields: message, subjectName, teacherId");
    }

    // Verify teacher exists
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return jsonResponse.notFound("Teacher not found");
    }

    // Get student's course name (assuming student has enrolled courses)
    // For now, we'll use a default or get it from the student's enrolled courses
    let courseName = "General"; // Default fallback

    // Try to get course name from student's enrolled courses that match the subject
    if (student.enrolledCourses && student.enrolledCourses.length > 0) {
      // This is a simplified approach - in a real app you'd want to match subject to course
      const enrolledCourse = student.enrolledCourses[0];
      if (enrolledCourse && enrolledCourse.title) {
        courseName = enrolledCourse.title;
      }
    }

    // Create the message
    const newMessage = new Message({
      studentId: student._id,
      teacherId: teacherId,
      subjectName,
      courseName,
      message: message.trim(),
      senderType: 'student',
      timestamp: new Date(),
      isRead: false
    });

    await newMessage.save();

    return jsonResponse.success({
      message: {
        _id: newMessage._id,
        message: newMessage.message,
        senderType: newMessage.senderType,
        timestamp: newMessage.timestamp,
        isRead: newMessage.isRead
      }
    }, "Message sent successfully");
  } catch (error: any) {
    console.error("Error sending message:", error);
    return jsonResponse.serverError("Failed to send message");
  }
});

// GET /api/student/messages/student/chat/:teacherId/:subjectName - Get chat messages
router.get("/student/chat/:teacherId/:subjectName", async (req, res) => {
  const jsonResponse = new JsonResponse(res);
  try {
    const { teacherId, subjectName } = req.params;
    const student = res.locals.student;

    if (!student?._id) {
      return jsonResponse.notAuthorized("Student not authenticated");
    }

    // Verify teacher exists
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return jsonResponse.notFound("Teacher not found");
    }

    // Get messages for this student-teacher-subject conversation
    const messages = await Message.find({
      studentId: student._id,
      teacherId: teacherId,
      subjectName: subjectName
    })
    .sort({ createdAt: 1 }) // Oldest first for chat flow
    .populate('studentId', 'full_name email')
    .populate('teacherId', 'fullName email')
    .lean();

    // Transform messages to match frontend expectations
    const transformedMessages = messages.map((msg: any) => ({
      _id: msg._id,
      studentId: msg.studentId._id || msg.studentId,
      teacherId: msg.teacherId._id || msg.teacherId,
      subjectName: msg.subjectName,
      courseName: msg.courseName,
      message: msg.message,
      senderType: msg.senderType,
      timestamp: msg.timestamp,
      isRead: msg.isRead,
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt
    }));

    return jsonResponse.success({
      messages: transformedMessages
    }, "Chat messages retrieved successfully");
  } catch (error: any) {
    console.error("Error fetching chat messages:", error);
    return jsonResponse.serverError("Failed to fetch chat messages");
  }
});

export default router;