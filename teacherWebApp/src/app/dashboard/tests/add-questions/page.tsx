"use client";

import { AddQuestionForm } from "../add-question-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import teacherAPI from "@/lib/api/teacher-api";
import { useEffect, useState, useCallback } from "react";
import { useTeacher } from "@/context/teacher-context";

export default function AddQuestionsPage() {
  const { teacherEmail, isLoading: contextLoading } = useTeacher();
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchTests = useCallback(async () => {
    if (!teacherEmail || contextLoading) return;

    console.log('Fetching tests for teacher:', teacherEmail);

    try {
      setLoading(true);

      const testsResponse = await teacherAPI.tests.getAll(teacherEmail);

      // Handle the expected response structure: { success: true, data: { tests, stats } }
      let testsArray: any[] = [];
      if (testsResponse.success && testsResponse.data) {
        if (testsResponse.data.tests && Array.isArray(testsResponse.data.tests)) {
          testsArray = testsResponse.data.tests;
        } else if (Array.isArray(testsResponse.data)) {
          testsArray = testsResponse.data;
        }
      }

      const testsData = testsArray.map((test: any) => ({
        _id: test._id || test.id,
        title: test.title,
        course: test.courseName || test.subjectName,
        chapter: test.moduleName || test.topicName || 'General',
        totalQuestions: test.questions?.length || test.totalQuestions || 0,
        totalMarks: test.totalMarks || 0,
        type: test.testType || test.type || 'mcq',
        status: test.status || 'draft', // Add status field for filtering
      }));

      setTests(testsData);
    } catch (err) {
      console.error('Error fetching tests:', err);
      setError('Failed to load tests');
    } finally {
      setLoading(false);
    }
  }, [teacherEmail, contextLoading]);

  useEffect(() => {
    fetchTests();
  }, [fetchTests, refreshTrigger]);

  const handleRefreshTests = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (contextLoading) {
    return (
      <div className="p-4 md:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Questions</h1>
          <p className="text-muted-foreground mt-2">
            Loading teacher data...
          </p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!teacherEmail) {
    return (
      <div className="p-4 md:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Questions</h1>
          <p className="text-muted-foreground mt-2">
            Please log in to add questions.
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
      <div className="p-4 md:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Questions</h1>
          <p className="text-muted-foreground mt-2">
            Loading tests...
          </p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Questions</h1>
          <p className="text-muted-foreground mt-2">
            Create comprehensive tests with MCQ questions, PDF uploads, or mixed assessments
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
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Questions</h1>
        <p className="text-muted-foreground mt-2">
          Create comprehensive tests with MCQ questions, PDF uploads, or mixed assessments
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Question Details
          </CardTitle>
          <CardDescription>
            Select a test and add questions to build your test content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddQuestionForm tests={tests} teacherEmail={teacherEmail} onRefreshTests={handleRefreshTests} />
        </CardContent>
      </Card>
    </div>
  );
}
