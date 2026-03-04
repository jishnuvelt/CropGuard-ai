import { GoogleGenAI, Type, Schema } from "@google/genai";
import { DiagnosisResponse } from "../types";

// Safely retrieve API key to prevent crashes in browser environments where process is undefined
const getApiKey = (): string => {
  // Check if process is defined (Node/Webpack/standard env injection)
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    return process.env.API_KEY;
  }
  // Fallback or empty string if not found
  return '';
};

const apiKey = getApiKey();
const ai = new GoogleGenAI({ apiKey });

// Schema for the diagnosis response
const diagnosisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    isPlant: { type: Type.BOOLEAN, description: "Whether the image contains a plant or crop." },
    plantName: { type: Type.STRING, description: "The common name of the plant identified." },
    condition: { 
      type: Type.STRING, 
      enum: ["Healthy", "Diseased", "Pest Infestation", "Nutrient Deficiency", "Unknown"],
      description: "The overall health condition of the plant."
    },
    diseaseName: { type: Type.STRING, description: "Specific name of the disease or pest if applicable." },
    scientificName: { type: Type.STRING, description: "The scientific or latin name of the pathogen or pest (e.g. Phytophthora infestans)." },
    severity: { 
      type: Type.STRING, 
      enum: ["Low", "Moderate", "High"], 
      description: "The potential impact on yield if left untreated." 
    },
    favorableConditions: { type: Type.STRING, description: "Environmental conditions that favor the disease (e.g. High humidity, cool temperatures)." },
    spreadMethod: { type: Type.STRING, description: "How the disease spreads (e.g. Wind, water, soil-borne, vectors)." },
    confidence: { type: Type.NUMBER, description: "Confidence score between 0 and 1." },
    description: { type: Type.STRING, description: "A brief, easy-to-understand explanation of the condition." },
    symptoms: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "List of visible symptoms identified in the image."
    },
    treatments: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "List of recommended treatments or cures."
    },
    preventativeMeasures: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "List of measures to prevent future occurrences."
    }
  },
  required: ["isPlant", "plantName", "condition", "description", "symptoms", "treatments", "preventativeMeasures", "confidence"]
};

export const analyzePlantImage = async (base64Image: string, mimeType: string): Promise<DiagnosisResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image
            }
          },
          {
            text: "Analyze this image for plant health. Identify the plant and any diseases, pests, or deficiencies. Act as an expert plant pathologist. If the image is not a plant, set isPlant to false. If a disease is found, populate the scientific details and spread methods."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: diagnosisSchema,
        systemInstruction: "You are an expert agricultural scientist. Provide accurate, practical advice for farmers. Be concise but thorough. If the plant is healthy, you can omit disease-specific fields like scientificName or spreadMethod."
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    // Clean up potential markdown code blocks to ensure valid JSON parsing
    const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
    
    return JSON.parse(cleanText) as DiagnosisResponse;
  } catch (error) {
    console.error("Error analyzing plant:", error);
    throw error;
  }
};

export const createExpertChat = () => {
  return ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: "You are Dr. Green, a senior agricultural scientist and plant pathologist. You help farmers identify plant diseases and provide sustainable, practical farming advice. You are friendly, professional, and knowledgeable. Keep answers concise and actionable.",
    }
  });
};

// Helper to convert File to Base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};