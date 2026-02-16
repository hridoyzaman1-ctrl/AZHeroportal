import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GOOGLE_AI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY || "");

console.log("🕵️ [diag] API Key present:", !!API_KEY);
if (API_KEY) {
  console.log("🕵️ [diag] API Key metadata: length=" + API_KEY.length + ", prefix=" + API_KEY.slice(0, 7) + "..., suffix=..." + API_KEY.slice(-4));
} else {
  console.warn("🕵️ [diag] WARNING: VITE_GOOGLE_AI_API_KEY is UNDEFINED in this build!");
}

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
      console.log("🎨 [service] Starting image generation (RAW FETCH MODE)");
      console.log("🎨 [service] API Key used (end):", API_KEY?.slice(-8));

      // Try 002 first if user is on paid tier, fallback to 001
      const modelId = "imagen-3.0-generate-001";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${API_KEY}`;

      const body = {
        contents: [{ parts: [{ text: prompt }] }],
        safetySettings: safetySettings.map(s => ({
          category: s.category,
          threshold: s.threshold
        }))
      };

      console.log("🎨 [service] Calling Google API via fetch...");
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      console.log("🎨 [service] Raw HTTP Status:", response.status, response.statusText);

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        console.error("🎨 [service] RAW API ERROR JSON:", JSON.stringify(errorJson, null, 2));

        if (errorJson.error?.message?.includes("API key not valid")) {
          throw new Error(`GOOGLE REJECTED THE KEY: ${errorJson.error.message}`);
        }
        throw new Error(errorJson.error?.message || `API Error ${response.status}`);
      }

      const data = await response.json();
      console.log("🎨 [service] Full JSON Success Response:", JSON.stringify(data, null, 2));

      const candidate = data.candidates?.[0];
      if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
        throw new Error(`Generation failed: ${candidate.finishReason}`);
      }

      const imagePart = candidate?.content?.parts?.find((p: any) => p.inlineData?.mimeType?.startsWith('image/'));

      if (imagePart?.inlineData?.data) {
        console.log("🎨 [service] SUCCESS! Image data found.");
        return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
      }

      throw new Error("No image data in response candidates");
    } catch (error: any) {
      console.error("🎨 [service] Image generation error summary:", error.message || error);
      throw error;
    }
  }
};
