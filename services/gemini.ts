
import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
const genAI = new GoogleGenAI({ apiKey });

export const geminiService = {
  async generateSummary(text: string) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(`Summarize the following superhero news article into a catchy 2-sentence blurb for a mobile app home screen: ${text}`);
      return result.response.text();
    } catch (error) {
      console.error("Gemini summary error:", error);
      return "Unable to generate summary at this time.";
    }
  },

  async suggestRankings(category: string) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(`Suggest a Top 10 list for ${category} in 2024. Provide just the titles as a list.`);
      return result.response.text();
    } catch (error) {
      console.error("Gemini ranking error:", error);
      return "No suggestions available.";
    }
  },

  async generateImage(prompt: string) {
    try {
      // Note: As of the latest @google/genai SDK, Imagen 3 support might vary by region/API availability.
      // We use the specific imagen model name.
      const model = genAI.getGenerativeModel({ model: "imagen-3.0-generate-001" });

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      });

      const response = result.response;
      // Imagen usually returns the image in a specific format in the response
      // For the web SDK, this often comes as a base64 string or a blob depending on the implementation.
      // However, if the SDK doesn't directly support Imagen 3 yet in a simple way, 
      // we might need to use the REST API. But let's try the SDK first.

      // Based on typical Imagen 3 API responses:
      const candidate = response.candidates?.[0];
      const imagePart = candidate?.content?.parts?.find(part => part.inlineData?.mimeType?.startsWith('image/'));

      if (imagePart?.inlineData?.data) {
        return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
      }

      throw new Error("No image data found in response");
    } catch (error) {
      console.error("Gemini image generation error:", error);
      throw error;
    }
  }
};
