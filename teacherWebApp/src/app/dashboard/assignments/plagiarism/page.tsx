import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlagiarismForm } from "../assignment-forms";
import { Copy } from "lucide-react";

export default function PlagiarismCheckerPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Plagiarism Checker</h1>
          <p className="text-muted-foreground mt-2">Upload student work or text to generate a similarity report.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/assignments">Back to Assignments</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            Run Check
          </CardTitle>
          <CardDescription>Multiple algorithms and source matching for reliable detection.</CardDescription>
        </CardHeader>
        <CardContent>
          <PlagiarismForm />
        </CardContent>
      </Card>
    </div>
  );
}
