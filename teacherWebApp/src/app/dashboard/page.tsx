// BACKEND TEMPORARILY DISABLED FOR FRONTEND DEVELOPMENT
// import dbConnect from "@/lib/mongoose";
// import LiveClass from "@/models/LiveClass";
// import Announcement from "@/models/Announcement";
// import Attendance from "@/models/Attendance";
// import { Submission } from "@/models/Assignment";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, FileText, MessageSquare, Clock, TrendingUp, Calendar, Bell, Video, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { MiniActivityChart } from "./analytics/analytics-charts";
import { DashboardGreeting } from "@/components/dashboard-greeting";

async function getData() {
  // MOCK DATA FOR FRONTEND DEVELOPMENT
  return {
    stats: {
      totalStudents: 3,
      activeToday: 2,
      pendingGrading: 5,
      upcomingClasses: 2,
      totalCourses: 1,
      doubtsOpen: 3,
      completionRate: 85
    },
    upcoming: [
      { _id: '1', subject: 'Grade 11 Mathematics - Algebra', scheduledAt: new Date(Date.now() + 3600000).toISOString(), platform: 'Live', durationMinutes: 60, students: 3 },
      { _id: '2', subject: 'Grade 11 Mathematics - Calculus', scheduledAt: new Date(Date.now() + 86400000).toISOString(), platform: 'Live', durationMinutes: 90, students: 3 }
    ],
    recentActivity: [
      { type: 'submission', student: 'Jane Smith', action: 'submitted', item: 'Grade 11 Math - Algebra Assignment', time: '5 min ago' },
      { type: 'doubt', student: 'Mike Johnson', action: 'asked a doubt in', item: 'Grade 11 Math - Calculus', time: '12 min ago' },
      { type: 'test', student: 'Emily Davis', action: 'completed', item: 'Grade 11 Math - Mid-term', time: '1 hour ago' },
      { type: 'submission', student: 'Jane Smith', action: 'submitted', item: 'Grade 11 Math - Geometry Quiz', time: '2 hours ago' }
    ],
    pendingTasks: [
      { id: 1, task: 'Grade 5 Math assignment submissions', priority: 'high', dueDate: 'Today' },
      { id: 2, task: 'Respond to 3 student doubts', priority: 'medium', dueDate: 'Tomorrow' },
      { id: 3, task: 'Upload Grade 11 Math - Calculus notes', priority: 'low', dueDate: 'This week' },
      { id: 4, task: 'Schedule next week\'s Math classes', priority: 'medium', dueDate: 'Tomorrow' }
    ],
    announcements: [
      { _id: '1', title: 'Holiday Notice', message: 'School closed next Monday for national holiday', createdAt: new Date().toISOString(), priority: 'high' },
      { _id: '2', title: 'Exam Schedule Released', message: 'Mid-term exams start from next week. Check schedule.', createdAt: new Date(Date.now() - 86400000).toISOString(), priority: 'high' },
      { _id: '3', title: 'New Study Material Available', message: 'Updated reference materials uploaded for Physics Chapter 3', createdAt: new Date(Date.now() - 172800000).toISOString(), priority: 'normal' }
    ],
    performanceInsights: [
      { subject: 'Grade 11 Mathematics', avgScore: 88, trend: 'up', change: '+5%' }
    ]
  };
}

export default async function DashboardPage() {
  const { stats, upcoming, recentActivity, pendingTasks, announcements, performanceInsights } = await getData();

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
            <CardTitle className="text-sm font-medium">Your Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs mt-2 text-muted-foreground">{stats.activeToday} active today</p>
          </CardContent>
        </Card>

        <Card className="bg-secondary/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Grading</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingGrading}</div>
            <p className="text-xs mt-2 text-muted-foreground">Assignments to review</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Open Doubts</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.doubtsOpen}</div>
            <p className="text-xs mt-2 text-muted-foreground">Students need help</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50/60 to-transparent">
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
          <CardDescription>Your students' submissions, doubts, and interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <MiniActivityChart data={[
            { day: 'Mon', value: 22 },
            { day: 'Tue', value: 35 },
            { day: 'Wed', value: 28 },
            { day: 'Thu', value: 44 },
            { day: 'Fri', value: 39 },
            { day: 'Sat', value: 18 },
            { day: 'Sun', value: 12 },
          ]} />
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
              {recentActivity.map((activity, idx) => (
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
              {pendingTasks.map((task) => (
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
              {performanceInsights.map((insight, idx) => (
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
