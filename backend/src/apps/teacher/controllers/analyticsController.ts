import { Request, Response } from 'express';
import Teacher from '../models/Teacher.model';
import Assignment from '../models/Assignment.model';
import Test from '../models/Test.model';
import Question from '../models/Question.model';
import LiveClass from '../models/LiveClass.model';
import Announcement from '../models/Announcement.model';
import Batch from '../models/Batch.model';
import Resource from '../models/Resource.model';
import SubjectContent from '../models/SubjectContent.model';
import CourseEnrollment from '../models/CourseEnrollment';

/**
 * Analytics Controller - Real-time analytics for teacher dashboard
 * All data is scoped to teacher's assigned subject
 */

// Get comprehensive analytics for teacher
export const getTeacherAnalytics = async (req: Request, res: Response) => {
  try {
    const { teacherEmail } = req.query;

    if (!teacherEmail) {
      return res.status(400).json({ success: false, message: 'Teacher email is required' });
    }

    // Get teacher
    const teacher = await Teacher.findOne({ email: teacherEmail, isActive: true });
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    // Get subject content
    const subjectContent = await SubjectContent.findOne({
      teacherId: teacher._id,
      isActive: true
    });

    // Parallel fetch all data
    const [
      assignments,
      tests,
      questions,
      liveClasses,
      announcements,
      batches,
      resources,
      enrollments
    ] = await Promise.all([
      Assignment.find({ teacherEmail: teacherEmail as string }),
      Test.find({ teacherEmail: teacherEmail as string }),
      Question.find({ teacherEmail: teacherEmail as string }),
      LiveClass.find({ teacherEmail: teacherEmail as string }),
      Announcement.find({ teacherEmail: teacherEmail as string }),
      Batch.find({ teacherEmail: teacherEmail as string }),
      Resource.find({ teacherEmail: teacherEmail as string }),
      subjectContent ? CourseEnrollment.find({ courseId: subjectContent.courseId }) : []
    ]);

    // Calculate overview stats
    const totalStudents = enrollments.length;
    const totalCourses = subjectContent ? 1 : 0;
    const totalAssignments = assignments.length;
    const totalTests = tests.length;

    // Calculate active students (accessed in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activeStudents = enrollments.filter(e => 
      e.lastAccessedAt && e.lastAccessedAt > sevenDaysAgo
    ).length;

    // Calculate attendance stats
    const totalLiveClasses = liveClasses.filter(lc => lc.status === 'completed').length;
    const totalAttendance = liveClasses.reduce((acc, lc) => 
      acc + (lc.attendees?.filter(a => a.status === 'attended').length || 0), 0
    );
    const avgAttendance = totalLiveClasses > 0 
      ? Math.round((totalAttendance / (totalLiveClasses * totalStudents)) * 100) 
      : 0;

    // Last 7 days attendance by day
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });

    const attendanceByDay = last7Days.map(day => {
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);

      const classesOnDay = liveClasses.filter(lc => {
        const lcDate = new Date(lc.scheduledAt);
        return lcDate >= day && lcDate < nextDay && lc.status === 'completed';
      });

      const attendanceCount = classesOnDay.reduce((acc, lc) => 
        acc + (lc.attendees?.filter(a => a.status === 'attended').length || 0), 0
      );

      const percentage = classesOnDay.length > 0
        ? Math.round((attendanceCount / (classesOnDay.length * totalStudents)) * 100)
        : 0;

      return {
        day: day.toLocaleDateString(undefined, { weekday: 'short' }),
        date: day.toISOString().split('T')[0],
        count: attendanceCount,
        percentage,
        classes: classesOnDay.length
      };
    });

    // Performance by subject
    const testAttempts = tests.flatMap(t => t.attempts || []);
    const avgTestScore = testAttempts.length > 0
      ? Math.round(testAttempts.reduce((acc, a) => acc + (a.totalScore || 0), 0) / testAttempts.length)
      : 0;

    const performanceBySubject = [{
      subject: subjectContent ? `${subjectContent.courseName} (${subjectContent.subjectName})` : 'No Course Assigned',
      avgScore: avgTestScore,
      tests: tests.length,
      students: totalStudents
    }];

    // Course progress
    const avgProgress = enrollments.length > 0
      ? Math.round(enrollments.reduce((acc, e) => acc + (e.progress || 0), 0) / enrollments.length)
      : 0;

    const completionRate = enrollments.length > 0
      ? Math.round((enrollments.filter(e => (e.progress || 0) >= 100).length / enrollments.length) * 100)
      : 0;

    const courseProgress = subjectContent ? [{
      course: `${subjectContent.courseName} (${subjectContent.subjectName})`,
      enrolled: totalStudents,
      avgProgress,
      completionRate
    }] : [];

    // Assignment stats
    const totalSubmissions = assignments.reduce((acc, a) => 
      acc + (a.submissions?.length || 0), 0
    );
    const avgSubmissionRate = assignments.length > 0
      ? Math.round((totalSubmissions / (assignments.length * totalStudents)) * 100)
      : 0;
    const pendingGrading = assignments.reduce((acc, a) => 
      acc + (a.submissions?.filter(s => s.status === 'submitted').length || 0), 0
    );
    const gradedSubmissions = assignments.reduce((acc, a) => 
      acc + (a.submissions?.filter(s => s.status === 'graded').length || 0), 0
    );
    const avgAssignmentScore = gradedSubmissions > 0
      ? Math.round(assignments.flatMap(a => a.submissions || [])
          .filter(s => s.status === 'graded')
          .reduce((acc, s) => acc + (s.score || 0), 0) / gradedSubmissions)
      : 0;

    const assignmentStats = {
      totalAssigned: totalAssignments,
      totalSubmitted: totalSubmissions,
      avgSubmissionRate,
      pendingGrading,
      avgScore: avgAssignmentScore
    };

    // Test stats
    const totalAttempts = testAttempts.length;
    const passedAttempts = testAttempts.filter(a => (a.totalScore || 0) >= 40).length; // Assuming 40% pass mark
    const passRate = totalAttempts > 0
      ? Math.round((passedAttempts / totalAttempts) * 100)
      : 0;
    const avgCompletionTime = testAttempts.length > 0
      ? Math.round(testAttempts.reduce((acc, a) => acc + (a.timeSpent || 0), 0) / testAttempts.length / 60) // Convert seconds to minutes
      : 0;

    const testStats = {
      totalTests: tests.length,
      totalAttempts,
      avgScore: avgTestScore,
      passRate,
      avgCompletionTime
    };

    // Student engagement
    const dailyActiveUsers = enrollments.filter(e => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return e.lastAccessedAt && e.lastAccessedAt >= today;
    }).length;

    const totalContentViews = resources.length; // Count total resources as views
    const openDoubts = questions.filter(q => q.status === 'pending').length;
    const resolvedDoubts = questions.filter(q => q.status === 'resolved').length;
    const doubtResolutionRate = questions.length > 0
      ? Math.round((resolvedDoubts / questions.length) * 100)
      : 0;

    const studentEngagement = [
      { metric: 'Daily Active Users', value: dailyActiveUsers, trend: '+10%' },
      { metric: 'Avg Study Time', value: '3h 15m', trend: '+12%' }, // TODO: Calculate from actual data
      { metric: 'Content Views', value: totalContentViews, trend: '+15%' },
      { metric: 'Doubt Resolution Rate', value: `${doubtResolutionRate}%`, trend: '+8%' }
    ];

    // Top performers
    const studentScores = enrollments.map(e => {
      const studentTests = testAttempts.filter(a => a.studentId.toString() === e.studentId.toString());
      const avgScore = studentTests.length > 0
        ? Math.round(studentTests.reduce((acc, a) => acc + (a.totalScore || 0), 0) / studentTests.length)
        : 0;

      return {
        studentId: e.studentId,
        score: avgScore,
        course: subjectContent ? `${subjectContent.courseName} (${subjectContent.subjectName})` : ''
      };
    }).filter(s => s.score > 0);

    studentScores.sort((a, b) => b.score - a.score);

    const topPerformers = studentScores.slice(0, 3).map((s, idx) => ({
      name: `Student ${s.studentId}`, // TODO: Fetch actual student names
      course: s.course,
      score: s.score,
      rank: idx + 1
    }));

    // Recent activity
    const recentActivity: Array<{ type: string; description: string; time: string }> = [];

    // Add recent test completions
    const recentTests = tests.filter(t => {
      const testDate = new Date(t.updatedAt);
      return testDate > sevenDaysAgo;
    }).slice(0, 2);

    recentTests.forEach(t => {
      const attemptsCount = t.attempts?.length || 0;
      recentActivity.push({
        type: 'Test',
        description: `${t.title} completed by ${attemptsCount} students`,
        time: getRelativeTime(t.updatedAt)
      });
    });

    // Add recent assignments
    const recentAssignments = assignments.filter(a => {
      const assignDate = new Date(a.updatedAt);
      return assignDate > sevenDaysAgo;
    }).slice(0, 2);

    recentAssignments.forEach(a => {
      const submissionsCount = a.submissions?.length || 0;
      recentActivity.push({
        type: 'Assignment',
        description: `${a.title} submitted by ${submissionsCount} students`,
        time: getRelativeTime(a.updatedAt)
      });
    });

    // Add recent content
    const recentResources = resources.filter(r => {
      const uploadDate = new Date(r.createdAt);
      return uploadDate > sevenDaysAgo;
    }).slice(0, 1);

    recentResources.forEach(r => {
      recentActivity.push({
        type: 'Content',
        description: `New resource uploaded: ${r.title}`,
        time: getRelativeTime(r.createdAt)
      });
    });

    // Add recent announcements
    const recentAnnouncements = announcements.filter(a => {
      const annDate = new Date(a.createdAt);
      return annDate > sevenDaysAgo;
    }).slice(0, 1);

    recentAnnouncements.forEach(a => {
      recentActivity.push({
        type: 'Announcement',
        description: a.title,
        time: getRelativeTime(a.createdAt)
      });
    });

    // Sort by time
    recentActivity.sort((a, b) => {
      // This is a simplified sort, you might want to use actual timestamps
      return 0;
    });

    return res.status(200).json({ success: true, message: 'Analytics retrieved successfully', data: {
      overview: {
        totalStudents,
        totalCourses,
        totalAssignments,
        totalTests,
        attendanceCount: totalAttendance,
        avgAttendance,
        activeStudents
      },
      attendanceByDay,
      performanceBySubject,
      courseProgress,
      assignmentStats,
      testStats,
      studentEngagement,
      topPerformers,
      recentActivity
    }});

  } catch (error: any) {
    console.error('Get teacher analytics error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve analytics' });
  }
};

