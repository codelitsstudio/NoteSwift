"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ImportExportQuestions({ tests }: { tests: any[] }) {
  const [testId, setTestId] = useState<string>(tests[0]?._id || "");
  const [file, setFile] = useState<File | null>(null);
  const handleExport = async () => {
    if (!testId) return;
    const res = await fetch(`/api/tests/${testId}/questions`);
    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'questions.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const handleImport = async () => {
    if (!file || !testId) return;
    const text = await file.text();
    const payload = JSON.parse(text);
    await fetch(`/api/tests/${testId}/questions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    window.location.reload();
  };
  return (
    <div className="flex flex-col md:flex-row gap-3 items-end">
      <div className="w-64">
        <Label>Test</Label>
        <Select value={testId} onValueChange={setTestId}>
          <SelectTrigger><SelectValue placeholder="Select test" /></SelectTrigger>
          <SelectContent>
            {tests.map((t)=> <SelectItem key={t._id} value={t._id}>{t.title}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Import JSON</Label>
        <Input type="file" accept="application/json" onChange={(e)=>setFile(e.target.files?.[0] || null)} />
      </div>
      <div className="flex gap-2">
        <Button type="button" onClick={handleImport}>Import</Button>
        <Button type="button" variant="secondary" onClick={handleExport}>Export</Button>
      </div>
    </div>
  );
}
