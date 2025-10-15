import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { ImportExportQuestions } from "./import-export";
import { CreateTestForm } from "./create-test-form";
import { AddQuestionForm } from "./add-question-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, Clock, Users, BarChart3, TrendingUp, AlertCircle, Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import teacherAPI from "@/lib/api/teacher-api";

async function getData() {
  const teacherEmail = "teacher@example.com";
  
  try {
    const response = await teacherAPI.tests.getAll(teacherEmail);
    const tests = response.data?.tests || [];
    const stats = response.data?.stats || {};

    const transformedTests = tests.map((t: any) => ({
      _id: t._id,
      title: t.title,
      course: t.courseName,
      chapter: `${t.subjectName} - ${t.moduleName || ''}`,
      description: t.description,
      scheduledAt: t.scheduledAt || t.createdAt,
      duration: t.duration,
      totalMarks: t.totalMarks,
      totalQuestions: t.questions?.length || 0,
      status: t.status,
      enrolledStudents: t.totalStudents || 0,
      submittedCount: t.totalAttempts || 0,
      avgScore: t.avgScore || 0,
      type: t.testType,
      difficulty: 'medium'
    }));

    const questionBank = tests.flatMap((t: any) => 
      (t.questions || []).map((q: any, idx: number) => ({
        _id: q._id || `q${idx}`,
        subject: t.subjectName,
        topic: t.topicName || 'General',
        difficulty: q.difficulty || 'medium',
        type: q.questionType,
        usageCount: 1
      }))
    );

    return {
      tests: transformedTests,
      questionBank,
      stats: {
        totalTests: stats.total || 0,
        activeTests: stats.active || 0,
        completedTests: stats.completed || 0,
        totalQuestions: questionBank.length,
        avgCompletionRate: stats.avgPassRate || 0
      },
      courses: [],
      chapters: []
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      tests: [],
      questionBank: [],
      stats: { totalTests: 0, activeTests: 0, completedTests: 0, totalQuestions: 0, avgCompletionRate: 0 },
      courses: [],
      chapters: []
    };
  }
}

export default async function TestsPage() {
  const { tests, questionBank, stats, courses, chapters } = await getData();

  const scheduledTests = tests.filter((t: any) => t.status === 'scheduled');
  const completedTests = tests.filter((t: any) => t.status === 'completed');

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      'easy': 'bg-green-500',
      'medium': 'bg-yellow-500',
      'hard': 'bg-red-500'
    };
    return colors[difficulty] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Tests & Assessments</h1>
        <p className="text-muted-foreground mt-2">
          Create, manage, and analyze tests. Build comprehensive question banks, track student performance, and generate automated grading reports.
        </p>
      </div>

      {/* Tests Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-l-4 border-blue-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-600" />
              {stats.totalTests}
            </div>
            <p className="text-xs mt-1 text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50/60 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              <Clock className="h-6 w-6  text-blue-600" />
              {stats.activeTests}
            </div>
            <p className="text-xs mt-1 text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50/60 border-blue-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              <CheckCircle className="h-6 w-6  text-blue-600" />
              {stats.completedTests}
            </div>
            <p className="text-xs mt-1 text-muted-foreground">Graded & analyzed</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-blue-500 hover:border-blue-600 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Question Bank</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6  text-blue-600" />
              {stats.totalQuestions}
            </div>
            <p className="text-xs mt-1 text-muted-foreground">Reusable questions</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50/60 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              <TrendingUp className="h-6 w-6  text-blue-600" />
              {stats.avgCompletionRate}%
            </div>
            <p className="text-xs mt-1 text-muted-foreground">Average</p>
          </CardContent>
        </Card>
      </div>

      {/* All Tests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            All Tests
          </CardTitle>
          <CardDescription>
            View and manage your scheduled and completed tests for Grade 11 Mathematics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Scheduled Tests</h3>
                {scheduledTests.length > 0 ? (
                  scheduledTests.map((test: any) => (
                    <Card key={test._id}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CardTitle className="text-base">{test.title}</CardTitle>
                              <Badge className={getDifficultyColor(test.difficulty)}>{test.difficulty}</Badge>
                              <Badge variant="outline">{test.type}</Badge>
                            </div>
                            <CardDescription className="text-sm">
                              {test.course} - {test.chapter}
                            </CardDescription>
                            <p className="text-sm text-muted-foreground mt-1">{test.description}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div>
                          <div className="text-xs text-muted-foreground">Schedule</div>
                          <div className="text-sm font-medium">{new Date(test.scheduledAt).toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Duration</div>
                          <div className="text-sm font-medium">{test.duration} min</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Questions</div>
                          <div className="text-sm font-medium">{test.totalQuestions}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Total Marks</div>
                          <div className="text-sm font-medium">{test.totalMarks}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Students</div>
                          <div className="text-sm font-medium">{test.enrolledStudents}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No scheduled tests</p>
                )}

                <h3 className="text-lg font-semibold mt-6">Completed Tests</h3>
                {completedTests.length > 0 ? (
                  completedTests.map((test: any) => (
                    <Card key={test._id}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CardTitle className="text-base">{test.title}</CardTitle>
                              <Badge className={getDifficultyColor(test.difficulty)}>{test.difficulty}</Badge>
                              <Badge variant="secondary">Completed</Badge>
                            </div>
                            <CardDescription className="text-sm">
                              {test.course} - {test.chapter}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-xs text-muted-foreground">Completed On</div>
                          <div className="text-sm font-medium">{new Date(test.scheduledAt).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Submissions</div>
                          <div className="text-sm font-medium">{test.submittedCount}/{test.enrolledStudents}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Avg Score</div>
                          <div className="text-sm font-medium">{test.avgScore?.toFixed(1)}</div>
                        </div>
                        <div>
                          <Button size="sm" variant="outline">View Results</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No completed tests yet</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

          {/* Question Bank Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Question Bank
              </CardTitle>
              <CardDescription>
                Manage your reusable questions for Grade 11 Mathematics tests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium">Easy Questions</span>
                  <Badge className="bg-green-500">
                    {questionBank.filter((q: any) => q.difficulty === 'easy').length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="text-sm font-medium">Medium Questions</span>
                  <Badge className="bg-yellow-500">
                    {questionBank.filter((q: any) => q.difficulty === 'medium').length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="text-sm font-medium">Hard Questions</span>
                  <Badge className="bg-red-500">
                    {questionBank.filter((q: any) => q.difficulty === 'hard').length}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
    </div>
  );
}
