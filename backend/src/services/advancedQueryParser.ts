import Anthropic from "@anthropic-ai/sdk";

interface QueryIntent {
  type: 'definition' | 'usage' | 'pattern' | 'config' | 'error' | 'general';
  confidence: number;
  keywords: string[];
}

interface QueryAnalysis {
  intent: QueryIntent;
  semanticEmbedding?: number[];
  normalizedQuery: string;
}

export class AdvancedQueryParser {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic();
  }

  /**
   * Analyze query intent using Claude
   */
  async analyzeIntent(query: string): Promise<QueryIntent> {
    const message = await this.client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 256,
      messages: [
        {
          role: 'user',
          content: `Analyze this code search query and identify the user's intent. Respond with JSON only.
Query: "${query}"

Response format: {"type": "definition|usage|pattern|config|error|general", "confidence": 0-1, "keywords": []}`,
        },
      ],
    });

    try {
      const content = message.content[0];
      if (content.type === 'text') {
        const parsed = JSON.parse(content.text);
        return {
          type: parsed.type,
          confidence: parsed.confidence,
          keywords: parsed.keywords || [],
        };
      }
    } catch (e) {
      console.error('Failed to parse Claude response:', e);
    }

    return {
      type: 'general',
      confidence: 0.5,
      keywords: query.split(/\s+/),
    };
  }

  /**
   * Generate semantic embedding for query
   */
  async generateEmbedding(query: string): Promise<number[]> {
    // Placeholder for semantic embedding
    // In production, use OpenAI embeddings or similar
    const hash = this.simpleHash(query);
    return Array(384)
      .fill(0)
      .map((_, i) => Math.sin((hash + i) / 100));
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  /**
   * Normalize query for better matching
   */
  normalizeQuery(query: string): string {
    return query
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');
  }
}
