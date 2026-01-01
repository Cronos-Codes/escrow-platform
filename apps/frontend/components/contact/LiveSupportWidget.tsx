import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LiveSupportWidgetProps {
  userRole: string;
}

interface Message {
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export const LiveSupportWidget: React.FC<LiveSupportWidgetProps> = ({
  userRole
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [mode, setMode] = useState<'text' | 'voice'>('text');
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [aiThinking, setAiThinking] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Memoized messages for performance
  const [messages, setMessages] = useState<Message[]>([
    { type: 'ai', content: 'Hello! I\'m your AI concierge. How can I assist you today?', timestamp: new Date() }
  ]);

  // Memoized quick responses
  const quickResponses = useMemo(() => [
    'I need help with a transaction',
    'How do I create an escrow?',
    'What are your fees?',
    'Send secure message',
    'I want to speak to a human'
  ], []);

  // Responsive detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Listen for external chat triggers
  useEffect(() => {
    const handleOpenAIChat = () => {
      setIsExpanded(true);
    };

    window.addEventListener('openAIChat', handleOpenAIChat);
    return () => window.removeEventListener('openAIChat', handleOpenAIChat);
  }, []);

  // Simulate AI thinking animation
  useEffect(() => {
    if (aiThinking) {
      const timer = setTimeout(() => {
        setAiThinking(false);
        setMessages(prev => [...prev, {
          type: 'ai',
          content: 'I understand your request. Let me connect you with the appropriate team member.',
          timestamp: new Date()
        }]);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [aiThinking]);

  // Enhanced AI response logic
  const generateAIResponse = useCallback((userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('secure message') || lowerMessage.includes('encrypted')) {
      return '🔐 Your message has been encrypted and sent securely. I\'ll respond within 30 seconds. For sensitive information, rest assured that all communications are end-to-end encrypted.';
    } else if (lowerMessage.includes('transaction') || lowerMessage.includes('escrow')) {
      return 'I can help you with your escrow transaction. Please provide the transaction ID or describe what you need assistance with. All transaction details are kept confidential and secure.';
    } else if (lowerMessage.includes('fees')) {
      return 'Our fee structure is transparent and competitive. Standard escrow fees range from 0.5% to 2% depending on transaction value and complexity. Would you like me to provide a detailed breakdown?';
    } else if (lowerMessage.includes('human')) {
      return 'I\'m connecting you to a human specialist now. Please wait a moment while I transfer you to our VIP concierge team.';
    } else {
      return 'Thank you for your message. I\'m here to help with all your escrow needs. How can I assist you further?';
    }
  }, []);

  const handleSendMessage = useCallback((content: string) => {
    if (!content.trim()) return;

    // Add user message
    setMessages(prev => [...prev, {
      type: 'user',
      content,
      timestamp: new Date()
    }]);

    // Clear input
    setInputValue('');

    // Simulate AI response with enhanced logic
    setAiThinking(true);
    
    // Generate appropriate AI response
    setTimeout(() => {
      setAiThinking(false);
      const aiResponse = generateAIResponse(content);
      setMessages(prev => [...prev, {
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      }]);
    }, 2000);
  }, [generateAIResponse]);

  const handleQuickResponse = useCallback((response: string) => {
    handleSendMessage(response);
  }, [handleSendMessage]);

  const handleInputSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  }, [inputValue, handleSendMessage]);

  const toggleWidget = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  return (
    <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`absolute bottom-20 right-0 ${
              isMobile ? 'w-full max-w-sm' : 'w-80'
            } bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden`}
            role="dialog"
            aria-label="AI Concierge Chat"
          >
            {/* Enhanced Header */}
            <div className="bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <span className="text-white text-sm">🤖</span>
                  </motion.div>
                  <div>
                    <h3 className="text-white font-semibold text-sm sm:text-base">AI Concierge</h3>
                    <p className="text-yellow-300 text-xs">Online • Secure • Instant Response</p>
                  </div>
                </div>
                <button
                  onClick={toggleWidget}
                  className="text-white/60 hover:text-white transition-colors p-1 rounded"
                  aria-label="Close chat"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Enhanced Mode Toggle */}
            <div className="p-4 border-b border-white/10">
              <div className="flex bg-white/10 rounded-lg p-1">
                {[
                  { key: 'text', label: 'Secure Chat', icon: '🔐' },
                  { key: 'voice', label: 'Voice', icon: '🎤' }
                ].map((option) => (
                  <button
                    key={option.key}
                    onClick={() => setMode(option.key as 'text' | 'voice')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                      mode === option.key
                        ? 'bg-white/20 text-white shadow-sm'
                        : 'text-white/70 hover:text-white/90'
                    }`}
                    aria-label={`Switch to ${option.label} mode`}
                  >
                    <span>{option.icon}</span>
                    <span className="hidden sm:inline">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Enhanced Chat Messages */}
            <div className="h-64 sm:h-80 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-yellow-400/20 text-white'
                        : 'bg-white/10 text-white'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p className="text-xs opacity-60 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* AI Thinking Indicator */}
              {aiThinking && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/10 text-white p-3 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                          className="w-2 h-2 bg-white/60 rounded-full"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                          className="w-2 h-2 bg-white/60 rounded-full"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                          className="w-2 h-2 bg-white/60 rounded-full"
                        />
                      </div>
                      <span className="text-sm">AI is thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Enhanced Quick Responses */}
            <div className="p-4 border-t border-white/10">
              <div className="grid grid-cols-2 gap-2 mb-3">
                {quickResponses.map((response, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleQuickResponse(response)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="text-xs bg-white/10 text-white p-2 rounded-lg hover:bg-white/20 transition-colors text-left"
                    disabled={aiThinking}
                  >
                    {response}
                  </motion.button>
                ))}
              </div>

              {/* Enhanced Input Form */}
              <form onSubmit={handleInputSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your secure message..."
                  className="flex-1 bg-white/10 text-white placeholder-white/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                  disabled={aiThinking}
                  aria-label="Type your secure message"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-yellow-400/20 text-white p-2 rounded-lg hover:bg-yellow-400/30 transition-colors disabled:opacity-50"
                  disabled={!inputValue.trim() || aiThinking}
                  aria-label="Send secure message"
                >
                  🔐
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Floating Button */}
      <motion.button
        onClick={toggleWidget}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full shadow-2xl flex items-center justify-center text-white text-2xl hover:shadow-yellow-400/25 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-yellow-400/50"
        aria-label={isExpanded ? "Close AI concierge" : "Open AI concierge"}
        aria-expanded={isExpanded}
      >
        {isExpanded ? '✕' : '🤖'}
      </motion.button>
    </div>
  );
};

