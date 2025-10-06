"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { replyToDoubt, assignDoubt } from "@/app/teacher-actions";

export function ReplyAssignForm({ doubtId, defaultTeacherId }: { doubtId: string; defaultTeacherId: string | null }) {
  const [teacherId, setTeacherId] = useState<string>(defaultTeacherId || "");
  const [message, setMessage] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  return (
    <form onSubmit={(e)=>{ e.preventDefault(); startTransition(async ()=>{ if (message) await replyToDoubt({ doubtId, teacherId, message }); }); }} className="grid gap-2 md:grid-cols-4 items-end">
      <div className="md:col-span-3">
        <Label>Reply</Label>
        <Textarea value={message} onChange={(e)=>setMessage(e.target.value)} placeholder="Type a reply..." />
      </div>
      <div>
        <Label>Teacher ID</Label>
        <Input value={teacherId} onChange={(e)=>setTeacherId(e.target.value)} placeholder="Teacher ObjectId" />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>Send</Button>
        <Button type="button" variant="secondary" onClick={()=> startTransition(async ()=>{ if (teacherId) await assignDoubt({ doubtId, teacherId }); })} disabled={isPending}>Assign</Button>
      </div>
    </form>
  );
}
