import { Router } from "express";
import CourseEnrollment from "../../models/CourseEnrollment";
import LiveClass from "../../models/LiveClass.model";
import Test from "../../models/Test.model";
import Assignment from "../../models/Assignment.model";
import JsonResponse from "../../lib/Response";

const router = Router();

// GET /api/teacher/analytics?teacherEmail=email
router.get("/", async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const teacher = res.locals.teacher;

    if (!teacher) {
      return jsonResponse.notAuthorized("Teacher not authenticated");
    }

    // Get teacher's assigned courses
    const assignedCourses = teacher.assignedCourses || [];
    const courseIds = assignedCourses.map((ac: any) => ac.courseId);

    // Get enrollments for teacher's courses
    const enrollments = await CourseEnrollment.find({
      courseId: { $in: courseIds }
    });

    // Get live classes for teacher's courses
    const liveClasses = await LiveClass.find({
      courseId: { $in: courseIds }
    });

    // Get tests for teacher's courses
    const tests = await Test.find({
      courseId: { $in: courseIds }
    });

    // Get assignments for teacher's courses
    const assignments = await Assignment.find({
      courseId: { $in: courseIds }
    });

    // Calculate overview stats
    const totalAttended = liveClasses.reduce((sum, lc) => sum + (lc.totalAttended || 0), 0);
    const totalRegistered = liveClasses.reduce((sum, lc) => sum + (lc.totalRegistered || 0), 0);
    const avgAttendance = totalRegistered > 0 ? Math.round((totalAttended / totalRegistered) * 100) : 0;

    const overview = {
      totalStudents: enrollments.length,
      totalCourses: courseIds.length,
      totalAssignments: assignments.length,
      totalTests: tests.length,
      attendanceCount: liveClasses.length,
      avgAttendance
    };

    // Calculate attendance by day (last 7 days)
    const attendanceByDay = [];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    for (const day of last7Days) {
      const dayStart = new Date(day + 'T00:00:00.000Z');
      const dayEnd = new Date(day + 'T23:59:59.999Z');
      
      const dayClasses = liveClasses.filter(lc => 
        lc.scheduledAt >= dayStart && lc.scheduledAt <= dayEnd
      );
      
      const dayAttended = dayClasses.reduce((sum, lc) => sum + (lc.totalAttended || 0), 0);
      const dayRegistered = dayClasses.reduce((sum, lc) => sum + (lc.totalRegistered || 0), 0);
      
      attendanceByDay.push({
        day: new Date(day).toLocaleDateString('en-US', { weekday: 'short' }),
        count: dayRegistered > 0 ? Math.round((dayAttended / dayRegistered) * 100) : 0
      });
    }

    // Calculate performance by subject
    const performanceBySubject: any[] = [];
    const subjectMap = new Map<string, { assignments: any[], tests: any[] }>();

    // Group assignments and tests by subject
    assignments.forEach((assignment: any) => {
      const subject = assignment.subjectName;
      if (!subjectMap.has(subject)) {
        subjectMap.set(subject, { assignments: [], tests: [] });
      }
      subjectMap.get(subject)!.assignments.push(assignment);
    });
    
    tests.forEach((test: any) => {
      const subject = test.subjectName;
      if (!subjectMap.has(subject)) {
        subjectMap.set(subject, { assignments: [], tests: [] });
      }
      subjectMap.get(subject)!.tests.push(test);
    });

    for (const [subject, data] of Array.from(subjectMap.entries())) {
      const allScores: number[] = [];
      
      // Calculate assignment scores
      data.assignments.forEach((assignment: any) => {
        assignment.submissions.forEach((submission: any) => {
          if (submission.score !== undefined && submission.score !== null) {
            allScores.push((submission.score / assignment.totalMarks) * 100);
          }
        });
      });
      
      // Calculate test scores
      data.tests.forEach((test: any) => {
        test.attempts.forEach((attempt: any) => {
          if (attempt.percentage !== undefined) {
            allScores.push(attempt.percentage);
          }
        });
      });
      
      if (allScores.length > 0) {
        const avgScore = Math.round(allScores.reduce((sum: number, score: number) => sum + score, 0) / allScores.length);
        performanceBySubject.push({
          subject,
          avgScore,
          totalAssessments: data.assignments.length + data.tests.length,
          totalSubmissions: allScores.length
        });
      }
    }

    // Calculate course progress (simplified - based on assignments/tests completion)
    const courseProgress = [];
    for (const courseId of courseIds) {
      const courseAssignments = assignments.filter(a => a.courseId.toString() === courseId.toString());
      const courseTests = tests.filter(t => t.courseId.toString() === courseId.toString());
      const courseEnrollments = enrollments.filter(e => e.courseId.toString() === courseId.toString());
      
      const totalActivities = courseAssignments.length + courseTests.length;
      const completedActivities = courseAssignments.filter(a => a.status === 'closed').length + 
                                  courseTests.filter(t => t.status === 'closed').length;
      
      const progress = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;
      
      courseProgress.push({
        courseId,
        courseName: courseAssignments[0]?.courseName || courseTests[0]?.courseName || 'Unknown Course',
        totalStudents: courseEnrollments.length,
        progress,
        completedActivities,
        totalActivities
      });
    }

    // Calculate assignment stats
    const totalSubmitted = assignments.reduce((sum, a) => sum + a.totalSubmissions, 0);
    const totalPendingGrading = assignments.reduce((sum, a) => sum + a.pendingGrading, 0);
    const avgSubmissionRate = assignments.length > 0 ? Math.round((totalSubmitted / (assignments.length * enrollments.length)) * 100) : 0;
    
    const gradedSubmissions = assignments.flatMap((a: any) => a.submissions.filter((s: any) => s.score !== undefined));
    const avgScore = gradedSubmissions.length > 0 
      ? Math.round(gradedSubmissions.reduce((sum: number, s: any) => {
          const assignment = assignments.find((a: any) => a._id.toString() === s._id?.toString());
          const percentage = assignment ? ((s.score || 0) / assignment.totalMarks) * 100 : 0;
          return sum + percentage;
        }, 0) / gradedSubmissions.length)
      : 0;

    const assignmentStats = {
      totalAssigned: assignments.length,
      totalSubmitted,
      avgSubmissionRate,
      pendingGrading: totalPendingGrading,
      avgScore
    };

    // Calculate test stats
    const totalAttempts = tests.reduce((sum, t) => sum + t.totalAttempts, 0);
    const evaluatedAttempts = tests.flatMap(t => t.attempts.filter(a => a.status === 'evaluated'));
    const testAvgScore = evaluatedAttempts.length > 0 
      ? Math.round(evaluatedAttempts.reduce((sum, a) => sum + a.percentage, 0) / evaluatedAttempts.length)
      : 0;
    
    const passRate = evaluatedAttempts.length > 0 
      ? Math.round((evaluatedAttempts.filter(a => a.percentage >= 40).length / evaluatedAttempts.length) * 100)
      : 0;
    
    const avgCompletionTime = evaluatedAttempts.length > 0 
      ? Math.round(evaluatedAttempts.reduce((sum, a) => sum + a.timeSpent, 0) / evaluatedAttempts.length / 60) // in minutes
      : 0;

    const testStats = {
      totalTests: tests.length,
      totalAttempts,
      avgScore: testAvgScore,
      passRate,
      avgCompletionTime
    };

    // Calculate student engagement (simplified)
    const studentEngagement = [];
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    
    // Group activity by student
    const studentActivity = new Map();
    
    assignments.forEach(assignment => {
      assignment.submissions.forEach(submission => {
        const studentId = submission.studentId.toString();
        if (!studentActivity.has(studentId)) {
          studentActivity.set(studentId, { 
            name: submission.studentName,
            assignments: 0, 
            tests: 0, 
            lastActivity: new Date(0)
          });
        }
        const activity = studentActivity.get(studentId);
        activity.assignments++;
        if (submission.submittedAt > activity.lastActivity) {
          activity.lastActivity = submission.submittedAt;
        }
      });
    });
    
    tests.forEach(test => {
      test.attempts.forEach(attempt => {
        const studentId = attempt.studentId.toString();
        if (!studentActivity.has(studentId)) {
          studentActivity.set(studentId, { 
            name: attempt.studentName,
            assignments: 0, 
            tests: 0, 
            lastActivity: new Date(0)
          });
        }
        const activity = studentActivity.get(studentId);
        activity.tests++;
        if (attempt.submittedAt && attempt.submittedAt > activity.lastActivity) {
          activity.lastActivity = attempt.submittedAt;
        }
      });
    });
    
    // Convert to array and sort by total activity
    studentEngagement.push(...Array.from(studentActivity.values())
      .map(activity => ({
        studentName: activity.name,
        totalActivities: activity.assignments + activity.tests,
        lastActivity: activity.lastActivity
      }))
      .sort((a, b) => b.totalActivities - a.totalActivities)
      .slice(0, 10));

    // Calculate top performers
    const topPerformers = [];
    const studentScores = new Map();
    
    // Collect all scores by student
    assignments.forEach(assignment => {
      assignment.submissions.forEach(submission => {
        if (submission.score !== undefined) {
          const studentId = submission.studentId.toString();
          if (!studentScores.has(studentId)) {
            studentScores.set(studentId, { 
              name: submission.studentName, 
              scores: [], 
              totalScore: 0,
              count: 0
            });
          }
          const studentData = studentScores.get(studentId);
          const percentage = (submission.score / assignment.totalMarks) * 100;
          studentData.scores.push(percentage);
          studentData.totalScore += percentage;
          studentData.count++;
        }
      });
    });
    
    tests.forEach(test => {
      test.attempts.forEach(attempt => {
        if (attempt.percentage !== undefined) {
          const studentId = attempt.studentId.toString();
          if (!studentScores.has(studentId)) {
            studentScores.set(studentId, { 
              name: attempt.studentName, 
              scores: [], 
              totalScore: 0,
              count: 0
            });
          }
          const studentData = studentScores.get(studentId);
          studentData.scores.push(attempt.percentage);
          studentData.totalScore += attempt.percentage;
          studentData.count++;
        }
      });
    });
    
    // Calculate averages and get top performers
    topPerformers.push(...Array.from(studentScores.values())
      .map(student => ({
        studentName: student.name,
        avgScore: Math.round(student.totalScore / student.count),
        totalAssessments: student.count
      }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 5));

    // Calculate recent activity (last 10 activities)
    const recentActivity: any[] = [];
    
    assignments.forEach(assignment => {
      assignment.submissions.slice(-2).forEach(submission => {
        recentActivity.push({
          type: 'assignment',
          studentName: submission.studentName,
          itemTitle: assignment.title,
          timestamp: submission.submittedAt,
          score: submission.score ? `${Math.round((submission.score / assignment.totalMarks) * 100)}%` : 'Pending'
        });
      });
    });
    
    tests.forEach(test => {
      test.attempts.slice(-2).forEach(attempt => {
        recentActivity.push({
          type: 'test',
          studentName: attempt.studentName,
          itemTitle: test.title,
          timestamp: attempt.submittedAt || attempt.startedAt,
          score: `${Math.round(attempt.percentage)}%`
        });
      });
    });
    
    // Sort by timestamp and take last 10
    recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const finalRecentActivity = recentActivity.slice(0, 10);

    jsonResponse.success({
      overview,
      attendanceByDay,
      performanceBySubject,
      courseProgress,
      assignmentStats,
      testStats,
      studentEngagement,
      topPerformers,
      recentActivity: finalRecentActivity
    });

  } catch (error) {
    console.error("Error fetching analytics:", error);
    jsonResponse.serverError("Failed to fetch analytics");
  }
});

export default router;