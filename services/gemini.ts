const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

export const geminiService = {
  async generateSummary(text: string) {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://azheroportal.web.app",
          "X-Title": "AZHero Portal",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "anthropic/claude-3-haiku",
          "messages": [
            {
              "role": "user",
              "content": `Summarize the following superhero news article into a catchy 2-sentence blurb for a mobile app home screen: ${text}`
            }
          ]
        })
      });

      const data = await response.json();
      return data.choices?.[0]?.message?.content || "Unable to generate summary.";
    } catch (error) {
      console.error("OpenRouter summary error:", error);
      return "Unable to generate summary at this time.";
    }
  },

  async suggestRankings(currentComics: any[]) {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://azheroportal.web.app",
          "X-Title": "AZHero Portal",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "anthropic/claude-3-haiku",
          "messages": [
            {
              "role": "user",
              "content": `Given these comics: ${JSON.stringify(currentComics)}, suggest a top 10 ranking based on popularity and quality. Return only a JSON array of IDs.`
            }
          ],
          "response_format": { "type": "json_object" }
        })
      });

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      return JSON.parse(content);
    } catch (error) {
      console.error("OpenRouter ranking error:", error);
      return [];
    }
  },

  async generateImage(prompt: string) {
    try {
      console.log("🎨 [service] Starting image generation via OpenRouter for prompt:", prompt);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://azheroportal.web.app",
          "X-Title": "AZHero Portal",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "black-forest-labs/flux-1-schnell",
          "messages": [
            {
              "role": "user",
              "content": prompt
            }
          ],
          "modalities": ["image"]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("🎨 [service] OpenRouter API Error:", errorData);
        throw new Error(errorData.error?.message || `HTTP Error ${response.status}`);
      }

      const data = await response.json();
      console.log("🎨 [service] OpenRouter Response received");

      // OpenRouter returns images in choices[0].message.content or as parts
      // According to docs, image modalities come back as base64 in content or specific parts
      const choice = data.choices?.[0];
      const imagePart = choice?.message?.content?.parts?.find((p: any) => p.type === 'image') ||
        choice?.message?.parts?.find((p: any) => p.type === 'image');

      if (imagePart?.image?.data) {
        return `data:image/png;base64,${imagePart.image.data}`;
      }

      // Fallback for some providers who might return it directly in content
      if (typeof choice?.message?.content === 'string' && choice.message.content.startsWith('data:image')) {
        return choice.message.content;
      }

      console.error("🎨 [service] No image data in OpenRouter response:", JSON.stringify(data, null, 2));
      throw new Error("No image data found in response");
    } catch (error: any) {
      console.error("🎨 [service] OpenRouter Image generation error:", error.message || error);
      throw error;
    }
  }
};
