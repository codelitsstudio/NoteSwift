import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CreateContentForm } from "../create-content-form";
import { FileText } from "lucide-react";

async function getData() {
  const chapters = [
    { _id: 'ch1', course: '1', title: 'Algebra Basics' },
    { _id: 'ch2', course: '1', title: 'Geometry' },
    { _id: 'ch3', course: '2', title: 'Mechanics' },
    { _id: 'ch4', course: '3', title: 'Organic Chemistry' }
  ];
  return { chapters };
}

export default async function UploadContentPage() {
  const { chapters } = await getData();

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
          <CardDescription>Select chapter and provide content details.</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateContentForm chapters={chapters} />
        </CardContent>
      </Card>
    </div>
  );
}
