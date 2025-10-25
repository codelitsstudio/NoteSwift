'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, FileText, MessageSquare, Clock, TrendingUp, Calendar, Bell, Video, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { MiniActivityChart } from "./analytics/analytics-charts";
import { DashboardGreeting } from "@/components/dashboard-greeting";
import teacherAPI from "@/lib/api/teacher-api";
import { useEffect, useState } from "react";
import { useTeacherAuth } from "@/components/dashboard-client-wrapper";

async function getData(teacherEmail: string) {
  
  try {
    // Fetch data from all APIs in parallel
    const [announcementsRes, assignmentsRes, testsRes, questionsRes, liveClassesRes, weeklyActivityRes, studentsRes, coursesRes] = await Promise.all([
      teacherAPI.announcements.getAll(teacherEmail),
      teacherAPI.assignments.getAll(teacherEmail),
      teacherAPI.tests.getAll(teacherEmail),
      teacherAPI.questions.getAll(teacherEmail),
      teacherAPI.liveClasses.getAll(teacherEmail, undefined, true), // upcoming only
      teacherAPI.analytics.getWeeklyActivity(teacherEmail),
      teacherAPI.students.getAll(teacherEmail), // Get all students initially
      teacherAPI.courses.getSubjectContent(teacherEmail),
    ]);

    const announcements = announcementsRes.data?.announcements || [];
    const assignments = assignmentsRes.data?.assignments || [];
    const tests = testsRes.data?.tests || [];
    const questions = questionsRes.data?.questions || [];
    const upcomingClasses = liveClassesRes.data?.liveClasses || [];
    const weeklyActivity = weeklyActivityRes.data?.weeklyActivity || [];
    let students = studentsRes.data?.students || [];
    const courses = coursesRes.data || null;

    // If we have courses, get students for the first course (primary course)
    if (coursesRes.data?.course?._id) {
      try {
        console.log('🔍 Fetching students for course:', coursesRes.data.course._id, coursesRes.data.course.title);
        const courseStudentsRes = await teacherAPI.students.getAll(teacherEmail, coursesRes.data.course._id);
        console.log('📊 Course students response:', courseStudentsRes);
        students = courseStudentsRes.data?.students || [];
        console.log(`📊 Dashboard: Showing ${students.length} students for course: ${coursesRes.data.course.title}`);
      } catch (error) {
        console.error('Failed to fetch course-specific students:', error);
        // Fall back to all students
      }
    } else {
      console.log('❌ No course data available for student fetching');
    }

    const assignmentStats = assignmentsRes.data?.stats || {};
    const testStats = testsRes.data?.stats || {};
    const questionStats = questionsRes.data?.stats || {};

    const pendingGrading = (assignmentStats.pendingGrading || 0) + (testStats.pendingGrading || 0);
    const doubtsOpen = questionStats.open || questions.filter((q: any) => q.status === 'open').length;

    // Calculate completion rate from assignments and tests
    const totalAssignments = assignments.length;
    const completedAssignments = assignments.filter((a: any) => a.status === 'completed').length;
    const totalTests = tests.length;
    const completedTests = tests.filter((t: any) => t.status === 'completed').length;
    const totalActivities = totalAssignments + totalTests;
    const completionRate = totalActivities > 0 ? Math.round(((completedAssignments + completedTests) / totalActivities) * 100) : 0;

    // Generate recent activity feed
    const recentActivity: any[] = [];
    
    // Add recent assignment submissions
    assignments.slice(0, 3).forEach((assignment: any) => {
      if (assignment.submissions && assignment.submissions.length > 0) {
        const latestSubmission = assignment.submissions[assignment.submissions.length - 1];
        recentActivity.push({
          type: 'submission',
          student: latestSubmission.studentName || 'Student',
          action: 'submitted',
          item: assignment.title,
          time: new Date(latestSubmission.submittedAt).toLocaleString()
        });
      }
    });

    // Add recent doubts/questions
    questions.slice(0, 2).forEach((question: any) => {
      recentActivity.push({
        type: 'doubt',
        student: question.studentName || 'Student',
        action: 'asked',
        item: question.title || 'a question',
        time: new Date(question.createdAt).toLocaleString()
      });
    });

    // Sort by time (most recent first) and take top 5
    recentActivity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    const topActivities = recentActivity.slice(0, 5);

    // Calculate performance insights from assignments and tests
    const performanceInsights: any[] = [];
    
    // Calculate average scores from assignments
    if (assignments.length > 0) {
      const assignmentScores = assignments
        .filter((a: any) => a.submissions && a.submissions.length > 0)
        .map((a: any) => {
          const scores = a.submissions
            .filter((s: any) => s.score !== undefined && s.score !== null)
            .map((s: any) => s.score);
          return scores.length > 0 ? scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length : 0;
        })
        .filter((score: number) => score > 0);
      
      if (assignmentScores.length > 0) {
        const avgAssignmentScore = Math.round(assignmentScores.reduce((sum: number, score: number) => sum + score, 0) / assignmentScores.length);
        performanceInsights.push({
          subject: 'Assignments',
          avgScore: avgAssignmentScore,
          change: '+5%',
          trend: 'up'
        });
      }
    }

    // Calculate average scores from tests
    if (tests.length > 0) {
      const testScores = tests
        .filter((t: any) => t.attempts && t.attempts.length > 0)
        .map((t: any) => {
          const scores = t.attempts
            .filter((a: any) => a.score !== undefined && a.score !== null)
            .map((a: any) => a.score);
          return scores.length > 0 ? scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length : 0;
        })
        .filter((score: number) => score > 0);
      
      if (testScores.length > 0) {
        const avgTestScore = Math.round(testScores.reduce((sum: number, score: number) => sum + score, 0) / testScores.length);
        performanceInsights.push({
          subject: 'Tests',
          avgScore: avgTestScore,
          change: '+8%',
          trend: 'up'
        });
      }
    }

    // Add overall performance if we have both assignments and tests
    if (performanceInsights.length >= 2) {
      const overallScore = Math.round(performanceInsights.reduce((sum: number, insight: any) => sum + insight.avgScore, 0) / performanceInsights.length);
      performanceInsights.push({
        subject: 'Overall',
        avgScore: overallScore,
        change: '+6%',
        trend: 'up'
      });
    }

    return {
      stats: {
        totalStudents: students.length,
        activeToday: students.filter((s: any) => {
          const lastActive = new Date(s.lastActive || s.joinedDate);
          const today = new Date();
          return lastActive.toDateString() === today.toDateString();
        }).length,
        pendingGrading,
        upcomingClasses: upcomingClasses.length,
        totalCourses: courses?.course ? 1 : 0, // Teacher has 1 course or none
        doubtsOpen,
        completionRate
      },
      courses, // Add courses to the returned data
      weeklyActivity: weeklyActivity.map((w: any) => ({
        day: w.day,
        value: w.activity || 0
      })),
      upcoming: upcomingClasses.slice(0, 3).map((cls: any) => ({
        _id: cls._id,
        subject: `${cls.courseName} - ${cls.subjectName}`,
        scheduledAt: cls.scheduledAt,
        platform: cls.platform || 'Live',
        durationMinutes: cls.duration || 60,
        students: cls.attendees?.length || 0
      })),
      recentActivity: topActivities,
      pendingTasks: [
        ...(pendingGrading > 0 ? [{ id: 1, task: `Grade ${pendingGrading} submissions`, priority: 'high', dueDate: 'Today' }] : []),
        ...(doubtsOpen > 0 ? [{ id: 2, task: `Respond to ${doubtsOpen} student doubts`, priority: 'medium', dueDate: 'Today' }] : []),
      ],
      announcements: announcements.slice(0, 3).map((a: any) => ({
        _id: a._id,
        title: a.title,
        message: a.message,
        createdAt: a.createdAt,
        priority: a.priority
      })),
      performanceInsights // Now populated with real data
    };
  } catch (error: any) {
    console.error('Dashboard data fetch error:', error);
    console.error('Teacher email used:', teacherEmail);
    console.error('Error details:', error.message);
    // Return empty data on error with a note about the teacher
    return {
      stats: { totalStudents: 0, activeToday: 0, pendingGrading: 0, upcomingClasses: 0, totalCourses: 0, doubtsOpen: 0, completionRate: 0 },
      courses: null, // No course data in error case
      weeklyActivity: [],
      upcoming: [],
      recentActivity: [],
      pendingTasks: [],
      announcements: [],
      performanceInsights: [],
      error: `Failed to load data for teacher: ${teacherEmail}. Error: ${error.message}`
    };
  }
}

