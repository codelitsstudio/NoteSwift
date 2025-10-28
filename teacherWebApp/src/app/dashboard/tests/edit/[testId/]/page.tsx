"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { EditTestForm } from "../../../edit-test-form";
import teacherAPI from "@/lib/api/teacher-api";
import { useTeacher } from "@/context/teacher-context";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function EditTestPage() {
  const router = useRouter();
  const params = useParams();
  const { teacherEmail } = useTeacher();
  const testId = params.testId as string;

  const [subject, setSubject] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const loadTeacherData = async () => {
      try {
        setLoading(true);

        // Get teacher subject and modules
        const subjectData = await teacherAPI.courses.getSubjectContent(teacherEmail);
        if (subjectData.success && subjectData.data) {
          setSubject(subjectData.data.subject);
          setModules(subjectData.data.modules || []);
        } else {
          setError("Failed to load teacher profile");
        }
      } catch (err) {
        console.error('Error loading teacher data:', err);
        setError('Failed to load teacher data');
      } finally {
        setLoading(false);
      }
    };

    if (teacherEmail) {
      loadTeacherData();
    }
  }, [teacherEmail]);

  const handleBack = () => {
    router.push('/dashboard/tests');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
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
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <div>
                <h3 className="font-medium">Error</h3>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-yellow-600">
              <AlertCircle className="h-5 w-5" />
              <div>
                <h3 className="font-medium">No Subject Assigned</h3>
                <p className="text-sm">You need to be assigned to a subject to edit tests.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <EditTestForm
        testId={testId}
        subject={subject}
        modules={modules}
        onBack={handleBack}
      />
    </div>
  );
}