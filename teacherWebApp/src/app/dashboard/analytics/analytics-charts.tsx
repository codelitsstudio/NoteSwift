"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";

export function MiniActivityChart({ data }: { data: { day: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={data} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="activity" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="day" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} />
        <Tooltip />
        <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#activity)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface AttendanceData {
  day: string;
  count: number;
  percentage: number;
}

interface PerformanceData {
  subject: string;
  avgScore: number;
  tests: number;
  students: number;
}

interface CourseProgressData {
  course: string;
  enrolled: number;
  avgProgress: number;
  completionRate: number;
}

interface AssignmentStats {
  totalAssigned: number;
  totalSubmitted: number;
  avgSubmissionRate: number;
  pendingGrading: number;
  avgScore: number;
}

interface TestStats {
  totalTests: number;
  totalAttempts: number;
  avgScore: number;
  passRate: number;
  avgCompletionTime: number;
}

export function AttendanceCharts({ data, avgAttendance }: { data: AttendanceData[], avgAttendance: number }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daily Attendance Trends (Last 7 Days)</CardTitle>
          <CardDescription>Student attendance patterns throughout the week</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" name="Students Present" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Attendance Percentage Trend</CardTitle>
          <CardDescription>Attendance rate over the last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="percentage" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Attendance %" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

export function PerformanceCharts({ data }: { data: PerformanceData[] }) {
  const scoreDistribution = [
    { name: 'Excellent (90-100%)', value: 24, color: '#10b981' },
    { name: 'Good (80-89%)', value: 58, color: '#3b82f6' },
    { name: 'Average (60-79%)', value: 52, color: '#f59e0b' },
    { name: 'Needs Improvement (<60%)', value: 22, color: '#ef4444' }
  ];

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Performance by Subject</CardTitle>
            <CardDescription>Average scores across different subjects</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="subject" type="category" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="avgScore" fill="#3b82f6" name="Average Score %" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Score Distribution</CardTitle>
            <CardDescription>Student performance ranges</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={scoreDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {scoreDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Subject-wise Student Participation</CardTitle>
          <CardDescription>Number of students and tests per subject</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="students" stroke="#3b82f6" strokeWidth={2} name="Students Enrolled" />
              <Line type="monotone" dataKey="tests" stroke="#f59e0b" strokeWidth={2} name="Tests Conducted" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  );
}

export function CourseProgressCharts({ data }: { data: CourseProgressData[] }) {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Course Enrollment & Progress</CardTitle>
            <CardDescription>Student enrollment across courses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="course" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="enrolled" fill="#3b82f6" name="Enrolled Students" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Course Completion Rates</CardTitle>
            <CardDescription>Average progress and completion rates</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="course" angle={-45} textAnchor="end" height={100} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="avgProgress" stroke="#10b981" strokeWidth={2} name="Avg Progress %" />
                <Line type="monotone" dataKey="completionRate" stroke="#f59e0b" strokeWidth={2} name="Completion Rate %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detailed Course Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.map((course) => (
              <div key={course.course} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold">{course.course}</h4>
                    <p className="text-xs text-muted-foreground">{course.enrolled} students enrolled</p>
                  </div>
                  <Badge variant="outline">{course.completionRate}% completion</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Avg Progress</p>
                    <p className="text-lg font-bold">{course.avgProgress}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Completion Rate</p>
                    <p className="text-lg font-bold">{course.completionRate}%</p>
                  </div>
                </div>
                <Progress value={course.avgProgress} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export function AssessmentCharts({ assignmentStats, testStats }: { assignmentStats: AssignmentStats, testStats: TestStats }) {
  const comparisonData = [
    { type: 'Assignments', total: assignmentStats.totalAssigned, avgScore: assignmentStats.avgScore, rate: assignmentStats.avgSubmissionRate },
    { type: 'Tests', total: testStats.totalTests, avgScore: testStats.avgScore, rate: testStats.passRate }
  ];

  const volumeData = [
    { name: 'Assignments', value: assignmentStats.totalAssigned, color: '#3b82f6' },
    { name: 'Tests', value: testStats.totalTests, color: '#ec4899' }
  ];

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Assignment vs Test Comparison</CardTitle>
            <CardDescription>Performance metrics comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="avgScore" fill="#3b82f6" name="Avg Score %" radius={[8, 8, 0, 0]} />
                <Bar dataKey="rate" fill="#10b981" name="Success Rate %" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Assessment Volume</CardTitle>
            <CardDescription>Total assessments and attempts</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={volumeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {volumeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Assignment Statistics</CardTitle>
            <CardDescription>Overview of assignment performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Assigned</span>
                <span className="text-lg font-bold">{assignmentStats.totalAssigned}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Submissions</span>
                <span className="text-lg font-bold">{assignmentStats.totalSubmitted}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Submission Rate</span>
                <span className="text-lg font-bold text-green-600">{assignmentStats.avgSubmissionRate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pending Grading</span>
                <span className="text-lg font-bold text-orange-600">{assignmentStats.pendingGrading}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Average Score</span>
                <span className="text-lg font-bold">{assignmentStats.avgScore}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Test Statistics</CardTitle>
            <CardDescription>Overview of test performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Tests</span>
                <span className="text-lg font-bold">{testStats.totalTests}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Attempts</span>
                <span className="text-lg font-bold">{testStats.totalAttempts}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Average Score</span>
                <span className="text-lg font-bold">{testStats.avgScore}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pass Rate</span>
                <span className="text-lg font-bold text-green-600">{testStats.passRate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg Completion Time</span>
                <span className="text-lg font-bold">{testStats.avgCompletionTime} min</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
