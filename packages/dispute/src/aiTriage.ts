import { createHash } from 'crypto';
import { z } from 'zod';
import { useState, useCallback } from 'react';

// ============ Types ============

export interface DisputeClassification {
  severity: number; // 1-5 scale
  category: string;
  riskLevel: 'low' | 'med' | 'high';
  confidence: number; // 0-1
  reasoning: string;
}

export interface TriageLog {
  disputeId: string;
  userId: string;
  inputHash: string;
  classification: DisputeClassification;
  timestamp: number;
  method: 'ai' | 'fallback';
  processingTime: number;
}

export interface TriageConfig {
  openaiApiKey?: string;
  maxRetries: number;
  timeout: number;
  rateLimitPerHour: number;
  fallbackEnabled: boolean;
}

// ============ Validation Schemas ============

const DisputeClassificationSchema = z.object({
  severity: z.number().min(1).max(5),
  category: z.string().min(1),
  riskLevel: z.enum(['low', 'med', 'high']),
  confidence: z.number().min(0).max(1),
  reasoning: z.string().min(10)
});

const AIResponseSchema = z.object({
  classification: DisputeClassificationSchema
});

// ============ Content Moderation ============

const PROFANITY_PATTERNS = [
  /\b(fuck|shit|bitch|asshole|dick|pussy|cunt)\b/gi,
  /\b(kill|murder|suicide|bomb|terrorist)\b/gi,
  /\b(hack|crack|steal|fraud|scam)\b/gi
];

