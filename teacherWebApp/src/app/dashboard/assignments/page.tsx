// BACKEND TEMPORARILY DISABLED FOR FRONTEND DEVELOPMENT
// import dbConnect from "@/lib/mongoose";
// import Assignment, { Submission } from "@/models/Assignment";
// import Course from "@/models/Course";
// import Chapter from "@/models/Chapter";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { SubmissionRow } from "./assignment-forms";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, Clock, AlertTriangle, Users, BarChart3, Copy, Search, TrendingUp, FileCheck } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

async function getData() {
  // MOCK DATA FOR FRONTEND DEVELOPMENT
  const now = Date.now();
  return {
    assignments: [
      { 
        _id: 'a1', 
        title: 'Quadratic Equations Problem Set', 
        course: 'Grade 11 Study Package',
        chapter: 'Algebra - Quadratic Equations',
        description: 'Solve equations 1-15 focusing on quadratic formula applications', 
        deadline: new Date(now + 86400000).toISOString(),
        totalMarks: 50,
        status: 'active',
        enrolledStudents: 3,
        submittedCount: 2,
        gradedCount: 1,
        createdAt: new Date(now - 172800000).toISOString()
      },
      { 
        _id: 'a2', 
        title: 'Calculus Differentiation Assignment', 
        course: 'Grade 11 Study Package',
        chapter: 'Calculus - Differentiation',
        description: 'Apply differentiation rules to solve problems 1-20', 
        deadline: new Date(now + 172800000).toISOString(),
        totalMarks: 100,
        status: 'active',
        enrolledStudents: 3,
        submittedCount: 1,
        gradedCount: 0,
        createdAt: new Date(now - 259200000).toISOString()
      },
      { 
        _id: 'a3', 
        title: 'Trigonometry Practice Problems', 
        course: 'Grade 11 Study Package',
        chapter: 'Trigonometry - Advanced',
        description: 'Solve trigonometric identities and equations',
        deadline: new Date(now - 86400000).toISOString(),
        totalMarks: 75,
        status: 'overdue',
        enrolledStudents: 3,
        submittedCount: 3,
        gradedCount: 3,
        avgScore: 85,
        createdAt: new Date(now - 604800000).toISOString()
      },
      { 
        _id: 'a4', 
        title: 'Coordinate Geometry Assignment', 
        course: 'Grade 11 Study Package',
        chapter: 'Coordinate Geometry',
        description: 'Plot and analyze geometric figures on coordinate plane',
        deadline: new Date(now + 432000000).toISOString(),
        totalMarks: 40,
        status: 'active',
        enrolledStudents: 3,
        submittedCount: 0,
        gradedCount: 0,
        createdAt: new Date(now - 86400000).toISOString()
      },
      { 
        _id: 'a5', 
        title: 'Statistics Project', 
        course: 'Grade 11 Study Package',
        chapter: 'Statistics and Probability',
        description: 'Collect data and perform statistical analysis',
        deadline: new Date(now + 604800000).toISOString(),
        totalMarks: 80,
        status: 'active',
        enrolledStudents: 3,
        submittedCount: 0,
        gradedCount: 0,
        createdAt: new Date(now - 86400000).toISOString()
      }
    ],
    submissions: [
      { 
        _id: 'sub1', 
        assignment: 'a1', 
        assignmentTitle: 'Algebra Problem Set 1',
        student: { _id: 'st1', name: 'John Doe' }, 
        submittedAt: new Date(now - 3600000).toISOString(), 
        score: 42, 
        totalMarks: 50,
        feedback: 'Good work! Minor calculation errors in Q15-17.',
        status: 'graded',
        plagiarismScore: 5,
        lateSubmission: false
      },
      { 
        _id: 'sub2', 
        assignment: 'a1', 
        assignmentTitle: 'Algebra Problem Set 1',
        student: { _id: 'st2', name: 'Jane Smith' }, 
        submittedAt: new Date(now - 7200000).toISOString(), 
        score: 0, 
        totalMarks: 50,
        feedback: '',
        status: 'pending',
        plagiarismScore: 0,
        lateSubmission: false
      },
      { 
        _id: 'sub3', 
        assignment: 'a2', 
        assignmentTitle: 'Physics Lab Report',
        student: { _id: 'st3', name: 'Mike Johnson' }, 
        submittedAt: new Date(now - 14400000).toISOString(), 
        score: 88, 
        totalMarks: 100,
        feedback: 'Excellent analysis and presentation.',
        status: 'graded',
        plagiarismScore: 12,
        lateSubmission: false
      },
      { 
        _id: 'sub4', 
        assignment: 'a3', 
        assignmentTitle: 'Chemistry Practical Assignment',
        student: { _id: 'st4', name: 'Sarah Williams' }, 
        submittedAt: new Date(now - 172800000).toISOString(), 
        score: 68, 
        totalMarks: 75,
        feedback: 'Good identification skills. Improve analysis section.',
        status: 'graded',
        plagiarismScore: 8,
        lateSubmission: true
      },
      { 
        _id: 'sub5', 
        assignment: 'a1', 
        assignmentTitle: 'Algebra Problem Set 1',
        student: { _id: 'st5', name: 'Alex Brown' }, 
        submittedAt: new Date(now - 1800000).toISOString(), 
        score: 0, 
        totalMarks: 50,
        feedback: '',
        status: 'pending',
        plagiarismScore: 0,
        lateSubmission: false
      }
    ],
    stats: {
      totalAssignments: 34,
      activeAssignments: 12,
      overdueAssignments: 3,
      avgSubmissionRate: 78,
      pendingGrading: 42
    },
    courses: [
      { _id: '1', title: 'Grade 11 Study Package' }
    ],
    chapters: [
      { _id: 'ch1', course: '1', title: 'Algebra - Quadratic Equations' },
      { _id: 'ch2', course: '1', title: 'Calculus - Differentiation' },
      { _id: 'ch3', course: '1', title: 'Trigonometry - Advanced' },
      { _id: 'ch4', course: '1', title: 'Coordinate Geometry' },
      { _id: 'ch5', course: '1', title: 'Statistics and Probability' }
    ]
  };
}

