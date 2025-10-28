"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import teacherAPI from "@/lib/api/teacher-api";

export function ReplyAssignForm({ doubtId, teacherEmail, onAnswerSubmitted }: { 
  doubtId: string; 
  teacherEmail: string;
  onAnswerSubmitted?: () => void;
}) {
  const [answerText, setAnswerText] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerText.trim()) return;

    startTransition(async () => {
      try {
        const response = await teacherAPI.questions.answer(doubtId, {
          teacherEmail,
          answerText: answerText.trim(),
          attachments: [] // TODO: Add attachment support
        });

        if (response.success) {
          setAnswerText("");
          // Call the callback to refresh data
          if (onAnswerSubmitted) {
            onAnswerSubmitted();
          } else {
            router.refresh(); // Fallback to page refresh
          }
        } else {
          console.error("Failed to submit answer:", response.error);
        }
      } catch (error) {
        console.error("Error submitting answer:", error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-2 md:grid-cols-1 items-end">
      <div>
        <Label>Your Answer</Label>
        <Textarea 
          value={answerText} 
          onChange={(e) => setAnswerText(e.target.value)} 
          placeholder="Type your answer here..." 
          rows={4}
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isPending || !answerText.trim()}>
          {isPending ? "Submitting..." : "Submit Answer"}
        </Button>
      </div>
    </form>
  );
}
