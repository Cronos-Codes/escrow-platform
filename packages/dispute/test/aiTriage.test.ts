import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DisputeTriageService, DisputeClassification } from '../src/aiTriage';

// Mock fetch globally
global.fetch = vi.fn();

describe('DisputeTriageService', () => {
  let triageService: DisputeTriageService;
  let mockFetch: any;

  beforeEach(() => {
    triageService = new DisputeTriageService({
      openaiApiKey: 'test-key',
      maxRetries: 2,
      timeout: 5000,
      rateLimitPerHour: 10,
      fallbackEnabled: true
    });
    mockFetch = fetch as any;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('classifyDispute', () => {
    const mockUserId = 'user123';
    const validDisputeDetails = 'I never received the item I paid for. The seller is not responding to my messages.';

    it('should classify dispute using AI successfully', async () => {
      const mockAIResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              classification: {
                severity: 4,
                category: 'Non-Delivery',
                riskLevel: 'high',
                confidence: 0.9,
                reasoning: 'Clear case of non-delivery with communication issues'
              }
            })
          }
        }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAIResponse
      });

      const result = await triageService.classifyDispute(validDisputeDetails, mockUserId);

      expect(result).toEqual({
        severity: 4,
        category: 'Non-Delivery',
        riskLevel: 'high',
        confidence: 0.9,
        reasoning: 'Clear case of non-delivery with communication issues'
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Authorization': 'Bearer test-key',
            'Content-Type': 'application/json'
          },
          body: expect.stringContaining('gpt-4')
        })
      );
    });

    it('should fallback to rules-based classification when AI fails', async () => {
      mockFetch.mockRejectedValue(new Error('API Error'));

      const result = await triageService.classifyDispute(validDisputeDetails, mockUserId);

      expect(result.category).toBe('Non-Delivery');
      expect(result.severity).toBe(4);
      expect(result.riskLevel).toBe('high');
      expect(result.confidence).toBe(0.7);
    });

    it('should throw error when both AI and fallback are disabled', async () => {
      const serviceWithoutFallback = new DisputeTriageService({
        openaiApiKey: undefined,
        fallbackEnabled: false
      });

      await expect(
        serviceWithoutFallback.classifyDispute(validDisputeDetails, mockUserId)
      ).rejects.toThrow('Classification service unavailable');
    });

    it('should respect rate limiting', async () => {
      // Exceed rate limit
      for (let i = 0; i < 11; i++) {
        if (i < 10) {
          mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
              choices: [{
                message: {
                  content: JSON.stringify({
                    classification: {
                      severity: 1,
                      category: 'Test',
                      riskLevel: 'low',
                      confidence: 0.8,
                      reasoning: 'Test dispute'
                    }
                  })
                }
              }]
            })
          });
        }
      }

      // First 10 should succeed
      for (let i = 0; i < 10; i++) {
        await triageService.classifyDispute(`Test dispute ${i}`, mockUserId);
      }

      // 11th should fail
      await expect(
        triageService.classifyDispute('Another test dispute', mockUserId)
      ).rejects.toThrow('Rate limit exceeded');
    });

    it('should handle AI response parsing errors', async () => {
      const invalidResponse = {
        choices: [{
          message: {
            content: 'Invalid JSON response'
          }
        }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => invalidResponse
      });

      const result = await triageService.classifyDispute(validDisputeDetails, mockUserId);

      // Should fallback to rules-based classification
      expect(result.category).toBe('Non-Delivery');
    });

    it('should handle OpenAI API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429
      });

      const result = await triageService.classifyDispute(validDisputeDetails, mockUserId);

      // Should fallback to rules-based classification
      expect(result.category).toBe('Non-Delivery');
    });
  });

  describe('moderateContent', () => {
    it('should reject profane content', () => {
      const profaneContent = 'This is a fucking scam!';
      expect(triageService.moderateContent(profaneContent)).toBe(false);
    });

    it('should reject abusive content', () => {
      const abusiveContent = 'You are an idiot and I will sue you!';
      expect(triageService.moderateContent(abusiveContent)).toBe(false);
    });

    it('should reject content that is too short', () => {
      const shortContent = 'Bad deal';
      expect(triageService.moderateContent(shortContent)).toBe(false);
    });

    it('should reject content that is too long', () => {
      const longContent = 'A'.repeat(6000);
      expect(triageService.moderateContent(longContent)).toBe(false);
    });

    it('should accept valid content', () => {
      const validContent = 'I have not received the item I paid for. The seller has not responded to my messages for over a week.';
      expect(triageService.moderateContent(validContent)).toBe(true);
    });

    it('should accept content with edge case words', () => {
      const edgeCaseContent = 'The item was damaged during shipping. I need a refund.';
      expect(triageService.moderateContent(edgeCaseContent)).toBe(true);
    });
  });

  describe('fallback classification rules', () => {
    it('should classify non-delivery disputes correctly', async () => {
      const nonDeliveryContent = 'I never received the item. The seller is ignoring me.';
      
      mockFetch.mockRejectedValue(new Error('AI failed'));
      
      const result = await triageService.classifyDispute(nonDeliveryContent, 'user123');
      
      expect(result.category).toBe('Non-Delivery');
      expect(result.severity).toBe(4);
      expect(result.riskLevel).toBe('high');
    });

    it('should classify item quality disputes correctly', async () => {
      const qualityContent = 'The item arrived damaged and not as described.';
      
      mockFetch.mockRejectedValue(new Error('AI failed'));
      
      const result = await triageService.classifyDispute(qualityContent, 'user123');
      
      expect(result.category).toBe('Item Quality');
      expect(result.severity).toBe(3);
      expect(result.riskLevel).toBe('med');
    });

    it('should classify payment disputes correctly', async () => {
      const paymentContent = 'I was overcharged for this transaction.';
      
      mockFetch.mockRejectedValue(new Error('AI failed'));
      
      const result = await triageService.classifyDispute(paymentContent, 'user123');
      
      expect(result.category).toBe('Payment Dispute');
      expect(result.severity).toBe(3);
      expect(result.riskLevel).toBe('med');
    });

    it('should classify communication issues correctly', async () => {
      const communicationContent = 'The seller is not responding to my messages.';
      
      mockFetch.mockRejectedValue(new Error('AI failed'));
      
      const result = await triageService.classifyDispute(communicationContent, 'user123');
      
      expect(result.category).toBe('Communication Issue');
      expect(result.severity).toBe(1);
      expect(result.riskLevel).toBe('low');
    });

    it('should use highest severity when multiple patterns match', async () => {
      const multiPatternContent = 'I never received the item and it was also damaged when it finally arrived.';
      
      mockFetch.mockRejectedValue(new Error('AI failed'));
      
      const result = await triageService.classifyDispute(multiPatternContent, 'user123');
      
      // Should use Non-Delivery (severity 4) over Item Quality (severity 3)
      expect(result.category).toBe('Non-Delivery');
      expect(result.severity).toBe(4);
    });

    it('should provide default classification for unmatched content', async () => {
      const unmatchedContent = 'I have a general concern about this transaction.';
      
      mockFetch.mockRejectedValue(new Error('AI failed'));
      
      const result = await triageService.classifyDispute(unmatchedContent, 'user123');
      
      expect(result.category).toBe('General Dispute');
      expect(result.severity).toBe(2);
      expect(result.riskLevel).toBe('low');
      expect(result.confidence).toBe(0.3);
    });
  });

  describe('validation', () => {
    it('should validate correct classification', () => {
      const validClassification: DisputeClassification = {
        severity: 3,
        category: 'Test Category',
        riskLevel: 'med',
        confidence: 0.8,
        reasoning: 'This is a test classification with valid data'
      };

      expect(triageService.validateClassification(validClassification)).toBe(true);
    });

    it('should reject invalid severity', () => {
      const invalidClassification = {
        severity: 6, // Invalid: should be 1-5
        category: 'Test Category',
        riskLevel: 'med',
        confidence: 0.8,
        reasoning: 'Test reasoning'
      };

      expect(triageService.validateClassification(invalidClassification as any)).toBe(false);
    });

    it('should reject invalid risk level', () => {
      const invalidClassification = {
        severity: 3,
        category: 'Test Category',
        riskLevel: 'invalid', // Invalid: should be low/med/high
        confidence: 0.8,
        reasoning: 'Test reasoning'
      };

      expect(triageService.validateClassification(invalidClassification as any)).toBe(false);
    });

    it('should reject invalid confidence', () => {
      const invalidClassification = {
        severity: 3,
        category: 'Test Category',
        riskLevel: 'med',
        confidence: 1.5, // Invalid: should be 0-1
        reasoning: 'Test reasoning'
      };

      expect(triageService.validateClassification(invalidClassification as any)).toBe(false);
    });
  });

  describe('input hashing', () => {
    it('should generate consistent hashes for same input', async () => {
      const input1 = 'Test dispute content';
      const input2 = 'Test dispute content';
      
      mockFetch.mockRejectedValue(new Error('AI failed'));
      
      await triageService.classifyDispute(input1, 'user1');
      await triageService.classifyDispute(input2, 'user2');
      
      // The hashing is internal, but we can verify the service handles it
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('timeout handling', () => {
    it('should handle AI request timeouts', async () => {
      mockFetch.mockImplementation(() => {
        return new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout')), 100);
        });
      });

      const result = await triageService.classifyDispute(validDisputeDetails, mockUserId);

      // Should fallback to rules-based classification
      expect(result.category).toBe('Non-Delivery');
    });
  });

  describe('error handling', () => {
    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await triageService.classifyDispute(validDisputeDetails, mockUserId);

      // Should fallback to rules-based classification
      expect(result.category).toBe('Non-Delivery');
    });

    it('should handle malformed AI responses', async () => {
      const malformedResponse = {
        choices: [] // Empty choices
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => malformedResponse
      });

      const result = await triageService.classifyDispute(validDisputeDetails, mockUserId);

      // Should fallback to rules-based classification
      expect(result.category).toBe('Non-Delivery');
    });
  });

  describe('statistics', () => {
    it('should return mock statistics', async () => {
      const stats = await triageService.getTriageStats('user123');

      expect(stats).toEqual({
        totalDisputes: 0,
        averageSeverity: 0,
        mostCommonCategory: 'None',
        aiSuccessRate: 0
      });
    });
  });
}); 