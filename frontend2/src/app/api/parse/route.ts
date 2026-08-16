// src/app/api/parse/route.ts
import { NextResponse } from 'next/server';
import { extractRubricFromImages } from '@/lib/ai';
// You will need a library like pdf2pic or pdfjs-dist to convert PDF to images in Node.js.
// For now, let's assume the frontend sends Base64 images directly.

export async function POST(req: Request) {
  try {
    const { images } = await req.json(); // Array of base64 strings
    
    if (!images || images.length === 0) {
      return NextResponse.json({ error: "No images provided" }, { status: 400 });
    }

    const rubricData = await extractRubricFromImages(images);
    return NextResponse.json(rubricData);

  } catch (error) {
    console.error("Parse Error:", error);
    return NextResponse.json({ error: "Failed to parse rubric" }, { status: 500 });
  }
}