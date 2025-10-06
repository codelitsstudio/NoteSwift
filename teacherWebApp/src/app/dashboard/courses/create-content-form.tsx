"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createContent } from "@/app/teacher-actions";

export function CreateContentForm({ chapters }: { chapters: any[] }) {
  const [chapterId, setChapterId] = useState<string>(chapters[0]?._id || "");
  const [type, setType] = useState<string>("video");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          await createContent({ chapterId, type: type as any, title, description, url: url || undefined, deadline: deadline || undefined });
        });
      }}
      className="space-y-3"
    >
      <Label>Chapter</Label>
      <Select value={chapterId} onValueChange={setChapterId}>
        <SelectTrigger><SelectValue placeholder="Select chapter" /></SelectTrigger>
        <SelectContent>
          {chapters.map((c) => (
            <SelectItem key={c._id} value={c._id}>{c.title}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Label className="mt-2">Type</Label>
      <Select value={type} onValueChange={setType}>
        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="video">Video</SelectItem>
          <SelectItem value="pdf">PDF</SelectItem>
          <SelectItem value="slides">Slides</SelectItem>
          <SelectItem value="assignment">Assignment</SelectItem>
          <SelectItem value="question_bank">Question Bank</SelectItem>
        </SelectContent>
      </Select>

      <Label className="mt-2">Title</Label>
      <Input value={title} onChange={(e)=>setTitle(e.target.value)} required />

      <Label className="mt-2">Description</Label>
      <Textarea value={description} onChange={(e)=>setDescription(e.target.value)} />

      <Label className="mt-2">URL</Label>
      <Input value={url} onChange={(e)=>setUrl(e.target.value)} placeholder="https://..." />

      <Label className="mt-2">Deadline (if assignment)</Label>
      <Input type="datetime-local" value={deadline} onChange={(e)=>setDeadline(e.target.value ? new Date(e.target.value).toISOString() : "")} />

      <Button type="submit" disabled={isPending}>Add Content</Button>
    </form>
  );
}
