"use client";
import { useParams } from "next/navigation";
import { useTeacher } from "@/context/teacher-context";
import { useEffect, useState, type MouseEvent } from "react";
import teacherAPI from "@/lib/api/teacher-api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Users, TrendingUp, Clock, Target, ArrowLeft, Download, Eye, FileText, CheckCircle, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { generateTestResultsPDF, generateSubmissionPDF } from "@/lib/pdf-utils";

export default function TestResultsPage() {
  const params = useParams();
  const { teacherEmail } = useTeacher();
  const testId = params.testId as string;

  const [test, setTest] = useState<any>(null);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [selectedAttempt, setSelectedAttempt] = useState<any>(null);
  const [attemptDialogOpen, setAttemptDialogOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load test details and attempts
        const [testResponse, attemptsResponse] = await Promise.all([
          teacherAPI.tests.getAll(teacherEmail),
          teacherAPI.tests.getAttempts(testId, teacherEmail)
        ]);

        if (testResponse.success && testResponse.data?.tests) {
          const currentTest = testResponse.data.tests.find((t: any) => t._id === testId);
          if (currentTest) {
            setTest(currentTest);
          } else {
            setError('Test not found');
            return;
          }
        }

        if (attemptsResponse.success && attemptsResponse.data?.attempts) {
          setAttempts(attemptsResponse.data.attempts);
        }

      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load test results');
      } finally {
        setLoading(false);
      }
    };

    if (teacherEmail && testId) {
      loadData();
    }
  }, [teacherEmail, testId]);

  const handleBack = () => {
    window.history.back();
  };

  const handleViewAttempt = (attempt: any) => {
    setSelectedAttempt(attempt);
    setAttemptDialogOpen(true);
  };

  const handleDownloadSubmission = async (submission: any) => {
    try {
      const submissionData = {
        testTitle: test?.title || 'Test',
        testType: test?.testType || test?.type || 'mcq',
        studentName: submission.studentName,
        studentEmail: submission.studentEmail,
        totalScore: submission.totalScore,
        totalMarks: submission.totalMarks,
        submittedAt: submission.submittedAt,
        timeSpent: submission.timeSpent,
        answers: submission.answers,
        module: submission.module || test?.moduleName,
        subject: submission.subject || test?.subjectName
      };

      await generateSubmissionPDF(submissionData);
    } catch (error) {
      console.error('Error generating submission PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // Calculate statistics
  const totalAttempts = attempts.length;
  const evaluatedAttempts = attempts.filter(a => a.status === 'evaluated');
  const submittedAttempts = attempts.filter(a => a.status === 'submitted');
  const averageScore = evaluatedAttempts.length > 0
    ? evaluatedAttempts.reduce((sum, a) => sum + (a.totalScore || 0), 0) / evaluatedAttempts.length
    : 0;
  const passRate = evaluatedAttempts.length > 0
    ? (evaluatedAttempts.filter(a => (a.totalScore || 0) >= (test?.passingMarks || 0)).length / evaluatedAttempts.length) * 100
    : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tests
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Test Results</h1>
            <p className="text-muted-foreground mt-2">Loading results...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tests
          </Button>
        </div>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 font-medium">{error || 'Test not found'}</p>
        </div>
      </div>
    );
  }

  function handleDownloadResults(event: MouseEvent<HTMLButtonElement>): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tests
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Test Results</h1>
            <p className="text-muted-foreground mt-2">
              {test.title} - {test.subjectName || test.subject}
            </p>
          </div>
        </div>
        <Button onClick={handleDownloadResults}>
          <Download className="h-4 w-4 mr-2" />
          Download Report
        </Button>
      </div>

      {/* Test Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Test Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalAttempts}</div>
              <div className="text-sm text-muted-foreground">Total Attempts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{evaluatedAttempts.length}</div>
              <div className="text-sm text-muted-foreground">Evaluated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{submittedAttempts.length}</div>
              <div className="text-sm text-muted-foreground">Pending Review</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{Math.round(averageScore)}%</div>
              <div className="text-sm text-muted-foreground">Average Score</div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="text-lg font-semibold">{Math.round(passRate)}%</div>
                    <div className="text-sm text-muted-foreground">Pass Rate</div>
                  </div>
                </div>
                <Progress value={passRate} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="text-lg font-semibold">{test.duration || 60} min</div>
                    <div className="text-sm text-muted-foreground">Test Duration</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  <div>
                    <div className="text-lg font-semibold">{test.totalQuestions || 0}</div>
                    <div className="text-sm text-muted-foreground">Questions</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Student Attempts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Student Attempts
          </CardTitle>
          <CardDescription>
            Review individual student submissions and performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {attempts.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No attempts yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Student attempts will appear here once they submit the test.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {attempts.map((attempt: any) => (
                <Card key={attempt._id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium">
                            {attempt.studentName || attempt.studentEmail || 'Unknown Student'}
                          </h3>
                          <Badge variant={attempt.status === 'evaluated' ? 'default' : 'secondary'}>
                            {attempt.status === 'evaluated' ? 'Graded' : 'Submitted'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Score:</span>
                            <span className="font-medium ml-1">
                              {attempt.totalScore || 0}/{attempt.totalMarks || test.totalMarks || 0}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Percentage:</span>
                            <span className="font-medium ml-1">
                              {attempt.totalMarks ? Math.round((attempt.totalScore / attempt.totalMarks) * 100) : 0}%
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Time:</span>
                            <span className="font-medium ml-1">
                              {attempt.timeSpent ? Math.floor(attempt.timeSpent / 60) : 0} min
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Submitted:</span>
                            <span className="font-medium ml-1">
                              {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewAttempt(attempt)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attempt Details Dialog */}
      <Dialog open={attemptDialogOpen} onOpenChange={setAttemptDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Attempt Details</DialogTitle>
          </DialogHeader>
          {selectedAttempt && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Student</label>
                  <p className="text-lg font-semibold">
                    {selectedAttempt.studentName || selectedAttempt.studentEmail || 'Unknown'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <Badge variant={selectedAttempt.status === 'evaluated' ? 'default' : 'secondary'}>
                    {selectedAttempt.status === 'evaluated' ? 'Graded' : 'Submitted'}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Score</label>
                  <p className="text-lg font-semibold">
                    {selectedAttempt.totalScore || 0}/{selectedAttempt.totalMarks || test.totalMarks || 0}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Percentage</label>
                  <p className="text-lg font-semibold">
                    {selectedAttempt.totalMarks ? Math.round((selectedAttempt.totalScore / selectedAttempt.totalMarks) * 100) : 0}%
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Time Taken</label>
                  <p className="text-lg font-semibold">
                    {selectedAttempt.timeSpent ? Math.floor(selectedAttempt.timeSpent / 60) : 0} minutes
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Submitted At</label>
                  <p className="text-lg font-semibold">
                    {selectedAttempt.submittedAt ? new Date(selectedAttempt.submittedAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>

              {selectedAttempt.answers && selectedAttempt.answers.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Answers Review</h3>
                  <div className="space-y-4">
                    {selectedAttempt.answers.map((answer: any, index: number) => (
                      <Card key={index} className={`border-l-4 ${
                        answer.isCorrect ? 'border-l-green-500' : 'border-l-red-500'
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline">Question {index + 1}</Badge>
                                <div className={`flex items-center gap-1 ${
                                  answer.isCorrect ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {answer.isCorrect ? (
                                    <CheckCircle className="h-4 w-4" />
                                  ) : (
                                    <XCircle className="h-4 w-4" />
                                  )}
                                  {answer.isCorrect ? 'Correct' : 'Incorrect'}
                                </div>
                              </div>
                              <p className="font-medium mb-2">{answer.questionText || 'Question text not available'}</p>
                              <div className="space-y-1">
                                <p className="text-sm">
                                  <span className="font-medium">Selected Answer:</span> {answer.selectedAnswer || 'Not answered'}
                                </p>
                                {answer.correctAnswer && (
                                  <p className="text-sm text-green-600">
                                    <span className="font-medium">Correct Answer:</span> {answer.correctAnswer}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{answer.marks || 0} marks</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setAttemptDialogOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => handleDownloadSubmission(selectedAttempt)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}