import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// HARDCODED KEY FOR DEBUGGING - ENVIRONMENT VARIABLES ARE SUSPECT
const API_KEY = "AIzaSyABOOss-EHUNjUdhdee9a-V1kHZloYLogo";
const genAI = new GoogleGenerativeAI(API_KEY);

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

export const geminiService = {
  async generateSummary(text: string) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", safetySettings });
      const result = await model.generateContent(`Summarize: ${text}`);
      return result.response.text();
    } catch (error) {
      console.error("Gemini summary error:", error);
      return "Unable to generate summary.";
    }
  },

  async suggestRankings(currentComics: any[]) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", safetySettings });
      const result = await model.generateContent(`Rank these: ${JSON.stringify(currentComics)}. JSON array only.`);
      return JSON.parse(result.response.text());
    } catch (error) {
      console.error("Gemini ranking error:", error);
      return [];
    }
  },

  async generateImage(prompt: string) {
    try {
      console.log("🎨 [service] Starting image generation (SDK + Hardcoded Key)");
      console.log("🎨 [service] Key ending in:", API_KEY.slice(-4));

      const model = genAI.getGenerativeModel({
        model: "imagen-3.0-generate-001",
        safetySettings
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;

      console.log("🎨 [service] API Response received");

      if (response.promptFeedback?.blockReason) {
        throw new Error(`Blocked: ${response.promptFeedback.blockReason}`);
      }

      const candidate = response.candidates?.[0];
      if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
        throw new Error(`Failed: ${candidate.finishReason}`);
      }

      const imagePart = candidate?.content?.parts?.find(p => p.inlineData?.mimeType?.startsWith('image/'));

      if (imagePart?.inlineData?.data) {
        console.log("🎨 [service] Success!");
        return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
      }

      throw new Error("No image data found");
    } catch (error: any) {
      console.error("🎨 [service] Error:", error);
      throw error;
    }
  }
};
