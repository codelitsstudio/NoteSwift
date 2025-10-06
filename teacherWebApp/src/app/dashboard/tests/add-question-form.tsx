"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addQuestion, suggestQuestions } from "@/app/teacher-actions";
import { LatexPreview } from "@/components/latex-preview";

export function AddQuestionForm({ tests }: { tests: any[] }) {
  const [testId, setTestId] = useState<string>(tests[0]?._id || "");
  const [type, setType] = useState<string>("mcq");
  const [text, setText] = useState("");
  const [options, setOptions] = useState<{key:string;text:string}[]>([{ key: 'A', text: '' }, { key: 'B', text: '' }, { key: 'C', text: '' }, { key: 'D', text: '' }]);
  const [correctAnswer, setCorrectAnswer] = useState<string>("A");
  const [points, setPoints] = useState<number>(1);
  const [difficulty, setDifficulty] = useState<string>("medium");
  const [usesLatex, setUsesLatex] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();
  const [topic, setTopic] = useState("");
  const [suggested, setSuggested] = useState<any[]>([]);

  return (
    <form
      onSubmit={(e)=>{ e.preventDefault(); startTransition(async ()=>{ await addQuestion({ testId, type: type as any, text, options: type==='mcq'?options:undefined, correctAnswer: type==='mcq'?correctAnswer:undefined, points, difficulty: difficulty as any, usesLatex }); }); }}
      className="grid gap-3 md:grid-cols-2"
    >
      <div className="space-y-2">
        <Label>Test</Label>
        <Select value={testId} onValueChange={setTestId}>
          <SelectTrigger><SelectValue placeholder="Select test" /></SelectTrigger>
          <SelectContent>
            {tests.map((t)=> <SelectItem key={t._id} value={t._id}>{t.title}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Type</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="mcq">MCQ</SelectItem>
            <SelectItem value="numerical">Numerical</SelectItem>
            <SelectItem value="short">Short</SelectItem>
            <SelectItem value="long">Long</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>Question Text</Label>
        <Textarea value={text} onChange={(e)=>setText(e.target.value)} required />
        <LatexPreview content={text} enabled={usesLatex} />
      </div>
      {type==='mcq' && (
        <div className="md:col-span-2 grid gap-2">
          <Label>Options</Label>
          {options.map((opt,i)=> (
            <div key={opt.key} className="flex gap-2 items-center">
              <span className="w-6">{opt.key}</span>
              <Input value={opt.text} onChange={(e)=>{
                const next=[...options];
                next[i] = { ...opt, text: e.target.value };
                setOptions(next);
              }} />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Correct</Label>
              <Select value={correctAnswer} onValueChange={setCorrectAnswer}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {options.map((opt)=> <SelectItem key={opt.key} value={opt.key}>{opt.key}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Points</Label>
              <Input type="number" value={points} onChange={(e)=>setPoints(parseInt(e.target.value))} />
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2 md:col-span-2">
        <div>
          <Label>Topic (optional)</Label>
          <Input value={topic} onChange={(e)=>setTopic(e.target.value)} placeholder="e.g., Algebra - Quadratic" />
        </div>
        <div>
          <Label>Difficulty</Label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end gap-2">
          <input id="latex" type="checkbox" checked={usesLatex} onChange={(e)=>setUsesLatex(e.target.checked)} />
          <Label htmlFor="latex">Uses LaTeX</Label>
        </div>
      </div>
      <div className="md:col-span-2 flex items-center gap-2">
        <Button type="submit" disabled={isPending}>Add Question</Button>
        <Button type="button" variant="secondary" onClick={async ()=>{
          const res = await suggestQuestions({ topic: topic || text.slice(0,50), type: type as any, count: 3 });
          if ((res as any).questions) setSuggested((res as any).questions);
        }}>Suggest Questions</Button>
      </div>
      {suggested.length>0 && (
        <div className="md:col-span-2 border rounded p-3 space-y-2">
          <p className="text-sm font-medium">Suggestions</p>
          {suggested.map((q:any, i:number)=> (
            <div key={i} className="text-sm">
              <div className="flex items-center justify-between">
                <span>{q.text}</span>
                <Button size="sm" variant="outline" onClick={()=>{
                  setText(q.text);
                  if (q.options) setOptions(q.options);
                  if (q.correctAnswer) setCorrectAnswer(q.correctAnswer);
                }}>Use</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </form>
  );
}
