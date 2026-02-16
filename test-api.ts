import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyABOOss-EHUNjUdhdee9a-V1kHZloYLogo";
const genAI = new GoogleGenerativeAI(API_KEY);

async function testKey() {
    console.log("🧪 Starting API Diagnostic...");

    // Test 1: Gemini 1.5 Flash
    try {
        console.log("📝 Testing Gemini 1.5 Flash...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Say hello");
        console.log("✅ Gemini 1.5 Flash Response:", result.response.text());
    } catch (e: any) {
        console.error("❌ Gemini 1.5 Flash FAILED:");
        console.error(e.message || e);
        if (e.response) console.error(JSON.stringify(e.response, null, 2));
    }

    // Test 2: Imagen 3.0 (generate-001)
    try {
        console.log("🎨 Testing Imagen 3.0 (generate-001)...");
        const model = genAI.getGenerativeModel({ model: "imagen-3.0-generate-001" });
        const result = await model.generateContent("A simple red circle");
        const response = await result.response;
        console.log("✅ Imagen 3.0 (001) Success!");
    } catch (e: any) {
        console.error("❌ Imagen 3.0 (001) FAILED:");
        console.error(e.message || e);
    }

    // Test 3: Imagen 3.0 (Capability)
    try {
        console.log("🎨 Testing Imagen 3.0 (capability-001)...");
        const model = genAI.getGenerativeModel({ model: "imagen-3.0-capability-001" });
        const result = await model.generateContent("A simple red circle");
        const response = await result.response;
        console.log("✅ Imagen 3.0 (capability-001) Success!");
    } catch (e: any) {
        console.error("❌ Imagen 3.0 (capability-001) FAILED:");
        console.error(e.message || e);
    }
}

testKey().catch(console.error);
