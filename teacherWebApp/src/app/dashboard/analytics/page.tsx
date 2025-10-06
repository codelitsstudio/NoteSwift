// BACKEND TEMPORARILY DISABLED FOR FRONTEND DEVELOPMENT
// import dbConnect from "@/lib/mongoose";
// import Attendance from "@/models/Attendance";
// import Assignment from "@/models/Assignment";
// import Test from "@/models/Test";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Users, FileText, Calendar, Download, Eye, CheckCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttendanceExport } from "./export-client";
import { AttendanceCharts, PerformanceCharts, CourseProgressCharts, AssessmentCharts } from "./analytics-charts";

async function getData() {
  // MOCK DATA FOR FRONTEND DEVELOPMENT
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  return {
    overview: {
      totalStudents: 3,
      totalCourses: 1,
      totalAssignments: 5,
      totalTests: 3,
      attendanceCount: 18,
      avgAttendance: 95
    },
    attendanceByDay: last7Days.map((d, idx) => ({
      day: d.toLocaleDateString(undefined, { weekday: 'short' }),
      count: 2 + Math.floor(Math.random() * 2),
      percentage: 85 + Math.floor(Math.random() * 15)
    })),
    performanceBySubject: [
      { subject: 'Grade 11 Mathematics', avgScore: 88, tests: 3, students: 3 }
    ],
    courseProgress: [
      { course: 'Grade 11 Study Package (Mathematics)', enrolled: 3, avgProgress: 85, completionRate: 78 }
    ],
    assignmentStats: {
      totalAssigned: 5,
      totalSubmitted: 13,
      avgSubmissionRate: 87,
      pendingGrading: 2,
      avgScore: 88
    },
    testStats: {
      totalTests: 3,
      totalAttempts: 9,
      avgScore: 88,
      passRate: 100,
      avgCompletionTime: 42
    },
    studentEngagement: [
      { metric: 'Daily Active Users', value: 2, trend: '+10%' },
      { metric: 'Avg Study Time', value: '3h 15m', trend: '+12%' },
      { metric: 'Content Views', value: 48, trend: '+15%' },
      { metric: 'Doubt Resolution Rate', value: '100%', trend: '+8%' }
    ],
    topPerformers: [
      { name: 'Emily Davis', course: 'Grade 11 Study Package (Math)', score: 96, rank: 1 },
      { name: 'Jane Smith', course: 'Grade 11 Study Package (Math)', score: 92, rank: 2 },
      { name: 'Mike Johnson', course: 'Grade 11 Study Package (Math)', score: 75, rank: 3 }
    ],
    recentActivity: [
      { type: 'Test', description: 'Calculus Quiz completed by 3 students', time: '2 hours ago' },
      { type: 'Assignment', description: 'Algebra Assignment submitted by 2 students', time: '4 hours ago' },
      { type: 'Content', description: 'New video uploaded: Advanced Trigonometry', time: '5 hours ago' },
      { type: 'Announcement', description: 'Grade 11 Math mid-term scheduled', time: '1 day ago' }
    ]
  };
}

export default async function AnalyticsPage() {
  const { 
    overview, 
    attendanceByDay, 
    performanceBySubject, 
    courseProgress, 
    assignmentStats, 
    testStats, 
    studentEngagement,
    topPerformers,
    recentActivity 
  } = await getData();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Analytics & Reports</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive insights into student performance, engagement metrics, course analytics, and institutional trends
          </p>
        </div>
        <div className="flex gap-2">
          <AttendanceExport rows={attendanceByDay.map(d => ({ day: d.day, count: d.count }))} />
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export All Reports
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-50">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-5 w-5" />
              {overview.totalStudents}
            </div>
            <p className="text-xs text-blue-100 mt-1">Enrolled</p>
          </CardContent>
          <div className="absolute -right-4 -bottom-4 opacity-10">
          </div>
        </Card>
        <Card className="border-l-4 border-blue-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold  flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              {overview.totalCourses}
            </div>
            <p className="text-xs mt-1 text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50/60 border-blue-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold  flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              {overview.totalAssignments}
            </div>
            <p className="text-xs mt-1 text-muted-foreground">Created</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-blue-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-5 w-5  text-blue-600" />
              {overview.totalTests}
            </div>
            <p className="text-xs mt-1 text-muted-foreground">Conducted</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50/60 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              {overview.avgAttendance}%
            </div>
            <p className="text-xs mt-1 text-muted-foreground">Average</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-blue-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              {overview.attendanceCount}
            </div>
            <p className="text-xs mt-1 text-muted-foreground">Total entries</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Student Engagement Metrics
            </CardTitle>
            <CardDescription>Key performance indicators for student activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {studentEngagement.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">{item.metric}</p>
                    <p className="text-xl font-bold">{item.value}</p>
                  </div>
                  <Badge className="bg-blue-500">{item.trend}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top Performers
            </CardTitle>
            <CardDescription>Students with highest average scores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPerformers.map((student) => (
                <div key={student.rank} className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-gray-700 font-bold text-sm">
                    {student.rank}
                  </div>
                  <div className="flex-1 py-3">
                    <p className="font-semibold text-sm">{student.name}</p>
                    <p className="text-xs text-muted-foreground">{student.course}</p>
                  </div>
                  <Badge className="bg-blue-500">{student.score}%</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Detailed Analytics & Reports
          </CardTitle>
          <CardDescription>
            In-depth analysis of attendance, performance, course progress, and institutional metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="attendance" className="w-full">
            <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-5 min-w-max">
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="assessments">Assessments</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            </div>

            {/* Attendance Analytics */}
            <TabsContent value="attendance" className="space-y-4 mt-4">
              <AttendanceCharts data={attendanceByDay} avgAttendance={overview.avgAttendance} />

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Attendance Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Average Weekly Attendance</p>
                      <p className="text-2xl font-bold text-blue-600">{overview.avgAttendance}%</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Best Attendance Day</p>
                      <p className="text-2xl font-bold text-blue-600">{attendanceByDay.reduce((max, day) => day.percentage > max.percentage ? day : max).day}</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Total Student-Days</p>
                      <p className="text-2xl font-bold text-blue-600">{attendanceByDay.reduce((sum, day) => sum + day.count, 0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Performance Analytics */}
            <TabsContent value="performance" className="space-y-4 mt-4">
              <PerformanceCharts data={performanceBySubject} />
            </TabsContent>

            {/* Course Progress */}
            <TabsContent value="courses" className="space-y-4 mt-4">
              <CourseProgressCharts data={courseProgress} />
            </TabsContent>

            {/* Assessments */}
            <TabsContent value="assessments" className="space-y-4 mt-4">
              <AssessmentCharts assignmentStats={assignmentStats} testStats={testStats} />
            </TabsContent>

            {/* Recent Activity */}
            <TabsContent value="activity" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recent Platform Activity</CardTitle>
                  <CardDescription>Latest actions and updates across the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivity.map((activity, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                          <Eye className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <Badge variant="secondary" className="mb-1">{activity.type}</Badge>
                          <p className="text-sm font-medium">{activity.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Reports</CardTitle>
          <CardDescription>Download comprehensive reports in various formats</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Attendance Report (PDF)
            </Button>
            <Button variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Performance Report (Excel)
            </Button>
            <Button variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Complete Analytics (CSV)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
