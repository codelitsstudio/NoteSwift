import { Router } from "express";
import CourseEnrollment from "../../models/CourseEnrollment";
import { Student } from "../../models/students/Student.model";
import Assignment from "../../models/Assignment.model";
import Test from "../../models/Test.model";
import LiveClass from "../../models/LiveClass.model";
import JsonResponse from "../../lib/Response";

const router = Router();

// GET /api/teacher/students?teacherEmail=email&courseId=id
router.get("/", async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const teacher = res.locals.teacher;
    const { courseId } = req.query;

    if (!teacher) {
      return jsonResponse.notAuthorized("Teacher not authenticated");
    }

    // Get teacher's assigned courses
    const assignedCourses = teacher.assignedCourses || [];
    const teacherCourseIds = assignedCourses.map((ac: any) => ac.courseId);

    // Filter by specific course if provided
    let courseIds = teacherCourseIds;
    if (courseId) {
      if (!teacherCourseIds.some((id: any) => id.toString() === courseId)) {
        return jsonResponse.notAuthorized("Teacher not assigned to this course");
      }
      courseIds = [courseId as string];
    }

    // Get enrollments for teacher's courses
    const enrollments = await CourseEnrollment.find({
      courseId: { $in: courseIds }
    }).populate('studentId', 'firstName lastName email');

    // Get assignments and tests for progress calculation
    const assignments = await Assignment.find({
      courseId: { $in: courseIds }
    });

    const tests = await Test.find({
      courseId: { $in: courseIds }
    });

    // Get live classes for attendance calculation
    const liveClasses = await LiveClass.find({
      courseId: { $in: courseIds }
    });

    // Get student details and calculate progress
    const students = await Promise.all(enrollments.map(async (enrollment: any) => {
      const student = enrollment.studentId;
      if (!student) return null;

      const studentId = student._id.toString();

      // Calculate progress from assignments and tests
      const studentAssignments = assignments.filter(a => 
        a.submissions.some(s => s.studentId.toString() === studentId)
      );
      
      const studentTests = tests.filter(t => 
        t.attempts.some(attempt => attempt.studentId.toString() === studentId)
      );

      const totalActivities = assignments.length + tests.length;
      const completedActivities = studentAssignments.length + studentTests.length;
      const overallProgress = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;

      // Calculate attendance from live classes
      const studentAttendance = liveClasses.map(liveClass => {
        const attendee = liveClass.attendees.find(a => a.studentId.toString() === studentId);
        return attendee ? attendee.status === 'attended' : false;
      });

      const totalClasses = liveClasses.length;
      const attendedClasses = studentAttendance.filter(attended => attended).length;
      const attendanceRate = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0;

      // Calculate assignments completed and scores
      const studentSubmissions = assignments.flatMap(a => 
        a.submissions.filter(s => s.studentId.toString() === studentId)
      );
      
      const assignmentsCompleted = studentSubmissions.filter(s => s.status === 'graded').length;
      const totalAssignments = assignments.length;
      
      // Calculate average score from assignments and tests
      const assignmentScores: number[] = [];
      assignments.forEach((assignment: any) => {
        const submission = assignment.submissions.find((s: any) => s.studentId.toString() === studentId);
        if (submission && submission.score !== undefined && submission.score !== null) {
          assignmentScores.push((submission.score / assignment.totalMarks) * 100);
        }
      });
      
      const testScores: number[] = [];
      tests.forEach((test: any) => {
        const attempt = test.attempts.find((a: any) => a.studentId.toString() === studentId);
        if (attempt && attempt.percentage !== undefined) {
          testScores.push(attempt.percentage);
        }
      });
      
      const allScores = [...assignmentScores, ...testScores];
      const averageScore = allScores.length > 0 ? Math.round(allScores.reduce((sum: number, score: number) => sum + score, 0) / allScores.length) : 0;

      // Get all enrolled courses for this student
      const studentEnrollments = await CourseEnrollment.find({
        studentId: student._id
      }).populate('courseId', 'name');
      
      const enrolledCourses = studentEnrollments.map(enrollment => enrollment.courseId);

      // Get last active from recent submissions/attempts
      const recentActivities = [
        ...studentSubmissions.map(s => s.submittedAt),
        ...tests.flatMap(t => t.attempts.filter(a => a.studentId.toString() === studentId).map(a => a.submittedAt || a.startedAt))
      ].filter(date => date).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      
      const lastActive = recentActivities.length > 0 ? recentActivities[0] : enrollment.enrolledAt;

      return {
        _id: student._id,
        name: `${student.firstName} ${student.lastName}`,
        email: student.email,
        enrolledCourses,
        overallProgress,
        attendanceRate,
        assignmentsCompleted,
        totalAssignments,
        averageScore,
        lastActive,
        joinedDate: enrollment.enrolledAt
      };
    }));

    // Filter out null students
    const validStudents = students.filter(s => s !== null);

    jsonResponse.success({
      students: validStudents,
      totalCount: validStudents.length
    });

  } catch (error) {
    console.error("Error fetching students:", error);
    jsonResponse.serverError("Failed to fetch students");
  }
});

export default router;