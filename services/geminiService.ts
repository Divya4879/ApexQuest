import { GoogleGenAI } from "@google/genai";
import { Post, User, Role } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  // This is a fallback for development if the API key isn't set.
  // In a real production environment, this should be handled more gracefully.
  console.warn("VITE_GEMINI_API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const analyzePostWithGemini = async (post: Post, question: string, askingUser: User): Promise<string> => {
  if (!API_KEY) {
    return "API key not configured. Please set the API_KEY environment variable.";
  }
  try {
    const model = 'gemini-2.5-flash';

    let systemInstruction = `You are a helpful social media assistant. Your task is to analyze a user's post and its comments to answer their question.`;
    
    // Admins and moderators get a more powerful, detailed prompt.
    if (askingUser.role === Role.ADMIN || askingUser.role === Role.MODERATOR) {
      systemInstruction = `You are an advanced social media analyst providing insights to a platform ${askingUser.role}. Your task is to analyze a post and its comments with a focus on community health and moderation.`;
    }

    const commentsString = post.comments.map(c => `- ${c.author.name}: "${c.text}"`).join('\n');
    const prompt = `
      **Post Content:**
      "${post.content}"
      - Posted by: ${post.author.name}
      - Likes: ${post.likes.length}
      
      **Comments on the post:**
      ${commentsString || "No comments yet."}
      
      **${askingUser.role}'s Question:**
      "${question}"
      
      Please provide a concise and helpful answer based *only* on the provided information.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
      }
    });
    
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Sorry, I encountered an error trying to analyze the post. Please try again later.";
  }
};
