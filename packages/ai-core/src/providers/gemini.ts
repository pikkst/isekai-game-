import { GoogleGenAI, Type } from '@google/genai';
import type { AIProvider, AIRequest, AIResponse, AIProviderName } from '../types';
import type { AISchemaDefinition, AISchemaProperty } from '../schema';

export interface GeminiAdapterDeps {
  apiKey?: string;
  candidateModels?: string[];
}

function translateSchema(prop: AISchemaProperty): unknown {
  const result: Record<string, unknown> = {};

  if (prop.description !== undefined) result.description = prop.description;
  if (prop.enum !== undefined) result.enum = prop.enum;

  const typeMap: Record<string, string> = {
    object: Type.OBJECT,
    string: Type.STRING,
    integer: Type.INTEGER,
    number: Type.NUMBER,
    boolean: Type.BOOLEAN,
    array: Type.ARRAY,
  };

  if (prop.type && typeMap[prop.type]) {
    result.type = typeMap[prop.type];
  }

  if (prop.items !== undefined) {
    result.items = translateSchema(prop.items);
  }

  if (prop.properties !== undefined) {
    const properties: Record<string, unknown> = {};
    for (const [key, subProp] of Object.entries(prop.properties)) {
      properties[key] = translateSchema(subProp);
    }
    result.properties = properties;
    if (prop.required) {
      result.required = prop.required;
    }
  }

  return result;
}

function translateSchemaDefinition(schema: AISchemaDefinition): Record<string, unknown> {
  const result: Record<string, unknown> = {
    type: Type.OBJECT,
  };

  if (schema.description !== undefined) result.description = schema.description;
  const properties: Record<string, unknown> = {};
  for (const [key, prop] of Object.entries(schema.properties)) {
    properties[key] = translateSchema(prop);
  }
  result.properties = properties;
  if (schema.required && schema.required.length > 0) {
    result.required = schema.required;
  }

  return result;
}

export class GeminiAdapter implements AIProvider {
  readonly name: AIProviderName = 'gemini';
  readonly model: string;
  private client: GoogleGenAI | null = null;
  private defaultModels: string[];

  constructor(deps?: GeminiAdapterDeps) {
    this.model = 'gemini-3.6-flash';
    this.defaultModels = deps?.candidateModels || ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.5-flash-lite'];

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
        const schema = request.schema
          ? translateSchemaDefinition(request.schema as AISchemaDefinition)
          : undefined;

        const response = await this.client.models.generateContent({
          model: modelName,
          contents: request.prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: schema,
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
