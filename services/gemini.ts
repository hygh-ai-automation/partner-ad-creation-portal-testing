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

    // Build parts array
    const parts: any[] = [{ text: fullPrompt }];

    if (request.mode === 'product' && request.productImageBase64) {
      // Product mode: add product image
      const base64Data = request.productImageBase64.replace(/^data:image\/\w+;base64,/, "");
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Data
        }
      });
    }

    // Add optional reference images (logo and spätibild)
    if (request.logoImageBase64) {
      const logoData = request.logoImageBase64.replace(/^data:image\/\w+;base64,/, "");
      parts[0].text += "\n\nREFERENCE - LOGO: The following image is the business logo. Incorporate it naturally into the ad design.";
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: logoData
        }
      });
    }

    if (request.spatiImageBase64) {
      const spatiData = request.spatiImageBase64.replace(/^data:image\/\w+;base64,/, "");
      parts[0].text += "\n\nREFERENCE - STORE PHOTO: The following image shows the actual store/location. Use it as visual reference for the style and atmosphere.";
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: spatiData
        }
      });
    }

    contents = { parts };

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