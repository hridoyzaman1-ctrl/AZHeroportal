import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_API_KEY);

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

  async suggestRankings(currentComics: any[]) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(`Given these comics: ${JSON.stringify(currentComics)}, suggest a top 10 ranking based on popularity and quality. Return only a JSON array of IDs.`);
      return JSON.parse(result.response.text());
    } catch (error) {
      console.error("Gemini ranking error:", error);
      return [];
    }
  },

  async generateImage(prompt: string) {
    try {
      console.log("🎨 Starting image generation for prompt:", prompt);
      // For Imagen in AI Studio, we use the specific model name.
      const model = genAI.getGenerativeModel({ model: "imagen-3.0-generate-001" });

      const result = await model.generateContent(prompt);
      const response = result.response;

      console.log("🎨 API Response received:", JSON.stringify(response, null, 2));

      // In @google/generative-ai, image responses come as parts with inlineData
      const candidate = response.candidates?.[0];
      const imagePart = candidate?.content?.parts?.find(part => part.inlineData?.mimeType?.startsWith('image/'));

      if (imagePart?.inlineData?.data) {
        console.log("🎨 Image data found in response!");
        return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
      }

      console.error("🎨 No image data in response candidate:", candidate);
      throw new Error("No image data found in response");
    } catch (error: any) {
      console.error("Gemini image generation error detail:", error);
      throw error;
    }
  }
};
