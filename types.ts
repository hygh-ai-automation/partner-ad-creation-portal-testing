export type GenerationMode = 'text' | 'product';

export interface SavedPrompt {
  id: string;
  name: string;
  prompt: string;
}

export interface AdSettings {
  basePrompt: string;
  savedPrompts: SavedPrompt[];
  activePromptId: string | null;
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
  logoImageBase64?: string;
  spatiImageBase64?: string;
}