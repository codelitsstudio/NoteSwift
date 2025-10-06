import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import { Question } from "@/models/Test";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const items = await Question.find({ test: params.id }).lean();
  return NextResponse.json(items.map((q:any)=> ({
    _id: String(q._id),
    type: q.type,
    text: q.text,
    options: q.options,
    correctAnswer: q.correctAnswer,
    points: q.points,
    difficulty: q.difficulty,
    usesLatex: q.usesLatex,
  })));
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const body = await req.json();
  if (!Array.isArray(body)) return NextResponse.json({ error: 'Expected an array of questions' }, { status: 400 });
  const docs = body.map((q:any)=> ({
    test: params.id,
    type: q.type,
    text: q.text,
    options: q.options,
    correctAnswer: q.correctAnswer,
    points: q.points ?? 1,
    difficulty: q.difficulty ?? 'medium',
    usesLatex: !!q.usesLatex,
  }));
  await Question.insertMany(docs);
  return NextResponse.json({ success: true, inserted: docs.length });
}
