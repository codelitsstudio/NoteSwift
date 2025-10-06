"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { markAttendance } from "@/app/teacher-actions";

export function ManualAttendanceForm({ studentId, courses }: { studentId: string; courses: any[] }) {
  const [courseId, setCourseId] = useState<string>(courses[0]?._id || "");
  const [date, setDate] = useState<string>("");
  const [status, setStatus] = useState<string>("present");
  const [note, setNote] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  return (
    <form onSubmit={(e)=>{ e.preventDefault(); startTransition(async ()=>{ await markAttendance({ studentId, courseId, date: date ? new Date(date).toISOString() : new Date().toISOString(), status: status as any, note: note || undefined }); }); }} className="flex items-end gap-2">
      <div className="w-40">
        <Label>Course</Label>
        <Select value={courseId} onValueChange={setCourseId}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {courses.map((c)=> <SelectItem key={c._id} value={c._id}>{c.title}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Date</Label>
        <Input type="date" value={date} onChange={(e)=>setDate(e.target.value)} />
      </div>
      <div>
        <Label>Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="present">Present</SelectItem>
            <SelectItem value="absent">Absent</SelectItem>
            <SelectItem value="late">Late</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="w-48">
        <Label>Note</Label>
        <Input value={note} onChange={(e)=>setNote(e.target.value)} />
      </div>
      <Button type="submit" disabled={isPending}>Mark</Button>
    </form>
  );
}
