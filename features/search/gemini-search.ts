import { GoogleGenAI } from '@google/genai';
import { env } from '@/lib/env';

const genai = new GoogleGenAI({ apiKey: env.GOOGLE_API_KEY });

export interface AISearchResult {
  query: string;
  minPrice?: number | null;
  maxPrice?: number | null;
  category?: string | null;
  sortBy?: 'price' | 'rating' | 'createdAt' | 'name' | null;
  sortOrder?: 'asc' | 'desc' | null;
}

export async function parseSearchQueryWithAI(
  userQuery: string,
  categories: string[]
): Promise<AISearchResult | null> {
  const searchSchema = {
    type: 'OBJECT',
    properties: {
      query: {
        type: 'STRING',
        description:
          "The cleaned search keywords, removing 'show me', 'looking for', etc.",
      },
      minPrice: {
        type: 'NUMBER',
        description: 'The minimum price if specified, otherwise null.',
        nullable: true,
      },
      maxPrice: {
        type: 'NUMBER',
        description: 'The maximum price if specified, otherwise null.',
        nullable: true,
      },
      category: {
        type: 'STRING',
        description:
          'The exact category slug chosen from the provided context list. If no match found, null.',
        nullable: true,
      },
      sortBy: {
        type: 'STRING',
        description: 'Sort criteria based on user intent.',
        nullable: true,
        enum: ['price', 'rating', 'createdAt', 'name'],
      },
      sortOrder: {
        type: 'STRING',
        description: 'Sort order.',
        nullable: true,
        enum: ['asc', 'desc'],
      },
    },
    required: ['query'],
  };

  const prompt = `
    You are an e-commerce search assistant.
    
    CONTEXT - AVAILABLE CATEGORY SLUGS:
    [${categories.join(', ')}]

    INSTRUCTIONS:
    1. Analyze the User Query: "${userQuery}"
    2. Extract the search intent into the defined JSON structure.
    3. For 'category', you MUST pick exactly one slug from the available list above that best matches the item. If the user query is generic or doesn't match a category, return null.
  `;

  try {
    const result = await genai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: searchSchema,
      },
    });

    const text = result.text;

    if (!text) return null;
    return JSON.parse(text) as AISearchResult;
  } catch (error) {
    console.error('Gemini SDK Error:', error);
    return null;
  }
}
