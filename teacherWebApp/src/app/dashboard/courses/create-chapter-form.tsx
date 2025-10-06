"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createChapter } from "@/app/teacher-actions";

export function CreateChapterForm({ courses }: { courses: any[] }) {
  const [courseId, setCourseId] = useState<string>(courses[0]?._id || "");
  const [title, setTitle] = useState("");
  const [order, setOrder] = useState<number>(0);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          await createChapter({ courseId, title, order });
        });
      }}
      className="space-y-3"
    >
      <Label>Course</Label>
      <Select value={courseId} onValueChange={setCourseId}>
        <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
        <SelectContent>
          {courses.map((c) => (
            <SelectItem key={c._id} value={c._id}>{c.title}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Label className="mt-2">Chapter Title</Label>
      <Input value={title} onChange={(e)=>setTitle(e.target.value)} required />

      <Label className="mt-2">Order</Label>
      <Input type="number" value={order} onChange={(e)=>setOrder(parseInt(e.target.value))} />

      <Button type="submit" disabled={isPending}>Create</Button>
    </form>
  );
}
