import { GoogleGenAI } from '@google/genai';
import type { AIProvider, AIRequest, AIResponse, AIProviderName } from '../types';

export interface GeminiAdapterDeps {
  apiKey?: string;
  candidateModels?: string[];
}

export class GeminiAdapter implements AIProvider {
  readonly name: AIProviderName = 'gemini';
  readonly model: string;
  private client: GoogleGenAI | null = null;
  private defaultModels: string[];

  constructor(deps?: GeminiAdapterDeps) {
    this.model = 'gemini-2.0-flash';
    this.defaultModels = deps?.candidateModels || ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-latest'];

    const apiKey = deps?.apiKey;
    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      this.client = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'isekai-rpg-backend',
          },
        },
      });
    }
  }

  isAvailable(): boolean {
    return this.client !== null;
  }

  async generateStructured<T>(request: AIRequest<T>): Promise<AIResponse<T>> {
    if (!this.client) {
      throw new Error('Gemini client not initialized - missing or invalid API key');
    }

    const modelsToTry = request.modelName ? [request.modelName] : this.defaultModels;

    let lastError: unknown = null;

    for (const modelName of modelsToTry) {
      try {
        const response = await this.client.models.generateContent({
          model: modelName,
          contents: request.prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: request.schema,
            temperature: request.temperature ?? 0.8,
            maxOutputTokens: request.maxTokens,
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text) as T;
          const validated = request.validator
            ? (request.validator as (data: unknown) => T)(parsed)
            : parsed;

          const usage = response.usageMetadata
            ? {
                inputTokens: response.usageMetadata.promptTokenCount || 0,
                outputTokens: response.usageMetadata.candidatesTokenCount || 0,
                totalTokens: response.usageMetadata.totalTokenCount || 0,
              }
            : undefined;

          return {
            data: validated,
            usage,
            model: modelName,
            promptVersion: request.promptVersion || '0.0.0',
          };
        }

        throw new Error('Empty response from Gemini');
      } catch (err: unknown) {
        lastError = err;
        const message = err instanceof Error ? err.message : String(err);
        console.warn(`Gemini API error on model ${modelName}:`, message);
      }
    }

    throw new Error(
      `All Gemini models failed. Last error: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
    );
  }
}
