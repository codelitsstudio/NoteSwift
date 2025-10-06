"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createTest } from "@/app/teacher-actions";

export function CreateTestForm({ courses, chapters }: { courses: any[]; chapters: any[] }) {
  const [courseId, setCourseId] = useState<string>(courses[0]?._id || "");
  const [chapterId, setChapterId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [isPending, startTransition] = useTransition();

  const filteredChapters = chapters.filter((ch: any)=> String(ch.course) === courseId);

  return (
    <form
      onSubmit={(e)=>{ e.preventDefault(); startTransition(async ()=>{ await createTest({ courseId, chapterId: chapterId || undefined, title, description, scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined, durationMinutes }); }); }}
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
      <div className="space-y-2">
        <Label>Scheduled At</Label>
        <Input type="datetime-local" value={scheduledAt} onChange={(e)=>setScheduledAt(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Duration (minutes)</Label>
        <Input type="number" value={durationMinutes} onChange={(e)=>setDurationMinutes(parseInt(e.target.value))} />
      </div>
      <div className="md:col-span-2">
        <Button type="submit" disabled={isPending}>Create</Button>
      </div>
    </form>
  );
}
