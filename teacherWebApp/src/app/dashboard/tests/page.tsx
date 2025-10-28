"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { ImportExportQuestions } from "./import-export";
import { CreateTestForm } from "./create-test-form";
import { AddQuestionForm } from "./add-question-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, Clock, Users, BarChart3, TrendingUp, AlertCircle, Star, Plus, Edit, Trash2, Download, Eye } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import teacherAPI from "@/lib/api/teacher-api";
import CourseCard from "./components/CourseCard";
import TestCard from "./components/TestCard";
import { useEffect, useState } from "react";
import { useTeacher } from "@/context/teacher-context";
import { useRouter } from "next/navigation";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { generateSubmissionPDF } from "@/lib/pdf-utils";

export default function TestsPage() {
  const { teacherEmail, isLoading: contextLoading } = useTeacher();
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [testToDelete, setTestToDelete] = useState<any>(null);
  const [submissionDialogOpen, setSubmissionDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [data, setData] = useState<{
    tests: any[];
    questionBank: any[];
    stats: { totalTests: number; draftTests: number; publishedTests: number; activeTests: number; completedTests: number; totalQuestions: number; avgCompletionRate: number };
    modules: any[];
    subject: any;
    submissions: any[];
  }>({
    tests: [],
    questionBank: [],
    stats: { totalTests: 0, draftTests: 0, publishedTests: 0, activeTests: 0, completedTests: 0, totalQuestions: 0, avgCompletionRate: 0 },
    modules: [],
    subject: null,
    submissions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [testsResponse, modulesResponse, analyticsResponse] = await Promise.all([
        teacherAPI.tests.getAll(teacherEmail),
        teacherAPI.courses.getSubjectContent(teacherEmail),
        teacherAPI.analytics.getAnalytics(teacherEmail)
      ]);

      const tests = testsResponse.success && testsResponse.data?.tests && Array.isArray(testsResponse.data.tests) ? testsResponse.data.tests : [];
      const subjectContent = modulesResponse.success && modulesResponse.data ? modulesResponse.data : {};
      const analytics = analyticsResponse.success && analyticsResponse.data ? analyticsResponse.data : {};
      const testStats = testsResponse.success && testsResponse.data?.stats ? testsResponse.data.stats : {};

      // Fetch attempts for all tests (to catch any status)
      const allTests = tests;
      let allSubmissions: any[] = [];
      
      if (allTests.length > 0) {
        const attemptsPromises = allTests.map((test: any) => 
          teacherAPI.tests.getAttempts(test._id, teacherEmail)
        );
        const attemptsResponses = await Promise.all(attemptsPromises);
        
        console.log('Attempts responses:', attemptsResponses.map((r, i) => ({
          testId: allTests[i]._id,
          testTitle: allTests[i].title,
          success: r.success,
          attemptsCount: r.data?.attempts?.length || 0,
          error: r.error
        })));
        
        allSubmissions = attemptsResponses
          .map((response, index) => {
            if (response.success && response.data && response.data.attempts && Array.isArray(response.data.attempts)) {
              const test = allTests[index];
              const filteredAttempts = response.data.attempts
                .filter((attempt: any) => attempt.status === 'submitted' || attempt.status === 'evaluated');
              console.log(`Test ${test.title} (${test.status}): Found ${filteredAttempts.length} submissions`);
              return filteredAttempts.map((attempt: any) => ({
                ...attempt,
                testTitle: test.title,
                testId: test._id,
                testType: test.testType || test.type || 'mcq',
                totalMarks: test.totalMarks,
                module: test.moduleName || test.topicName,
                subject: test.subjectName
              }));
            }
            return [];
          })
          .flat();
      
      console.log('Total submissions found:', allSubmissions.length);
      }

      const transformedTests = Array.isArray(tests) ? tests.map((t: any) => ({
        _id: t._id,
        title: t.title,
        module: t.moduleName || t.topicName,
        subject: t.subjectName || subjectContent.subjectName,
        description: t.description,
        scheduledAt: t.scheduledAt || t.createdAt,
        duration: t.duration,
        totalMarks: t.totalMarks,
        totalQuestions: t.questions?.length || t.totalQuestions || 0,
        status: t.status || 'draft',
        enrolledStudents: t.totalStudents || t.enrolledStudents || 0,
        submittedCount: t.totalAttempts || t.submittedCount || 0,
        avgScore: t.avgScore || 0,
        type: t.testType || t.type || 'mcq',
        difficulty: t.difficulty || 'medium',
        questions: t.questions || [] // Include the actual questions array
      })) : [];

      const questionBank = Array.isArray(tests) ? tests.flatMap((t: any) =>
        (t.questions || []).map((q: any, idx: number) => ({
          _id: q._id || `q${idx}`,
          subject: t.subjectName || subjectContent.subjectName,
          module: t.moduleName || t.topicName || 'General',
          difficulty: q.difficulty || 'medium',
          type: q.questionType || q.type || 'mcq',
          usageCount: q.usageCount || 1
        }))
      ) : [];

      const transformedModules = (subjectContent.modules || []).map((module: any) => ({
        _id: module._id || module.id,
        title: module.title || module.name,
        moduleNumber: module.moduleNumber,
        subject: subjectContent.subjectName,
        grade: subjectContent.grade || 'General',
        testsCount: module.testsCount || tests.filter((t: any) => t.moduleId === module._id).length,
        completedTests: module.completedTests || 0,
      }));

      // Calculate completed tests (tests with submitted/evaluated attempts)
      const completedTestsCount = tests.filter((test: any) => {
        // Check if this test has any submissions in our fetched data
        return allSubmissions.some((submission: any) => submission.testId === test._id);
      }).length;

      setData({
        tests: transformedTests,
        questionBank,
        stats: {
          totalTests: testStats.total || analytics.totalTests || tests.length,
          draftTests: tests.filter((t: any) => t.status === 'draft').length,
            publishedTests: tests.filter((t: any) => t.status === 'active').length,
          activeTests: testStats.active || analytics.activeTests || tests.filter((t: any) => t.status === 'published').length,
          completedTests: completedTestsCount,
          totalQuestions: analytics.totalQuestions || questionBank.length,
          avgCompletionRate: testStats.avgScore || analytics.avgPassRate || analytics.avgCompletionRate || 0
        },
        modules: transformedModules,
        subject: subjectContent,
        submissions: allSubmissions
      });
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!teacherEmail || contextLoading) return;

    fetchData();
  }, [teacherEmail, contextLoading]);

  const { tests, questionBank, stats, modules, subject, submissions } = data;
  const completedTests = tests.filter((t: any) => t.status === 'completed');
  const draftTests = tests.filter((t: any) => t.status === 'draft');
  const publishedTests = tests.filter((t: any) => t.status === 'active');

  // Group tests by module
  const testsByModule = tests.reduce((acc: any, test: any) => {
    const moduleName = test.module || 'General';
    if (!acc[moduleName]) {
      acc[moduleName] = [];
    }
    acc[moduleName].push(test);
    return acc;
  }, {});

  const refreshData = () => {
    if (teacherEmail) {
      fetchData();
    }
  };

  // Handler functions for test actions
  const handleEditTest = (test: any) => {
    router.push(`/dashboard/tests/edit/${test._id}`);
  };

  const handleViewResults = (test: any) => {
    router.push(`/dashboard/tests/results/${test._id}`);
  };

  const handleDeleteTest = (test: any) => {
    setTestToDelete(test);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteTest = async () => {
    if (!testToDelete || !teacherEmail) return;

    try {
      const result = await teacherAPI.tests.delete(testToDelete._id, teacherEmail);
      if (result.success) {
        setDeleteDialogOpen(false);
        setTestToDelete(null);
        refreshData(); // Refresh the data to update the UI
      } else {
        console.error('Failed to delete test:', result.error);
      }
    } catch (error) {
      console.error('Error deleting test:', error);
    }
  };

  // Handler functions for submission actions
  const handleViewSubmissionDetails = (submission: any) => {
    setSelectedSubmission(submission);
    setSubmissionDialogOpen(true);
  };

  const handleDownloadSubmission = async (submission: any) => {
    try {
      const submissionData = {
        testTitle: submission.testTitle,
        testType: submission.testType,
        studentName: submission.studentName,
        studentEmail: submission.studentEmail,
        totalScore: submission.totalScore,
        totalMarks: submission.totalMarks,
        submittedAt: submission.submittedAt,
        timeSpent: submission.timeSpent,
        answers: submission.answers,
        module: submission.module,
        subject: submission.subject
      };

      await generateSubmissionPDF(submissionData);
    } catch (error) {
      console.error('Error generating submission PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  if (contextLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Tests & Assessments</h1>
          <p className="text-muted-foreground mt-2">
            Loading teacher data...
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-blue-50/60 border-blue-100">
              <CardContent className="p-4">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!teacherEmail) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Tests & Assessments</h1>
          <p className="text-muted-foreground mt-2">
            Please log in to access your tests dashboard.
          </p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p>Authentication required</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Tests & Assessments</h1>
          <p className="text-muted-foreground mt-2">
            Loading dashboard data...
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-blue-50/60 border-blue-100">
              <CardContent className="p-4">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Tests & Assessments</h1>
          <p className="text-muted-foreground mt-2">
            Create, manage, and analyze tests. Build comprehensive question banks, track student performance, and generate automated grading reports.
          </p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p>{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }



  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Tests & Assessments</h1>
          <p className="text-muted-foreground mt-2">
            Create, manage, and analyze tests. Build comprehensive question banks, track student performance, and generate automated grading reports.
          </p>
        </div>

        {/* Tests Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-blue-50/60 border-blue-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Draft Tests</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.draftTests}</div>
              <p className="text-xs mt-2 text-muted-foreground">Need questions added</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50/60 border-green-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Tests</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.publishedTests}</div>
              <p className="text-xs mt-2 text-muted-foreground">Available to students</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-50/60 border-blue-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedTests}</div>
              <p className="text-xs mt-2 text-muted-foreground">Graded & analyzed</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-50/60 border-blue-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTests}</div>
              <p className="text-xs mt-2 text-muted-foreground">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Modules Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  My Modules
                </CardTitle>
                <CardDescription>
                  Tests organized by modules in {subject?.subjectName || 'your subject'}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={refreshData}>
                <Plus className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.keys(testsByModule).length > 0 ? (
                Object.entries(testsByModule).map(([moduleName, moduleTests]) => {
                  const tests = moduleTests as any[];
                  const activeTests = tests.filter(t => t.status === 'active').length;
                  const draftTests = tests.filter(t => t.status === 'draft').length;
                  const completedTests = tests.filter(t => t.status === 'completed').length;

                  return (
                    <CourseCard
                      key={moduleName}
                      course={{
                        _id: moduleName,
                        title: moduleName,
                        subject: subject?.subjectName || 'General',
                        grade: subject?.subjectName || 'General',
                        testsCount: tests.length,
                        completedTests: activeTests,
                        tests: tests // Pass the actual tests array for the dialog
                      }}
                      onViewTests={() => {/* Handle view tests for module */}}
                      onCreateTest={() => {/* Handle create test for module */}}
                    />
                  );
                })
              ) : (
                <div className="col-span-full text-center py-12">
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No tests created yet</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Create your first test to get started with assessments
                  </p>
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Test
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Your Tests */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Your Tests
                </CardTitle>
                <CardDescription>
                  Manage and monitor tests for your modules
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={refreshData}>
                <Plus className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">

                           {/* Published Tests */}
              {publishedTests.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Published Tests ({publishedTests.length})
                    <span className="text-xs text-gray-500">Available to students</span>
                  </h3>
                  <div className="space-y-3">
                    {publishedTests.slice(0, 4).map((test: any) => (
                      <div key={test._id} className="flex items-center justify-between p-4 border border-green-200 rounded-lg bg-green-50/50 hover:bg-green-50 transition-colors">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm truncate">{test.title}</h3>
                            <p className="text-xs text-muted-foreground">{test.module} - {test.subject}</p>
                          </div>
                          <div className="hidden md:flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{test.type.toUpperCase()}</span>
                            <span>{test.totalQuestions} Qs</span>
                            <span>{test.enrolledStudents} Students</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                            Active
                          </Badge>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleEditTest(test)} title="Edit Test">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleViewResults(test)} title="View Results">
                              <BarChart3 className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600 hover:text-red-700" onClick={() => handleDeleteTest(test)} title="Delete Test">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              
              {/* Draft Tests */}
              {draftTests.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Draft Tests ({draftTests.length})
                    <span className="text-xs text-gray-500">Need questions added</span>
                  </h3>
                  <div className="space-y-3">
                    {draftTests.slice(0, 4).map((test: any) => (
                      <div key={test._id} className="flex items-center justify-between p-4 border border-orange-200 rounded-lg bg-orange-50/50 hover:bg-orange-50 transition-colors">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-orange-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm truncate">{test.title}</h3>
                            <p className="text-xs text-muted-foreground">{test.module} - {test.subject}</p>
                          </div>
                          <div className="hidden md:flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{test.type.toUpperCase()}</span>
                            <span>{test.totalQuestions} Qs</span>
                            <span>{test.enrolledStudents} Students</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                            Draft
                          </Badge>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleEditTest(test)} title="Edit Test">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleViewResults(test)} title="View Results">
                              <BarChart3 className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600 hover:text-red-700" onClick={() => handleDeleteTest(test)} title="Delete Test">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

   

              {/* Empty State */}
              {tests.length === 0 && (
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No tests created yet</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Create your first test to get started with assessments
                  </p>
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Test
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submissions & Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Submissions & Results
            </CardTitle>
            <CardDescription>
              Review student submissions and manage test results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {submissions.length > 0 ? (
                submissions.slice(0, 10).map((submission: any) => (
                  <Card key={submission._id || `${submission.testId}-${submission.studentId}`}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-base">{submission.testTitle}</CardTitle>
                          <CardDescription className="text-sm">
                            {submission.module} - {submission.subject} - Submitted by {submission.studentName || submission.studentEmail || 'Unknown Student'}
                          </CardDescription>
                        </div>
                        <Badge className={submission.status === 'evaluated' ? 'bg-green-500' : 'bg-blue-500'}>
                          {submission.status === 'evaluated' ? 'Graded' : 'Submitted'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <div className="text-xs text-muted-foreground">Score</div>
                          <div className="text-lg font-semibold">{submission.totalScore || 0}/{submission.totalMarks || 0}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Percentage</div>
                          <div className="text-lg font-semibold">
                            {submission.totalMarks ? Math.round((submission.totalScore / submission.totalMarks) * 100) : 0}%
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Time Taken</div>
                          <div className="text-lg font-semibold">
                            {submission.timeSpent ? Math.floor(submission.timeSpent / 60) : 0} min
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Submitted</div>
                          <div className="text-lg font-semibold">
                            {submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center gap-4">
                        <Button size="sm" variant="outline" onClick={() => handleViewSubmissionDetails(submission)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDownloadSubmission(submission)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No test submissions yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Student submissions will appear here once they submit their tests.
                  </p>
                </div>
              )}
              {submissions.length > 10 && (
                <div className="text-center">
                  <Button variant="outline">View All Submissions ({submissions.length})</Button>
                </div>
              )}
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
                  Manage your reusable questions for {subject?.subjectName || 'your subject'} tests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium">Easy Questions</span>
                    <Badge className="bg-blue-500">
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Test</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{testToDelete?.title}"? This action cannot be undone.
              All associated submissions and results will also be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTest} className="bg-red-600 hover:bg-red-700">
              Delete Test
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Submission Details Dialog */}
      <Dialog open={submissionDialogOpen} onOpenChange={setSubmissionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Test</label>
                  <p className="text-lg font-semibold">{selectedSubmission.testTitle}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Student</label>
                  <p className="text-lg font-semibold">{selectedSubmission.studentName || selectedSubmission.studentEmail || 'Unknown'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Score</label>
                  <p className="text-lg font-semibold">{selectedSubmission.totalScore || 0}/{selectedSubmission.totalMarks || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Percentage</label>
                  <p className="text-lg font-semibold">
                    {selectedSubmission.totalMarks ? Math.round((selectedSubmission.totalScore / selectedSubmission.totalMarks) * 100) : 0}%
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Time Taken</label>
                  <p className="text-lg font-semibold">
                    {selectedSubmission.timeSpent ? Math.floor(selectedSubmission.timeSpent / 60) : 0} minutes
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Submitted At</label>
                  <p className="text-lg font-semibold">
                    {selectedSubmission.submittedAt ? new Date(selectedSubmission.submittedAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>

              {selectedSubmission.answers && selectedSubmission.answers.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Answers</h3>
                  <div className="space-y-3">
                    {selectedSubmission.answers.map((answer: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium">Question {index + 1}</p>
                            <p className="text-sm text-gray-600 mt-1">{answer.questionText || 'Question text not available'}</p>
                            <p className="text-sm mt-2">
                              <span className="font-medium">Answer:</span> {answer.selectedAnswer || 'Not answered'}
                            </p>
                            {answer.isCorrect !== undefined && (
                              <p className={`text-sm mt-1 ${answer.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                {answer.isCorrect ? 'Correct' : 'Incorrect'}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{answer.marks || 0} marks</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setSubmissionDialogOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => handleDownloadSubmission(selectedSubmission)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
