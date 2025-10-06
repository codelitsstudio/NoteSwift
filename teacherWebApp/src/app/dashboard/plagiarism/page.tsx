import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PlagiarismFormClient } from "./plagiarism-form";

export default function PlagiarismPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-headline font-bold">Plagiarism Checker</h1>
      <Card>
        <CardHeader>
          <CardTitle>Check Text</CardTitle>
        </CardHeader>
        <CardContent>
          <PlagiarismFormClient />
        </CardContent>
      </Card>
    </div>
  );
}
