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
          "The cleaned search keywords in the original language, removing polite phrases like 'show me', 'tìm cho tôi', etc.",
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
    You are a smart bilingual e-commerce search assistant (English & Vietnamese).
    
    CONTEXT - AVAILABLE CATEGORY SLUGS:
    [${categories.join(', ')}]

    INSTRUCTIONS:
    1. Analyze the User Query: "${userQuery}" (Detect language: English or Vietnamese).
    2. Extract search intent into the JSON structure.

    3. QUERY CLEANING:
       - English: Remove "show me", "looking for", "buy", "cheap", "best".
       - Vietnamese: Remove "tìm", "cho tôi", "muốn mua", "xem", "cần tìm", "giá rẻ", "xịn".
       - Keep the core product keyword (e.g., "iphone 15", "giày thể thao").

    4. CATEGORY MAPPING:
       - Understand Vietnamese category terms and map them to the closest English slug provided in the context.
       - Example: "Điện thoại" -> slug "smartphones".
       - Example: "Đồ gia dụng" -> slug "home-appliances".
       - If no semantic match exists, return null for category.

    5. PRICE PARSING (Vietnamese currency logic):
       - "k" = thousand (e.g., "500k" = 500000).
       - "tr", "triệu", "m" = million (e.g., "20tr", "20 triệu" = 20000000).
       - "dưới", "under" -> maxPrice.
       - "trên", "over" -> minPrice.

    6. SORTING INTENT:
       - "giá rẻ", "thấp nhất", "cheapest" -> sortBy: "price", sortOrder: "asc".
       - "xịn nhất", "tốt nhất", "best", "top rated" -> sortBy: "rating", sortOrder: "desc".
       - "mới nhất", "newest" -> sortBy: "createdAt", sortOrder: "desc".
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
