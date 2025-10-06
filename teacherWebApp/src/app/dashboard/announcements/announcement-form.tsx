"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createAnnouncement } from "@/app/teacher-actions";

export function CreateAnnouncementForm({ courses, batches, teachers }: { courses: any[]; batches: any[]; teachers: any[] }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [courseId, setCourseId] = useState<string>("all");
  const [batchId, setBatchId] = useState<string>("all");
  const [teacherId, setTeacherId] = useState<string>(teachers[0]?._id || "");
  const [isPending, startTransition] = useTransition();

  return (
    <form onSubmit={(e)=>{ e.preventDefault(); startTransition(async ()=>{ await createAnnouncement({ title, message, courseId: courseId === "all" ? undefined : courseId, batchId: batchId === "all" ? undefined : batchId, teacherId }); }); }} className="grid gap-3 md:grid-cols-2">
      <div className="md:col-span-2">
        <Label>Title</Label>
        <Input value={title} onChange={(e)=>setTitle(e.target.value)} required />
      </div>
      <div className="md:col-span-2">
        <Label>Message</Label>
        <Textarea value={message} onChange={(e)=>setMessage(e.target.value)} required />
      </div>
      <div>
        <Label>Course</Label>
        <Select value={courseId} onValueChange={setCourseId}>
          <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses.map((c)=> <SelectItem key={c._id} value={c._id}>{c.title}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Batch</Label>
        <Select value={batchId} onValueChange={setBatchId}>
          <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Batches</SelectItem>
            {batches.map((b)=> <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="md:col-span-2">
        <Label>Sender</Label>
        <Select value={teacherId} onValueChange={setTeacherId}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {teachers.map((t)=> <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="md:col-span-2">
        <Button type="submit" disabled={isPending}>Send</Button>
      </div>
    </form>
  );
}
