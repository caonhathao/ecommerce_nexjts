import { GoogleGenAI } from '@google/genai';
import { env } from '@/lib/env';
import { NextRequest, NextResponse } from 'next/server';

const genai = new GoogleGenAI({ apiKey: env.GOOGLE_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64String = Buffer.from(arrayBuffer).toString('base64');

    const prompt = `
    You are an image labeling system.
    
    Your task:
    - Identify the product shown in the image.
    - Return ONLY the shortest, simplest name possible.
    - Do NOT guess beyond what is clearly visible.
    - Do NOT improve or rephrase the label.
    - Do NOT generate marketing names or descriptions.
    - If the item is a keyboard → return "keyboard".
    - If the item is a coat → return "coat".
    - If the item is a mouse → return "mouse".
    - If text or brand is visible (e.g., "ek keyboard"), return it EXACTLY.
    - Maximum length: 1–3 words.
    - No sentences. No punctuation. No quotes.
    - Output language: English or Vietnamese (match the product text if visible, otherwise default to Vietnamese).
    
    Return ONLY the label:`;

    const result = await genai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: file.type,
                data: base64String,
              },
            },
          ],
        },
      ],
    });

    const text = result.text;

    if (!text) {
      throw new Error('Failed to identify product');
    }

    // Clean up text (remove newlines or extra spaces)
    const searchQuery = text.trim();

    return NextResponse.json({ query: searchQuery });
  } catch (error) {
    console.error('Image Analysis Error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze image' },
      { status: 500 }
    );
  }
}
