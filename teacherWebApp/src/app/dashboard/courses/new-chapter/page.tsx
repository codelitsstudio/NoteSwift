'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CreateChapterForm } from "../create-chapter-form";
import { BookOpen } from "lucide-react";
import { useTeacherAuth } from "@/components/dashboard-client-wrapper";
import { useEffect, useState } from "react";
import teacherAPI from "@/lib/api/teacher-api";

export default function NewChapterPage() {
  const { teacherEmail, loading: authLoading } = useTeacherAuth();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!teacherEmail) {
      setLoading(false);
      return;
    }

    const fetchCourse = async () => {
      try {
        const response = await teacherAPI.courses.getSubjectContent(teacherEmail) as any;
        if (response.success && response.result?.subjects?.[0]) {
          const subject = response.result.subjects[0];
          setCourse({
            _id: subject.courseId,
            title: subject.courseName,
            subjectName: subject.subjectName,
            description: subject.description,
            program: subject.courseProgram
          });
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [teacherEmail, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Create Chapter</h1>
          <p className="text-muted-foreground mt-2">No subject assigned yet</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">You haven't been assigned to any subject yet. Contact your administrator.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create Module</h1>
          <p className="text-muted-foreground mt-2">Add a new module to your subject and structure your curriculum.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/courses">Back to Courses</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Module Details
          </CardTitle>
          <CardDescription>Select subject and provide module information.</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateChapterForm course={course} teacherEmail={teacherEmail} />
        </CardContent>
      </Card>
    </div>
  );
}
