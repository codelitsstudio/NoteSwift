import dbConnect from "@/lib/mongoose";
import Feedback from "@/models/Feedback";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubmitFeedbackForm } from "./submit-form";

async function getData() {
  await dbConnect();
  const items = await Feedback.find({}).sort({ createdAt: -1 }).lean();
  return { items: JSON.parse(JSON.stringify(items)) };
}

export default async function FeedbackPage() {
  const { items } = await getData();
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-headline font-bold">Feedback</h1>

      <Card>
        <CardHeader>
          <CardTitle>Collect Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <SubmitFeedbackForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Feedback</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((f:any)=> (
            <div key={f._id} className="border rounded p-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Rating: {f.rating}/5</span>
                <span className="text-xs text-muted-foreground">{new Date(f.createdAt).toLocaleString()}</span>
              </div>
              <p className="mt-2 text-sm">{f.message}</p>
            </div>
          ))}
          {items.length === 0 && <p className="text-sm text-muted-foreground">No feedback yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
