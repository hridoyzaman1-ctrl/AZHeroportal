import * as genai from '@google/genai';
import { GoogleGenAI } from '@google/genai';
const keys = Object.keys(genai).sort();
console.log('Is Client exported?', keys.includes('Client'));
if (genai.Client) {
    const c = new genai.Client({ apiKey: 'test' });
    console.log('Client instance properties:', Object.keys(c));
    if (c.models) {
        console.log('Models property exists');
        // In some GenAI SDKs, models are accessed via c.models.generateContent
    }
}
const genAI = new GoogleGenAI({ apiKey: 'test' });
console.log('GoogleGenAI instance properties:', Object.keys(genAI));
if (genAI.models) {
    console.log('models property exists');
    console.log('models methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(genAI.models)));
} else {
    console.log('models property does NOT exist');
    console.log('genAI methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(genAI)));
}
// Check if CreateGoogleGenerativeAI exists
console.log('Is createGoogleGenerativeAI exported?', keys.includes('createGoogleGenerativeAI'));
