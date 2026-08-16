// src/app/api/suggest-score/route.ts
import { NextResponse } from 'next/server';
import { gradeStudentAnswer } from '@/lib/ai';

export async function POST(req: Request) {
  try {
    const { rubric, studentText } = await req.json();
    
    if (!rubric || !studentText) {
      return NextResponse.json({ error: "Missing rubric or student text" }, { status: 400 });
    }

    const gradingResult = await gradeStudentAnswer(rubric, studentText);
    return NextResponse.json(gradingResult);

  } catch (error) {
    console.error("Grading Error:", error);
    return NextResponse.json({ error: "Failed to grade answer" }, { status: 500 });
  }
}