"use client";

import { useState, useTransition } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { submitFeedback } from "@/app/teacher-actions";

export function SubmitFeedbackForm() {
  const [rating, setRating] = useState<number>(5);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <form onSubmit={(e)=>{ e.preventDefault(); startTransition(async ()=>{ await submitFeedback({ rating, message }); setMessage(""); }); }} className="space-y-3">
      <div>
        <Label>Rating (1-5)</Label>
        <Input type="number" min={1} max={5} value={rating} onChange={(e)=>setRating(parseInt(e.target.value))} />
      </div>
      <div>
        <Label>Message</Label>
        <Textarea value={message} onChange={(e)=>setMessage(e.target.value)} required />
      </div>
      <Button type="submit" disabled={isPending}>Submit</Button>
    </form>
  );
}