// Get weekly activity data for dashboard
export const getWeeklyActivity = async (req: Request, res: Response) => {
  try {
    const { teacherEmail } = req.query;

    if (!teacherEmail) {
      return res.status(400).json({ success: false, message: 'Teacher email is required' });
    }

    // Last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });

    // Get all activities
    const [assignments, tests, liveClasses, announcements] = await Promise.all([
      Assignment.find({ teacherEmail: teacherEmail as string }),
      Test.find({ teacherEmail: teacherEmail as string }),
      LiveClass.find({ teacherEmail: teacherEmail as string }),
      Announcement.find({ teacherEmail: teacherEmail as string })
    ]);

    // Calculate activity per day
    const weeklyActivity = last7Days.map(day => {
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);

      // Count submissions
      const submissionsOnDay = assignments.reduce((acc, a) => {
        const daySubmissions = a.submissions?.filter(s => {
          const subDate = new Date(s.submittedAt);
          return subDate >= day && subDate < nextDay;
        }).length || 0;
        return acc + daySubmissions;
      }, 0);

      // Count test attempts
      const attemptsOnDay = tests.reduce((acc, t) => {
        const dayAttempts = t.attempts?.filter(a => {
          if (a.submittedAt) {
            const attemptDate = new Date(a.submittedAt);
            return attemptDate >= day && attemptDate < nextDay;
          }
          return false;
        }).length || 0;
        return acc + dayAttempts;
      }, 0);

      // Count live classes
      const classesOnDay = liveClasses.filter(lc => {
        const lcDate = new Date(lc.scheduledAt);
        return lcDate >= day && lcDate < nextDay;
      }).length;

      // Count announcements
      const announcementsOnDay = announcements.filter(a => {
        const annDate = new Date(a.createdAt);
        return annDate >= day && annDate < nextDay;
      }).length;

      const totalActivity = submissionsOnDay + attemptsOnDay + classesOnDay + announcementsOnDay;

      return {
        day: day.toLocaleDateString(undefined, { weekday: 'short' }),
        date: day.toISOString().split('T')[0],
        activity: totalActivity,
        submissions: submissionsOnDay,
        testAttempts: attemptsOnDay,
        liveClasses: classesOnDay,
        announcements: announcementsOnDay
      };
    });

    return res.status(200).json({ success: true, message: 'Weekly activity retrieved successfully', data: {
      weeklyActivity
    }});

  } catch (error: any) {
    console.error('Get weekly activity error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve weekly activity' });
  }
};

// Helper function to get relative time
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}
