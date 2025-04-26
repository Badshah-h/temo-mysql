import axios from "axios";
import { Template } from "../types";

interface AIServiceConfig {
  apiKey: string;
  endpoint: string;
  modelName: string;
}

export class AIService {
  private config: AIServiceConfig;

  constructor(config: AIServiceConfig) {
    this.config = config;
  }

  /**
   * Process a query using an AI model
   */
  async processQuery(
    template: Template,
    query: string,
    variables: Record<string, any> = {},
  ): Promise<{
    content: string;
    usage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  }> {
    try {
      // Replace template variables
      let prompt = template.content;

      // Replace {{query}} with the actual query
      prompt = prompt.replace(/{{query}}/g, query);

      // Replace other variables
      Object.entries(variables).forEach(([key, value]) => {
        prompt = prompt.replace(new RegExp(`{{${key}}}`, "g"), String(value));
      });

      // Make API request to AI service
      const response = await axios.post(
        this.config.endpoint,
        {
          model: this.config.modelName,
          messages: [{ role: "system", content: prompt }],
          temperature: 0.7,
          max_tokens: 1000,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.config.apiKey}`,
          },
        },
      );

      // Extract response content and usage statistics
      return {
        content: response.data.choices[0].message.content,
        usage: {
          promptTokens: response.data.usage.prompt_tokens,
          completionTokens: response.data.usage.completion_tokens,
          totalTokens: response.data.usage.total_tokens,
        },
      };
    } catch (error) {
      console.error("Error processing AI query:", error);
      throw new Error("Failed to process query with AI service");
    }
  }
}

// Create singleton instance with environment variables
export const aiService = new AIService({
  apiKey: process.env.AI_API_KEY || "",
  endpoint:
    process.env.AI_ENDPOINT || "https://api.openai.com/v1/chat/completions",
  modelName: process.env.AI_MODEL || "gpt-3.5-turbo",
});
