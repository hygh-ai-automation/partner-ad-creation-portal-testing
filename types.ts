export type GenerationMode = 'text' | 'product';

export interface AdSettings {
  basePrompt: string;
}

export interface GeneratedAd {
  imageUrl: string;
  promptUsed: string;
  timestamp: number;
}

export interface GenerationRequest {
  mode: GenerationMode;
  userPrompt: string;
  basePrompt: string;
  locationType?: string;
  productImageBase64?: string;
}