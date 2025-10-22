'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { EditModuleForm } from "../../edit-module-form";
import { BookOpen } from "lucide-react";
import { useTeacherAuth } from "@/components/dashboard-client-wrapper";
import { useEffect, useState } from "react";
import teacherAPI from "@/lib/api/teacher-api";
import { useParams, useRouter } from "next/navigation";

export default function EditModulePage() {
  const { teacherEmail, loading: authLoading } = useTeacherAuth();
  const [course, setCourse] = useState<any>(null);
  const [module, setModule] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const router = useRouter();
  const moduleNumber = parseInt(params.moduleNumber as string);

  useEffect(() => {
    if (authLoading) return;

    if (!teacherEmail) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const response = await teacherAPI.courses.getSubjectContent(teacherEmail);
        if (response.data?.course) {
          setCourse(response.data.course);
        }
        if (response.data?.subjectContent?.modules) {
          const foundModule = response.data.subjectContent.modules.find(
            (m: any) => m.moduleNumber === moduleNumber
          );
          if (foundModule) {
            setModule(foundModule);
          } else {
            router.push('/dashboard/courses');
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        router.push('/dashboard/courses');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [teacherEmail, authLoading, moduleNumber, router]);

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

  if (!course || !module) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Edit Module</h1>
          <p className="text-muted-foreground mt-2">Module not found</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">The requested module could not be found.</p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/courses">Back to Courses</Link>
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
          <h1 className="text-3xl font-bold">Edit Module</h1>
          <p className="text-muted-foreground mt-2">Update module information and content.</p>
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
          <CardDescription>Update module information.</CardDescription>
        </CardHeader>
        <CardContent>
          <EditModuleForm course={course} module={module} teacherEmail={teacherEmail!} />
        </CardContent>
      </Card>
    </div>
  );
}