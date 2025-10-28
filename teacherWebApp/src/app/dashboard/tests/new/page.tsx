"use client";

import { CreateTestForm } from "../create-test-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import teacherAPI from "@/lib/api/teacher-api";
import { useEffect, useState } from "react";
import { useTeacher } from "@/context/teacher-context";

export default function CreateNewTestPage() {
  const { teacherEmail, assignedSubjects, isLoading: contextLoading } = useTeacher();
  const [subject, setSubject] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);

  useEffect(() => {
    if (!teacherEmail || contextLoading || !assignedSubjects) return;

    // Get teacher's assigned subject (first one since teacher has only one subject)
    if (assignedSubjects.length > 0) {
      const teacherSubject = assignedSubjects[0];
      setSubject({
        _id: teacherSubject._id.split('_')[0], // Extract ObjectId from subject._id
        subjectName: teacherSubject.subjectName,
        courseName: teacherSubject.courseName,
        description: teacherSubject.description
      });

      // Set modules for this subject
      setModules(teacherSubject.modules || []);
    } else {
      setSubject(null);
      setModules([]);
    }
  }, [teacherEmail, assignedSubjects, contextLoading]);

  if (contextLoading) {
    return (
      <div className="p-4 md:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Test</h1>
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
          <h1 className="text-3xl font-bold tracking-tight">Create New Test</h1>
          <p className="text-muted-foreground mt-2">
            Please log in to create tests.
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

  if (!subject) {
    return (
      <div className="p-4 md:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Test</h1>
          <p className="text-muted-foreground mt-2">
            No subject assigned to this teacher.
          </p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p>No subject content found for this teacher</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Test</h1>
        <p className="text-muted-foreground mt-2">
          Set up a new test with custom questions, duration, and grading criteria for your students
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Test Details
          </CardTitle>
          <CardDescription>
            Fill in the details below to create a new test for your students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateTestForm subject={subject} modules={modules} />
        </CardContent>
      </Card>
    </div>
  );
}
