import { CreateTestForm } from "../create-test-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default async function CreateNewTestPage() {
  // Mock data for teacher's courses and chapters
  const courses = [
    {
      _id: '507f1f77bcf86cd799439012',
      title: 'Grade 11 Study Package',
      subject: 'Mathematics',
    }
  ];

  const chapters = [
    {
      _id: '1',
      title: 'Quadratic Equations',
      courseId: '507f1f77bcf86cd799439012',
    },
    {
      _id: '2',
      title: 'Calculus',
      courseId: '507f1f77bcf86cd799439012',
    },
    {
      _id: '3',
      title: 'Trigonometry',
      courseId: '507f1f77bcf86cd799439012',
    },
    {
      _id: '4',
      title: 'Coordinate Geometry',
      courseId: '507f1f77bcf86cd799439012',
    },
    {
      _id: '5',
      title: 'Statistics',
      courseId: '507f1f77bcf86cd799439012',
    },
  ];

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Test</h1>
        <p className="text-muted-foreground mt-2">
          Set up a new test with custom questions, duration, and grading criteria for your Grade 11 Mathematics students
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
          <CreateTestForm courses={courses} chapters={chapters} />
        </CardContent>
      </Card>
    </div>
  );
}
