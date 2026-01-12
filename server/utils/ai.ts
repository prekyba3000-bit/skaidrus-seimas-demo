import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { logger } from "./logger";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

let genAI: GoogleGenerativeAI | null = null;

if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
} else {
  console.warn("GEMINI_API_KEY is not set. AI features will be disabled.");
}

export interface BillAnalysis {
  summary: string;
  bulletPoints: string[];
}

export async function summarizeBill(
  title: string,
  description: string,
  content: string = ""
): Promise<BillAnalysis | null> {
  if (!genAI) {
    return null;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const safeContent = content
      ? content.substring(0, 20000)
      : "No full text available.";

    const prompt = `
    Analyze the following legislative bill details and provide a concise summary and key bullet points in Lithuanian.
    
    Title: ${title}
    Description: ${description || "N/A"}
    Full Text Snippet: ${safeContent}

    Output strictly valid JSON with the following structure:
    {
      "summary": "A 2-3 sentence summary explanations for the general public (Lithuanian).",
      "bulletPoints": ["Key point 1", "Key point 2", "Key point 3"]
    }
    
    Ensure the summary is neutral and informative. Do not use markdown formatting like \`\`\`json. Just raw JSON.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up markdown code blocks if present
    text = text.replace(/```json\n?|\n?```/g, "").trim();

    const jsonResult = JSON.parse(text);
    return {
      summary: jsonResult.summary,
      bulletPoints: jsonResult.bulletPoints || [],
    };
  } catch (error) {
    logger.error({ err: error }, "AI Summarization failed");
    return null;
  }
}

export interface QuizQuestion {
  question: string;
  category: string;
}

export async function generateQuizQuestion(
  title: string,
  summary: string
): Promise<QuizQuestion | null> {
  if (!genAI) return null;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    Based on the following bill, generate a simple "Yes/No" question for a citizen to decide if they agree with the bill.
    Also provide a short category (1-2 words).

    Bill Title: ${title}
    Bill Summary: ${summary}

    Output strictly valid JSON:
    {
      "question": "Should we...?",
      "category": "Education" 
    }
    Language: Lithuanian.
    Do not use markdown formatting like \`\`\`json. Just raw JSON.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    text = text.replace(/```json\n?|\n?```/g, "").trim();

    return JSON.parse(text) as QuizQuestion;
  } catch (error) {
    logger.error({ err: error }, "AI Quiz Generation failed");
    return null;
  }
}
