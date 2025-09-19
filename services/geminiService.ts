import { GoogleGenAI } from "@google/genai";
import type { UploadedFile } from '../types';
import type { Part } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const fileToPart = (file: UploadedFile): Part => {
  if (file.extractedText) {
    // For docx, pptx, etc., send the extracted text.
    return {
      text: `Content from file "${file.name}":\n\n${file.extractedText}`
    };
  }
  
  // For images, PDFs, etc., send the file data directly.
  return {
    inlineData: {
      mimeType: file.type,
      data: file.base64,
    },
  };
};

export const callGeminiStream = async (prompt: string, files: UploadedFile[] = []) => {
  try {
    const parts: Part[] = files.map(fileToPart);
    parts.push({ text: prompt });

    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: [{ parts }],
        config: {
          // Disable thinking for lower latency, as requested for faster responses.
          thinkingConfig: { thinkingBudget: 0 }
        }
    });

    return responseStream;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to get response from AI: ${error.message}`);
    }
    throw new Error("An unknown error occurred while contacting the AI.");
  }
};