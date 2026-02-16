import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyABOOss-EHUNjUdhdee9a-V1kHZloYLogo";
// const API_KEY = "AlzaSyABOOss-EHUNjUdhdee9a-V1kHZloYLogo"; // Test both if needed

async function listModels() {
    console.log("🔍 Fetching available models for key...");
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        const data = await response.json();
        if (data.error) {
            console.error("❌ API ERROR:", JSON.stringify(data.error, null, 2));
        } else {
            console.log("✅ Key is VALID!");
            console.log("Models found:", data.models?.length || 0);
            const imagenModels = data.models?.filter((m: any) => m.name.includes("imagen"));
            console.log("Imagen models available:", JSON.stringify(imagenModels, null, 2));
        }
    } catch (e) {
        console.error("❌ Fetch failed:", e);
    }
}

listModels();
