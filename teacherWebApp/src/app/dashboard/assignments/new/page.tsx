import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CreateAssignmentForm } from "../assignment-forms";
import { FileText } from "lucide-react";

async function getData() {
  const courses = [
    { _id: '1', title: 'Mathematics Grade 10' },
    { _id: '2', title: 'Physics Grade 11' },
    { _id: '3', title: 'Chemistry Grade 12' }
  ];
  const chapters = [
    { _id: 'ch1', course: '1', title: 'Algebra Basics' },
    { _id: 'ch2', course: '1', title: 'Geometry' },
    { _id: 'ch3', course: '2', title: 'Mechanics' },
    { _id: 'ch4', course: '3', title: 'Organic Chemistry' }
  ];
  return { courses, chapters };
}

export default async function NewAssignmentPage() {
  const { courses, chapters } = await getData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create Assignment</h1>
          <p className="text-muted-foreground mt-2">Design and publish a new assignment for your students.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/assignments">Back to Assignments</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Assignment Details
          </CardTitle>
          <CardDescription>Set title, description, deadline, and grading rubric.</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateAssignmentForm courses={courses} chapters={chapters} />
        </CardContent>
      </Card>
    </div>
  );
}
