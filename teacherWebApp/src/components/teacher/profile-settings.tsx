"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateTeacherProfile } from "@/app/teacher-actions";

export function ProfileSettings({ teacher }: { teacher: any }) {
  const [name, setName] = useState(teacher?.name || "");
  const [bio, setBio] = useState(teacher?.bio || "");
  const [qualifications, setQualifications] = useState(teacher?.qualifications || "");
  const [subjects, setSubjects] = useState<string>((teacher?.subjects || []).join(", "));
  const [photoUrl, setPhotoUrl] = useState(teacher?.photoUrl || "");
  const [isPending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e)=>{ e.preventDefault(); startTransition(async ()=>{ await updateTeacherProfile({ teacherId: String(teacher?._id), name, bio, qualifications, subjects: subjects.split(",").map((s)=>s.trim()).filter(Boolean), photoUrl: photoUrl || undefined }); }); }}
      className="space-y-3"
    >
      <div>
        <Label>Name</Label>
        <Input value={name} onChange={(e)=>setName(e.target.value)} required />
      </div>
      <div>
        <Label>Bio</Label>
        <Textarea value={bio} onChange={(e)=>setBio(e.target.value)} />
      </div>
      <div>
        <Label>Qualifications</Label>
        <Input value={qualifications} onChange={(e)=>setQualifications(e.target.value)} />
      </div>
      <div>
        <Label>Subjects (comma separated)</Label>
        <Input value={subjects} onChange={(e)=>setSubjects(e.target.value)} />
      </div>
      <div>
        <Label>Photo URL</Label>
        <Input value={photoUrl} onChange={(e)=>setPhotoUrl(e.target.value)} />
      </div>
      <Button type="submit" disabled={isPending}>Save Profile</Button>
    </form>
  );
}