const ABUSIVE_PATTERNS = [
  /\b(you're stupid|idiot|moron|retard)\b/gi,
  /\b(i'll sue|lawyer|court|legal action)\b/gi,
  /\b(threat|blackmail|extort)\b/gi
];

// ============ Fallback Classification Rules ============

const CLASSIFICATION_RULES = [
  {
    patterns: [
      /\b(fraud|scam|fake|counterfeit|stolen)\b/gi,
      /\b(never received|didn't get|missing item)\b/gi
    ],
    category: 'Non-Delivery',
    severity: 4,
    riskLevel: 'high' as const
  },
  {
    patterns: [
      /\b(wrong item|damaged|broken|defective)\b/gi,
      /\b(not as described|different from listing)\b/gi
    ],
    category: 'Item Quality',
    severity: 3,
    riskLevel: 'med' as const
  },
  {
    patterns: [
      /\b(terms|agreement|contract|breach)\b/gi,
      /\b(cancelled|refund|return policy)\b/gi
    ],
    category: 'Terms Violation',
    severity: 2,
    riskLevel: 'low' as const
  },
  {
    patterns: [
      /\b(payment|money|funds|transaction)\b/gi,
      /\b(overcharged|double charge|billing)\b/gi
    ],
    category: 'Payment Dispute',
    severity: 3,
    riskLevel: 'med' as const
  },
  {
    patterns: [
      /\b(communication|response|contact)\b/gi,
      /\b(ignoring|no reply|unresponsive)\b/gi
    ],
    category: 'Communication Issue',
    severity: 1,
    riskLevel: 'low' as const
  }
];

// ============ AI Triage Service ============

export class DisputeTriageService {
  private config: TriageConfig;
  private rateLimitMap: Map<string, number[]> = new Map();

  constructor(config: Partial<TriageConfig> = {}) {
    this.config = {
      maxRetries: 3,
      timeout: 10000,
      rateLimitPerHour: 100,
      fallbackEnabled: true,
      ...config
    };
  }

  /**
   * Classifies a dispute using AI or fallback classification
   * @param details Dispute details
   * @param userId User ID for rate limiting
   * @returns Dispute classification
   */
  async classifyDispute(details: string, userId: string): Promise<DisputeClassification> {
    const startTime = Date.now();
    
    // Input validation and moderation
    if (!this.moderateContent(details)) {
      throw new Error('Dispute content violates community guidelines');
    }

    // Rate limiting check
    if (!this.checkRateLimit(userId)) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    // Generate input hash for logging
    const inputHash = this.hashInput(details);
    
    let classification: DisputeClassification;
    let method: 'ai' | 'fallback' = 'ai';

    try {
      // Try AI classification first
      if (this.config.openaiApiKey) {
        classification = await this.classifyWithAI(details);
      } else {
        throw new Error('OpenAI API key not configured');
      }
    } catch (error) {
      console.warn('AI classification failed, using fallback:', error);
      
      if (!this.config.fallbackEnabled) {
        throw new Error('Classification service unavailable');
      }
      
      method = 'fallback';
      classification = this.classifyWithFallback(details);
    }

    // Log the triage result
    await this.logTriage({
      disputeId: this.generateDisputeId(),
      userId,
      inputHash,
      classification,
      timestamp: Date.now(),
      method,
      processingTime: Date.now() - startTime
    });

    return classification;
  }

  /**
   * Classifies dispute using OpenAI GPT-4
   * @param details Dispute details
   * @returns AI classification
   */
  private async classifyWithAI(details: string): Promise<DisputeClassification> {
    const systemPrompt = `You are an impartial AI dispute classifier working for a trust-first financial protocol. 
    
Your task is to analyze dispute details and return a structured JSON response with:
- severity: 1-5 scale (1=minor, 5=critical)
- category: specific dispute type
- riskLevel: low/med/high
- confidence: 0-1 scale
- reasoning: brief explanation

Always return valid JSON. Be impartial and objective.`;

    const userPrompt = `Analyze this dispute: "${details}"

Return only the JSON response with the classification.`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 500,
          temperature: 0.1
        }),
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content in AI response');
      }

      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const validated = AIResponseSchema.parse(parsed);

      return validated.classification;

    } catch (error) {
      throw new Error(`AI classification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Classifies dispute using fallback rules-based system
   * @param details Dispute details
   * @returns Fallback classification
   */
  private classifyWithFallback(details: string): DisputeClassification {
    const lowerDetails = details.toLowerCase();
    
    // Find matching rules
    const matches = CLASSIFICATION_RULES.filter(rule => 
      rule.patterns.some(pattern => pattern.test(lowerDetails))
    );

    if (matches.length === 0) {
      // Default classification for unmatched disputes
      return {
        severity: 2,
        category: 'General Dispute',
        riskLevel: 'low',
        confidence: 0.3,
        reasoning: 'Dispute does not match known patterns'
      };
    }

    // Use the highest severity match
    const bestMatch = matches.reduce((prev, current) => 
      current.severity > prev.severity ? current : prev
    );

    return {
      severity: bestMatch.severity,
      category: bestMatch.category,
      riskLevel: bestMatch.riskLevel,
      confidence: 0.7,
      reasoning: `Classified using pattern matching for ${bestMatch.category}`
    };
  }

  /**
   * Moderates content for inappropriate language
   * @param input Content to moderate
   * @returns True if content is acceptable
   */
  moderateContent(input: string): boolean {
    const lowerInput = input.toLowerCase();
    
    // Check for profanity
    const hasProfanity = PROFANITY_PATTERNS.some(pattern => pattern.test(lowerInput));
    if (hasProfanity) {
      return false;
    }

    // Check for abusive language
    const isAbusive = ABUSIVE_PATTERNS.some(pattern => pattern.test(lowerInput));
    if (isAbusive) {
      return false;
    }

    // Check minimum length
    if (input.trim().length < 10) {
      return false;
    }

    // Check maximum length
    if (input.length > 5000) {
      return false;
    }

    return true;
  }

  /**
   * Checks rate limiting for user
   * @param userId User ID
   * @returns True if within rate limit
   */
  private checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    const userRequests = this.rateLimitMap.get(userId) || [];
    const recentRequests = userRequests.filter(time => time > oneHourAgo);
    
    if (recentRequests.length >= this.config.rateLimitPerHour) {
      return false;
    }
    
    recentRequests.push(now);
    this.rateLimitMap.set(userId, recentRequests);
    
    return true;
  }

  /**
   * Hashes input for logging
   * @param input Input to hash
   * @returns SHA-256 hash
   */
  private hashInput(input: string): string {
    return createHash('sha256').update(input).digest('hex');
  }

  /**
   * Generates unique dispute ID
   * @returns Dispute ID
   */
  private generateDisputeId(): string {
    return `dispute_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Logs triage result to Firestore
   * @param log Triage log entry
   */
  private async logTriage(log: TriageLog): Promise<void> {
    try {
      // This would integrate with Firestore
      // For now, we'll simulate the logging
      console.log('Triage log:', {
        path: `disputeTriageLogs/${log.userId}/${log.disputeId}`,
        data: log
      });
      
      // In production, this would be:
      // await firestore.collection('disputeTriageLogs')
      //   .doc(log.userId)
      //   .collection('logs')
      //   .doc(log.disputeId)
      //   .set(log);
      
    } catch (error) {
      console.error('Failed to log triage:', error);
      // Don't throw - logging failure shouldn't break the main flow
    }
  }

  /**
   * Gets triage statistics for a user
   * @param userId User ID
   * @returns Triage statistics
   */
  async getTriageStats(userId: string): Promise<{
    totalDisputes: number;
    averageSeverity: number;
    mostCommonCategory: string;
    aiSuccessRate: number;
  }> {
    // This would query Firestore for user's triage history
    // For now, return mock data
    return {
      totalDisputes: 0,
      averageSeverity: 0,
      mostCommonCategory: 'None',
      aiSuccessRate: 0
    };
  }

  /**
   * Validates a classification result
   * @param classification Classification to validate
   * @returns True if valid
   */
  validateClassification(classification: DisputeClassification): boolean {
    try {
      DisputeClassificationSchema.parse(classification);
      return true;
    } catch {
      return false;
    }
  }
}

// ============ React Hook ============

export function useDisputeTriage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [classification, setClassification] = useState<DisputeClassification | null>(null);

  const classifyDispute = useCallback(async (details: string, userId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const triageService = new DisputeTriageService({
        openaiApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY
      });
      
      const result = await triageService.classifyDispute(details, userId);
      setClassification(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Classification failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const retry = useCallback(() => {
    setError(null);
  }, []);

  return {
    classifyDispute,
    isLoading,
    error,
    classification,
    retry
  };
}

// ============ Export Singleton ============

export const disputeTriageService = new DisputeTriageService({
  openaiApiKey: process.env.OPENAI_API_KEY
}); 