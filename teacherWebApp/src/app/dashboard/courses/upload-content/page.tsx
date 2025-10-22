'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CreateContentForm } from "../create-content-form";
import { FileText } from "lucide-react";
import { useTeacherAuth } from "@/components/dashboard-client-wrapper";
import { useEffect, useState } from "react";
import teacherAPI from "@/lib/api/teacher-api";

export default function UploadContentPage() {
  const { teacherEmail, loading: authLoading } = useTeacherAuth();
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!teacherEmail) {
      setLoading(false);
      return;
    }

    const fetchModules = async () => {
      try {
        const response = await teacherAPI.courses.getSubjectContent(teacherEmail);
        if (response.data?.subjectContent?.modules) {
          setModules(response.data.subjectContent.modules);
        }
      } catch (error) {
        console.error('Error fetching modules:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
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

  if (modules.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Upload Content</h1>
            <p className="text-muted-foreground mt-2">Upload videos, PDFs, slides, and other learning materials.</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/dashboard/courses">Back to Courses</Link>
          </Button>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No modules available. Create a module first.</p>
            <Button asChild>
              <Link href="/dashboard/courses/new-chapter">Create Module</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Upload Content</h1>
          <p className="text-muted-foreground mt-2">Upload videos, PDFs, slides, and other learning materials.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/courses">Back to Courses</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Content Details
          </CardTitle>
          <CardDescription>Select module and provide content details.</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateContentForm modules={modules} teacherEmail={teacherEmail} />
        </CardContent>
      </Card>
    </div>
  );
}
