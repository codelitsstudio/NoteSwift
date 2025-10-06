"use client";
import { useState, useTransition } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function PlagiarismFormClient() {
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
