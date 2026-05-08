import { GoogleGenAI, Type } from "@google/genai";
import { Word } from "../types";

export interface SuggestedWord {
  word: string;
  ipa: string;
  meaning: string;
  example: string;
  type: string;
  notes: string;
}

export async function suggestDailyWord(apiKey: string | undefined, existingWords: string[]): Promise<SuggestedWord> {
  const finalApiKey = apiKey || process.env.GEMINI_API_KEY;
  if (!finalApiKey) {
    throw new Error("Missing Gemini API Key");
  }

  const ai = new GoogleGenAI({ apiKey: finalApiKey });

  const prompt = `You are a helpful English teacher. 
The user is learning English vocabulary.
Please suggest ONE useful, common, or interesting new English vocabulary word that is NOT in the following list.
The suggested word MUST NOT be any of these: ${existingWords.join(", ")}

Return the response in JSON format.
Notes should be a small tip about how to remember this word or a fun fact.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          word: {
            type: Type.STRING,
            description: "The English word.",
          },
          ipa: {
            type: Type.STRING,
            description: "The IPA pronunciation of the word, e.g., /həˈləʊ/.",
          },
          meaning: {
            type: Type.STRING,
            description: "Vietnamese meaning of the word.",
          },
          example: {
            type: Type.STRING,
            description: "An example sentence in English using the word.",
          },
          type: {
            type: Type.STRING,
            description: "The type of the word, e.g., noun, verb, adjective.",
          },
          notes: {
            type: Type.STRING,
            description: "A small note, hint, or fun fact in Vietnamese to help remember the word.",
          },
        },
        required: ["word", "ipa", "meaning", "example", "type", "notes"],
      },
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response from AI");
  }

  return JSON.parse(text.trim()) as SuggestedWord;
}