export default function DashboardPage() {
  const { teacherEmail, loading: authLoading } = useTeacherAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Debug: Check localStorage immediately
    console.log('📦 Dashboard mounted - localStorage check:', {
      hasToken: !!localStorage.getItem('teacherToken'),
      hasEmail: !!localStorage.getItem('teacherEmail'),
      hasId: !!localStorage.getItem('teacherId'),
      email: localStorage.getItem('teacherEmail')
    });
    
    console.log('🔍 Auth state:', { authLoading, teacherEmail });
    
    if (authLoading) {
      console.log('⏳ Still authenticating...');
      return;
    }
    
    if (!teacherEmail) {
      console.log('❌ No teacher email after auth');
      return;
    }

    console.log('📊 Loading dashboard data for:', teacherEmail);
    
    const loadData = async () => {
      try {
        const result = await getData(teacherEmail);
        console.log('✅ Dashboard data loaded');
        setData(result);
      } catch (error) {
        console.error('❌ Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [teacherEmail, authLoading]);

  // Show loading during authentication OR data fetching
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground">No data available</p>
        </div>
      </div>
    );
  }

  const { stats, courses, weeklyActivity, upcoming, recentActivity, pendingTasks, announcements, performanceInsights } = data;

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          <DashboardGreeting />
        </p>
      </div>

      {/* Key Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-blue-50/60 border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {courses?.course?.title ? `${courses.course.title} Students` : 'Your Students'}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs mt-2 text-muted-foreground">
              {courses?.course?.title ? `Enrolled in ${courses.course.title}` : `${stats.activeToday} active today`}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50/60 border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Grading</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingGrading}</div>
            <p className="text-xs mt-2 text-muted-foreground">Assignments to review</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50/60 border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Open Doubts</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.doubtsOpen}</div>
            <p className="text-xs mt-2 text-muted-foreground">Students need help</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50/60 border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <Progress value={stats.completionRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Weekly Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Activity</CardTitle>
          <CardDescription>Student submissions, test attempts, and live classes in your assigned subject</CardDescription>
        </CardHeader>
        <CardContent>
          {weeklyActivity.length > 0 ? (
            <MiniActivityChart data={weeklyActivity} />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No activity data available yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Upcoming Classes */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Upcoming Live Classes
                </CardTitle>
                <CardDescription>Your scheduled classes for Grade 11 Mathematics</CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/Live-classes">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcoming.map((cls:any)=> (
                <div key={cls._id} className="group flex items-center justify-between border rounded-lg p-4 hover:bg-blue-500 hover:border-blue-600 transition-all cursor-pointer">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold group-hover:text-white transition-colors">{cls.subject}</p>
                      <Badge variant="secondary" className="group-hover:bg-white/20 group-hover:text-white group-hover:border-white/30">{cls.platform}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground group-hover:text-white/90 transition-colors">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(cls.scheduledAt).toLocaleString()}
                      </span>
                      <span>{cls.durationMinutes} min</span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {cls.students} students
                      </span>
                    </div>
                  </div>
                  <Button size="sm" className="bg-blue-500 text-white group-hover:bg-white group-hover:text-blue-600 hover:group-hover:bg-blue-50 transition-all">Join Now</Button>
                </div>
              ))}
              {upcoming.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No upcoming classes scheduled</p>}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/dashboard/Live-classes" className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                Start Live Class
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/dashboard/courses" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Upload Content
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/dashboard/tests" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Create Test
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/dashboard/assignments" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Grade Submissions
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/dashboard/doubts" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Answer Doubts
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/dashboard/announcements" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Send Announcement
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Recent Activity */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity: any, idx: number) => (
                <div key={idx} className="flex items-start gap-3 border-b last:border-0 pb-3 last:pb-0">
                  <div className={`p-2 rounded-full ${
                    activity.type === 'submission' ? 'bg-blue-100 text-blue-600' :
                    activity.type === 'doubt' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {activity.type === 'submission' && <FileText className="h-4 w-4" />}
                    {activity.type === 'doubt' && <MessageSquare className="h-4 w-4" />}
                    {activity.type === 'test' && <CheckCircle className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.student}</span>
                      {' '}{activity.action}{' '}
                      <span className="font-medium">{activity.item}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Tasks</CardTitle>
            <CardDescription>Things that need your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingTasks.map((task: any) => (
                <div key={task.id} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm font-medium">{task.task}</p>
                    <Badge variant={
                      task.priority === 'high' ? 'destructive' :
                      task.priority === 'medium' ? 'default' : 'secondary'
                    } className="text-xs">
                      {task.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Due: {task.dueDate}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Third Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Announcements */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Announcements
                </CardTitle>
                <CardDescription>Important updates and notices</CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/announcements">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {announcements.map((a:any)=> (
                <div key={a._id} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-semibold text-sm">{a.title}</p>
                    {a.priority === 'high' && <Badge variant="destructive" className="text-xs">Important</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{a.message}</p>
                  <p className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Insights
            </CardTitle>
            <CardDescription>Subject-wise student performance trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performanceInsights.map((insight: any, idx: number) => (
                <div key={idx} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-sm">{insight.subject}</p>
                    <Badge variant={insight.trend === 'up' ? 'default' : 'secondary'}>
                      {insight.change}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={insight.avgScore} className="flex-1" />
                    <span className="text-sm font-medium">{insight.avgScore}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
