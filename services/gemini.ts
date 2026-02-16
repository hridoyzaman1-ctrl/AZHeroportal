import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GOOGLE_AI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

export const geminiService = {
  async generateSummary(text: string) {
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        safetySettings
      });
      const result = await model.generateContent(`Summarize the following superhero news article into a catchy 2-sentence blurb for a mobile app home screen: ${text}`);
      return result.response.text();
    } catch (error) {
      console.error("Gemini summary error:", error);
      return "Unable to generate summary at this time.";
    }
  },

  async suggestRankings(currentComics: any[]) {
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        safetySettings
      });
      const result = await model.generateContent(`Given these comics: ${JSON.stringify(currentComics)}, suggest a top 10 ranking based on popularity and quality. Return only a JSON array of IDs.`);
      return JSON.parse(result.response.text());
    } catch (error) {
      console.error("Gemini ranking error:", error);
      return [];
    }
  },

  async generateImage(prompt: string) {
    try {
      console.log("🎨 [service] Starting image generation via Google AI Studio");
      console.log("🎨 [service] Prompt:", prompt);
      console.log("🎨 [service] API Key presence check:", !!API_KEY);

      const model = genAI.getGenerativeModel({
        model: "imagen-3.0-generate-001",
        safetySettings
      });

      console.log("🎨 [service] Model initialized, calling generateContent...");
      const result = await model.generateContent(prompt).catch(e => {
        console.error("🎨 [service] generateContent call failed immediately:", e);
        console.error("🎨 [service] Error details:", JSON.stringify(e, Object.getOwnPropertyNames(e), 2));
        throw e;
      });

      const response = await result.response;
      console.log("🎨 [service] API Response received successfully");
      console.log("🎨 [service] Raw Response:", JSON.stringify(response, null, 2));

      if (response.promptFeedback?.blockReason) {
        console.error("🎨 [service] Prompt blocked by safety filters:", response.promptFeedback.blockReason);
        console.error("🎨 [service] Feedback:", JSON.stringify(response.promptFeedback, null, 2));
        throw new Error(`Generation blocked by safety filters: ${response.promptFeedback.blockReason}`);
      }

      const candidate = response.candidates?.[0];
      if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
        console.error("🎨 [service] Generation failed to finish correctly:", candidate.finishReason);
        console.error("🎨 [service] Candidate info:", JSON.stringify(candidate, null, 2));
        throw new Error(`Generation failed: ${candidate.finishReason}`);
      }

      const imagePart = candidate?.content?.parts?.find(part =>
        part.inlineData?.mimeType?.startsWith('image/')
      );

      if (imagePart?.inlineData?.data) {
        console.log("🎨 [service] Image data found in response!");
        return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
      }

      console.error("🎨 [service] No image data in response candidate:", JSON.stringify(candidate, null, 2));
      throw new Error("No image data found in response");
    } catch (error: any) {
      console.error("🎨 [service] Image generation error summary:", error.message || error);
      console.error("🎨 [service] FULL ERROR OBJECT:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      throw error;
    }
  }
};
