import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CreateChapterForm } from "../create-chapter-form";
import { BookOpen } from "lucide-react";

async function getData() {
  const courses = [
    { _id: '1', title: 'Mathematics Grade 10' },
    { _id: '2', title: 'Physics Grade 11' },
    { _id: '3', title: 'Chemistry Grade 12' }
  ];
  return { courses };
}

export default async function NewChapterPage() {
  const { courses } = await getData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create Chapter</h1>
          <p className="text-muted-foreground mt-2">Add a new chapter to your course and structure your curriculum.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/courses">Back to Courses</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Chapter Details
          </CardTitle>
          <CardDescription>Select course and provide chapter information.</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateChapterForm courses={courses} />
        </CardContent>
      </Card>
    </div>
  );
}
