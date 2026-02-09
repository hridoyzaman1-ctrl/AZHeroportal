
import { GoogleGenAI } from "@google/genai";

// Fix: Initialize the GoogleGenAI client with the API key from environment variables as a named parameter
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  async generateSummary(text: string) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Summarize the following superhero news article into a catchy 2-sentence blurb for a mobile app home screen: ${text}`,
      });
      // Fix: Access the generated text using the .text property directly
      return response.text;
    } catch (error) {
      console.error("Gemini summary error:", error);
      return "Unable to generate summary at this time.";
    }
  },

  async suggestRankings(category: string) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Suggest a Top 10 list for ${category} in 2024. Provide just the titles as a list.`,
      });
      // Fix: Access the generated text using the .text property directly
      return response.text;
    } catch (error) {
      console.error("Gemini ranking error:", error);
      return "No suggestions available.";
    }
  }
};
