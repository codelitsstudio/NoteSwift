"use client";
import { useParams } from "next/navigation";
import { EditTestForm } from "../../edit-test-form";
import { useTeacher } from "@/context/teacher-context";
import { useEffect, useState } from "react";
import teacherAPI from "@/lib/api/teacher-api";

export default function EditTestPage() {
  const params = useParams();
  const { teacherEmail } = useTeacher();
  const testId = params.testId as string;

  const [subject, setSubject] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Try to load teacher subject and modules (optional)
        try {
          const subjectContentResponse = await teacherAPI.courses.getSubjectContent(teacherEmail);
          if (subjectContentResponse.success && subjectContentResponse.data) {
            const subjectContent = subjectContentResponse.data;
            setSubject(subjectContent);
            const modulesData = subjectContent.modules || [];
            setModules(modulesData);
          }
        } catch (subjectError) {
          console.warn('Could not load subject content, proceeding without it:', subjectError);
          // Set default empty subject and modules
          setSubject({ subjectName: 'General', courseName: 'General Course' });
          setModules([]);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load teacher data');
      } finally {
        setLoading(false);
      }
    };

    if (teacherEmail) {
      loadData();
    }
  }, [teacherEmail]);

  const handleBack = () => {
    window.history.back();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="animate-pulse h-8 w-48 bg-gray-200 rounded"></div>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            ← Back to Tests
          </button>
        </div>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  // Always render the form since we provide default subject data
  return (
    <EditTestForm
      testId={testId}
      subject={subject || { subjectName: 'General', courseName: 'General Course' }}
      modules={modules}
      onBack={handleBack}
    />
  );
}