export default async function AssignmentsPage() {
  const { assignments, courses, chapters, submissions, stats } = await getData();

  const activeAssignments = assignments.filter((a: any) => a.status === 'active');
  const overdueAssignments = assignments.filter((a: any) => a.status === 'overdue');
  const pendingSubmissions = submissions.filter((s: any) => s.status === 'pending');

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'active': 'bg-blue-500',
      'overdue': 'bg-red-500',
      'completed': 'bg-green-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Assignments</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Create and manage student assignments</p>
      </div>      {/* Assignment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-blue-50/60 border-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              {stats.totalAssignments}
            </div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>
        <Card className="bg-secondary/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-500" />
              {stats.activeAssignments}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Currently open</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              {stats.overdueAssignments}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Past deadline</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Grading</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-orange-500" />
              {stats.pendingGrading}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Need review</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50/60 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Submission Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              {stats.avgSubmissionRate}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Average</p>
          </CardContent>
        </Card>
      </div>

      {/* Assignment Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Create New Assignment
            </CardTitle>
            <CardDescription>
              Create assignments with custom instructions, file uploads, deadlines, and grading rubrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <a href="/dashboard/assignments/new">Go to Create Page</a>
              </Button>
              <Button asChild variant="outline">
                <a href="/dashboard/assignments">Learn More</a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Copy className="h-5 w-5" />
              Advanced Plagiarism Checker
            </CardTitle>
            <CardDescription>
              Multi-algorithm plagiarism detection with similarity reports, source identification, and comparison tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <a href="/dashboard/assignments/plagiarism">Open Plagiarism Checker</a>
              </Button>
              <Button asChild variant="outline">
                <a href="/dashboard/plagiarism">View All Reports</a>
              </Button>
            </div>
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <h4 className="text-sm font-semibold mb-2">Detection Features:</h4>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Cross-document comparison</li>
                <li>• Online source detection</li>
                <li>• Similarity percentage calculation</li>
                <li>• Highlighted matching sections</li>
                <li>• Citation analysis</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignments Management Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Assignment Library & Submissions
          </CardTitle>
          <CardDescription>
            Manage all assignments, review submissions, grade work, and track student performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active" className="w-full">
            <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-4 min-w-max">
              <TabsTrigger value="active">Active ({activeAssignments.length})</TabsTrigger>
              <TabsTrigger value="submissions">Pending Grading ({pendingSubmissions.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            </div>

            {/* Active Assignments Tab */}
            <TabsContent value="active" className="space-y-4 mt-4">
              {activeAssignments.map((assignment: any) => (
                <Card key={assignment._id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{assignment.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {assignment.course} • {assignment.chapter}
                        </CardDescription>
                        <p className="text-sm text-muted-foreground mt-2">{assignment.description}</p>
                      </div>
                      <Badge className={getStatusColor(assignment.status)}>
                        {assignment.status.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Deadline</p>
                        <p className="text-base font-bold">
                          {new Date(assignment.deadline).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(assignment.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Submissions</p>
                        <p className="text-base font-bold">
                          {assignment.submittedCount}/{assignment.enrolledStudents}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round((assignment.submittedCount / assignment.enrolledStudents) * 100)}% rate
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Graded</p>
                        <p className="text-base font-bold text-green-600">
                          {assignment.gradedCount}/{assignment.submittedCount}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Marks</p>
                        <p className="text-base font-bold">{assignment.totalMarks}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Students</p>
                        <p className="text-base font-bold flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {assignment.enrolledStudents}
                        </p>
                      </div>
                    </div>
                    <Progress 
                      value={(assignment.submittedCount / assignment.enrolledStudents) * 100} 
                      className="h-2 mb-4" 
                    />
                    <div className="flex gap-2 flex-wrap">
                      <Button variant="outline" size="sm">View Submissions</Button>
                      <Button variant="outline" size="sm">Edit Assignment</Button>
                      <Button variant="outline" size="sm">Download All</Button>
                      <Button variant="outline" size="sm">Send Reminder</Button>
                      <Button variant="outline" size="sm">Check Plagiarism</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Pending Submissions Tab */}
            <TabsContent value="submissions" className="space-y-4 mt-4">
              {pendingSubmissions.map((submission: any) => (
                <Card key={submission._id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-base">{submission.assignmentTitle}</CardTitle>
                        <CardDescription className="mt-1">
                          Submitted by {submission.student.name}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {submission.lateSubmission && (
                          <Badge variant="destructive">Late</Badge>
                        )}
                        <Badge variant="secondary">Pending</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Submitted</p>
                        <p className="text-sm font-medium">
                          {new Date(submission.submittedAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(submission.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Marks</p>
                        <p className="text-xl font-bold">{submission.totalMarks}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Student</p>
                        <p className="text-sm font-medium">{submission.student.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge variant="outline">Awaiting Grade</Badge>
                      </div>
                    </div>
                    <SubmissionRow submission={submission} />
                    <div className="flex gap-2 mt-4 flex-wrap">
                      <Button size="sm">Grade Now</Button>
                      <Button variant="outline" size="sm">View Submission</Button>
                      <Button variant="outline" size="sm">Check Plagiarism</Button>
                      <Button variant="outline" size="sm">Download</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {pendingSubmissions.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <p className="text-lg font-semibold">All Caught Up!</p>
                  <p className="text-sm text-muted-foreground">No pending submissions to grade</p>
                </div>
              )}
            </TabsContent>

            {/* Completed Assignments Tab */}
            <TabsContent value="completed" className="space-y-4 mt-4">
              {overdueAssignments.map((assignment: any) => (
                <Card key={assignment._id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{assignment.title}</CardTitle>
                        <CardDescription>
                          {assignment.course} • Completed on {new Date(assignment.deadline).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge className="bg-green-500">COMPLETED</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Submissions</p>
                        <p className="text-xl font-bold">
                          {assignment.submittedCount}/{assignment.enrolledStudents}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round((assignment.submittedCount / assignment.enrolledStudents) * 100)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Score</p>
                        <p className="text-xl font-bold">
                          {assignment.avgScore}/{assignment.totalMarks}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round((assignment.avgScore / assignment.totalMarks) * 100)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Highest</p>
                        <p className="text-xl font-bold text-green-600">
                          {Math.round(assignment.avgScore * 1.15)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Lowest</p>
                        <p className="text-xl font-bold text-red-600">
                          {Math.round(assignment.avgScore * 0.6)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Late Submissions</p>
                        <p className="text-xl font-bold text-orange-600">
                          {Math.floor(assignment.submittedCount * 0.15)}
                        </p>
                      </div>
                    </div>
                    <Progress 
                      value={(assignment.avgScore / assignment.totalMarks) * 100} 
                      className="h-2 mb-4" 
                    />
                    <div className="flex gap-2 flex-wrap">
                      <Button variant="outline" size="sm">View All Submissions</Button>
                      <Button variant="outline" size="sm">Analytics</Button>
                      <Button variant="outline" size="sm">Export Grades</Button>
                      <Button variant="outline" size="sm">Plagiarism Report</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Submission Rates by Assignment</CardTitle>
                    <CardDescription>Student completion rates across assignments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {assignments.map((assignment: any) => (
                        <div key={assignment._id}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{assignment.title.substring(0, 25)}...</span>
                            <span className="text-muted-foreground">
                              {assignment.submittedCount}/{assignment.enrolledStudents}
                            </span>
                          </div>
                          <Progress 
                            value={(assignment.submittedCount / assignment.enrolledStudents) * 100} 
                            className="h-2" 
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Grading Progress</CardTitle>
                    <CardDescription>Completed vs pending grading</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {assignments.map((assignment: any) => (
                        <div key={assignment._id}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{assignment.title.substring(0, 25)}...</span>
                            <span className="text-muted-foreground">
                              {assignment.gradedCount}/{assignment.submittedCount}
                            </span>
                          </div>
                          <Progress 
                            value={assignment.submittedCount > 0 ? (assignment.gradedCount / assignment.submittedCount) * 100 : 0} 
                            className="h-2" 
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Late Submission Tracking</CardTitle>
                    <CardDescription>Students submitting past deadline</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                        <span className="text-sm">On-Time Submissions</span>
                        <Badge className="bg-green-500">
                          {submissions.filter((s: any) => !s.lateSubmission).length}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                        <span className="text-sm">Late Submissions</span>
                        <Badge className="bg-red-500">
                          {submissions.filter((s: any) => s.lateSubmission).length}
                        </Badge>
                      </div>
                      <div className="mt-4">
                        <Progress 
                          value={(submissions.filter((s: any) => !s.lateSubmission).length / submissions.length) * 100} 
                          className="h-2" 
                        />
                        <p className="text-xs text-muted-foreground mt-1 text-center">
                          {Math.round((submissions.filter((s: any) => !s.lateSubmission).length / submissions.length) * 100)}% on-time rate
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Plagiarism Detection Summary</CardTitle>
                    <CardDescription>Integrity scores across submissions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                        <span className="text-sm">Clean (&lt;10% similarity)</span>
                        <Badge className="bg-green-500">
                          {submissions.filter((s: any) => s.plagiarismScore < 10).length}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                        <span className="text-sm">Moderate (10-30%)</span>
                        <Badge className="bg-yellow-500">
                          {submissions.filter((s: any) => s.plagiarismScore >= 10 && s.plagiarismScore < 30).length}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                        <span className="text-sm">High (&gt;30%)</span>
                        <Badge className="bg-red-500">
                          {submissions.filter((s: any) => s.plagiarismScore >= 30).length}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
