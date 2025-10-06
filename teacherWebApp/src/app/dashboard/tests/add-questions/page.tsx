import { AddQuestionForm } from "../add-question-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default async function AddQuestionsPage() {
  // Mock data for teacher's tests
  const tests = [
    {
      _id: '1',
      title: 'Calculus Mid-term Examination',
      course: 'Grade 11 Study Package',
      chapter: 'Calculus',
      totalQuestions: 25,
      totalMarks: 100,
    },
    {
      _id: '2',
      title: 'Algebra Quiz',
      course: 'Grade 11 Study Package',
      chapter: 'Quadratic Equations',
      totalQuestions: 15,
      totalMarks: 50,
    },
    {
      _id: '3',
      title: 'Trigonometry Final',
      course: 'Grade 11 Study Package',
      chapter: 'Trigonometry',
      totalQuestions: 30,
      totalMarks: 120,
    },
  ];

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Questions</h1>
        <p className="text-muted-foreground mt-2">
          Add MCQ, descriptive, or short answer questions to your existing tests
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
          <AddQuestionForm tests={tests} />
        </CardContent>
      </Card>
    </div>
  );
}
