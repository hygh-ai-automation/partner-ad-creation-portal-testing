import { GoogleGenAI } from "@google/genai";
import { GenerationRequest } from "../types";

// Define the model name as requested: nano banana pro -> gemini-3-pro-image-preview
const MODEL_NAME = 'gemini-3-pro-image-preview';

export const generateAd = async (request: GenerationRequest): Promise<string> => {
  try {
    // Note: We create the client inside the function to ensure we pick up the latest API key
    // if the user has just selected one via window.aistudio.openSelectKey()
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    let contents;
    
    // Construct the prompt based on mode
    // We combine the base prompt (platform style) with the user's specific input
    let fullPrompt = request.basePrompt;

    if (request.locationType) {
      fullPrompt += `\n\nIMPORTANT CONTEXT - BUSINESS TYPE: ${request.locationType}. The visual setting and objects should match a ${request.locationType}, not a generic kiosk if they differ.`;
    }

    fullPrompt += `\n\nAdditional details from partner: ${request.userPrompt}`;

    if (request.mode === 'product' && request.productImageBase64) {
      // Multimodal request: Image + Text
      // We strip the data prefix if present to get raw base64
      const base64Data = request.productImageBase64.replace(/^data:image\/\w+;base64,/, "");
      
      contents = {
        parts: [
          {
            text: fullPrompt
          },
          {
            inlineData: {
              mimeType: 'image/jpeg', // Assuming JPEG for simplicity from camera/upload
              data: base64Data
            }
          }
        ]
      };
    } else {
      // Text-only request
      contents = {
        parts: [
          {
            text: fullPrompt
          }
        ]
      };
    }

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: contents,
      config: {
        imageConfig: {
          aspectRatio: "9:16", // Strict requirement
          imageSize: "1K"      // Standard size
        }
      }
    });

    // Extract image from response
    // The response structure for images in Gemini usually contains inlineData in the parts
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      const parts = candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No image generated in response.");

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};