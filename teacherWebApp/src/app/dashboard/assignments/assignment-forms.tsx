"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createAssignment, gradeSubmission, autoGradeSubmission } from "@/app/teacher-actions";

export function CreateAssignmentForm({ courses, chapters }: { courses: any[]; chapters: any[] }) {
  const [courseId, setCourseId] = useState<string>(courses[0]?._id || "");
  const [chapterId, setChapterId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredChapters = chapters.filter((ch: any)=> String(ch.course) === courseId);

  return (
    <form
      onSubmit={(e)=>{ e.preventDefault(); startTransition(async ()=>{ await createAssignment({ courseId, chapterId: chapterId || undefined, title, description, deadline: deadline ? new Date(deadline).toISOString() : undefined }); }); }}
      className="grid gap-3 md:grid-cols-2"
    >
      <div className="space-y-2">
        <Label>Course</Label>
        <Select value={courseId} onValueChange={setCourseId}>
          <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
          <SelectContent>
            {courses.map((c)=> <SelectItem key={c._id} value={c._id}>{c.title}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Chapter</Label>
        <Select value={chapterId} onValueChange={setChapterId}>
          <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
          <SelectContent>
            {filteredChapters.map((ch:any)=> <SelectItem key={ch._id} value={ch._id}>{ch.title}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>Title</Label>
        <Input value={title} onChange={(e)=>setTitle(e.target.value)} required />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>Description</Label>
        <Textarea value={description} onChange={(e)=>setDescription(e.target.value)} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>Deadline</Label>
        <Input type="datetime-local" value={deadline} onChange={(e)=>setDeadline(e.target.value)} />
      </div>
      <div className="md:col-span-2">
        <Button type="submit" disabled={isPending}>Create</Button>
      </div>
    </form>
  );
}

export function SubmissionRow({ submission }: { submission: any }) {
  const [score, setScore] = useState<number>(submission.score ?? 0);
  const [feedback, setFeedback] = useState<string>(submission.feedback ?? "");
  const [isPending, startTransition] = useTransition();
  return (
    <div className="border rounded p-2 flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm">
        <div>
          <span className="font-medium">{submission.student?.name || 'Student'}</span>
          <span className="ml-2 text-muted-foreground">{new Date(submission.submittedAt).toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <Input type="number" value={score} onChange={(e)=>setScore(parseInt(e.target.value))} className="w-24" />
          <Button size="sm" onClick={()=> startTransition(async ()=>{ await gradeSubmission({ submissionId: submission._id, score, feedback: feedback || undefined }); })} disabled={isPending}>Save</Button>
          <Button size="sm" variant="secondary" onClick={()=> startTransition(async ()=>{ await autoGradeSubmission({ submissionId: submission._id }); })} disabled={isPending}>Auto</Button>
        </div>
      </div>
      <Textarea placeholder="Feedback / comments" value={feedback} onChange={(e)=>setFeedback(e.target.value)} />
    </div>
  );
}

export function PlagiarismForm() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  return (
    <form onSubmit={(e)=>{ e.preventDefault(); startTransition(async ()=>{ const res = await fetch(`/api/plagiarism`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) }); const data = await res.json(); setResult(data.score ?? null); }); }} className="space-y-3">
      <Textarea placeholder="Paste text to check..." value={text} onChange={(e)=>setText(e.target.value)} />
      <div className="flex items-center gap-2">
        <Button type="submit" disabled={isPending}>Run Check</Button>
        {result!=null && <span className="text-sm">Similarity: {result}%</span>}
      </div>
    </form>
  );
}
