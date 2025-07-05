// Content moderation utility
export async function moderateContent(content: string): Promise<boolean> {
  // Simple profanity check - in production, this would use a more sophisticated service
  const profanityWords = ['badword1', 'badword2']; // Add actual profanity list
  const lowerContent = content.toLowerCase();
  return profanityWords.some(word => lowerContent.includes(word));
} 