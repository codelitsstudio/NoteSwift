"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { scheduleLiveClass } from "@/app/teacher-actions";

export function ScheduleClassForm({ courses, chapters }: { courses: any[]; chapters: any[] }) {
  const [courseId, setCourseId] = useState<string>(courses[0]?._id || "");
  const [subject, setSubject] = useState("");
  const [chapterId, setChapterId] = useState<string>("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [platform, setPlatform] = useState<string>("jitsi");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [recordingUrl, setRecordingUrl] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredChapters = chapters.filter((ch: any)=> String(ch.course) === courseId);

  return (
    <form
      onSubmit={(e)=>{ e.preventDefault(); startTransition(async ()=>{ await scheduleLiveClass({ courseId, subject, chapterId: chapterId || undefined, scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : new Date().toISOString(), durationMinutes, platform: platform as any, meetingUrl, recordingUrl: recordingUrl || undefined }); }); }}
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
        <Label>Subject</Label>
        <Input value={subject} onChange={(e)=>setSubject(e.target.value)} required />
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
      <div className="space-y-2">
        <Label>Scheduled At</Label>
        <Input type="datetime-local" value={scheduledAt} onChange={(e)=>setScheduledAt(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Duration (minutes)</Label>
        <Input type="number" value={durationMinutes} onChange={(e)=>setDurationMinutes(parseInt(e.target.value))} />
      </div>
      <div className="space-y-2">
        <Label>Platform</Label>
        <Select value={platform} onValueChange={setPlatform}>
          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="jitsi">Jitsi</SelectItem>
            <SelectItem value="zoom">Zoom</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>Meeting URL</Label>
        <Input value={meetingUrl} onChange={(e)=>setMeetingUrl(e.target.value)} placeholder="https://meet.jit.si/room" required />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>Recording URL</Label>
        <Input value={recordingUrl} onChange={(e)=>setRecordingUrl(e.target.value)} placeholder="https://..." />
      </div>
      <div className="md:col-span-2">
        <Button type="submit" disabled={isPending}>Schedule</Button>
      </div>
    </form>
  );
}
