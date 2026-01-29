import { GoogleGenAI } from "@google/genai";

// Initialize Gemini client
// Note: API Key must be set in environment variables as REACT_APP_API_KEY or provided via Vite config
// For this prototype, we assume process.env.API_KEY is available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateCertificateInsight = async (
  studentName: string,
  certId: string,
  contractAddress: string
): Promise<string> => {
  try {
    if (!process.env.API_KEY) {
      return "AI Insights unavailable: Missing API Key.";
    }

    const model = 'gemini-3-flash-preview';
    const prompt = `
      You are a blockchain expert assistant for a University.
      A certificate has been verified on the Ethereum blockchain.
      
      Details:
      - Student Name: ${studentName}
      - Certificate ID: ${certId}
      - Contract: ${contractAddress}

      Please write a short, professional, and congratulatory paragraph explaining why this digital record is secure and immutable. 
      Keep it under 60 words. Emphasize the "trustless" nature of the verification.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Verified securely on Ethereum.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Verified on Ethereum. (AI Insight unavailable)";
  }
};

export const generateIdSuggestion = async (existingIds: string[]): Promise<string> => {
    // This is a mock function to show potential AI usage for ID generation
    // In reality, smart contracts usually handle auto-incrementing IDs or UUIDs.
    return `CERT-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`;
}