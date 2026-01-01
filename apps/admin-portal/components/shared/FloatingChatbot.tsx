'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  IconButton,
  Paper,
  Typography,
  TextField,
  Stack,
  Avatar,
  Chip,
  Button,
  alpha,
  useTheme,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Chat,
  Send,
  Close,
  SmartToy,
  Person,
  ExpandMore,
  ExpandLess,
  AttachFile,
  Mic,
  Stop,
} from '@mui/icons-material';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'suggestion' | 'loading';
}

interface FloatingChatbotProps {
  theme?: 'light' | 'dark';
  position?: { bottom: number; right: number };
}

const FloatingChatbot: React.FC<FloatingChatbotProps> = ({
  theme = 'light',
  position = { bottom: 24, right: 24 },
}) => {
  const muiTheme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your Gold Escrow AI assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickSuggestions = [
    "How do I create an escrow?",
    "What are the fees?",
    "How to resolve a dispute?",
    "Check my wallet balance",
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputValue),
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const getBotResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('escrow') && lowerInput.includes('create')) {
      return "To create an escrow, go to the Escrows page and click 'New Escrow'. You'll need to specify the counterparty, amount, and terms. Would you like me to walk you through the process?";
    }
    
    if (lowerInput.includes('fee')) {
      return "Our fee structure is: 0.5% for standard escrows, 0.3% for gold-backed escrows, and 1% for dispute resolution. All fees are transparent and displayed before confirmation.";
    }
    
    if (lowerInput.includes('dispute')) {
      return "To resolve a dispute, go to the Disputes page and click on your active dispute. You can upload evidence, communicate with the other party, and request arbitration if needed.";
    }
    
    if (lowerInput.includes('wallet') || lowerInput.includes('balance')) {
      return "You can check your wallet balance on the Wallet page. It shows both crypto and fiat equivalents, plus transaction history and deposit/withdrawal options.";
    }
    
    return "I understand you're asking about: '" + input + "'. Let me connect you with our support team for more detailed assistance. You can also check our Help Center for comprehensive guides.";
  };

  const handleQuickSuggestion = (suggestion: string) => {
    setInputValue(suggestion);
    handleSendMessage();
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setIsMinimized(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 260, 
          damping: 20,
          delay: 1,
        }}
        style={{
          position: 'fixed',
          bottom: position.bottom,
          right: position.right,
          zIndex: 1300,
        }}
      >
        <IconButton
          onClick={toggleChat}
          sx={{
            width: 64,
            height: 64,
            background: 'linear-gradient(45deg, #FFC107, #FF9800)',
            color: 'white',
            boxShadow: '0 8px 32px rgba(255, 193, 7, 0.4)',
            '&:hover': {
              background: 'linear-gradient(45deg, #FF9800, #FFC107)',
              transform: 'scale(1.1)',
              boxShadow: '0 12px 40px rgba(255, 193, 7, 0.6)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {isOpen ? <Close /> : <Chat />}
        </IconButton>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              bottom: position.bottom + 80,
              right: position.right,
              zIndex: 1300,
            }}
          >
            <Paper
              elevation={24}
              sx={{
                width: { xs: 'calc(100vw - 32px)', sm: 400 },
                height: isMinimized ? 60 : 600,
                maxHeight: isMinimized ? 60 : '80vh',
                background: theme === 'dark'
                  ? 'rgba(30, 30, 30, 0.95)'
                  : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha('#FFC107', 0.2)}`,
                borderRadius: 3,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  p: 2,
                  background: 'linear-gradient(45deg, #FFC107, #FF9800)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      width: 32,
                      height: 32,
                    }}
                  >
                    <SmartToy />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Gold Escrow AI
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      Online now
                    </Typography>
                  </Box>
                </Stack>
                
                <Stack direction="row" spacing={1}>
                  <IconButton
                    size="small"
                    onClick={toggleMinimize}
                    sx={{ color: 'white' }}
                  >
                    {isMinimized ? <ExpandMore /> : <ExpandLess />}
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={toggleChat}
                    sx={{ color: 'white' }}
                  >
                    <Close />
                  </IconButton>
                </Stack>
              </Box>

              {!isMinimized && (
                <>
                  {/* Messages */}
                  <Box
                    sx={{
                      flex: 1,
                      overflow: 'auto',
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                    }}
                  >
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Stack
                          direction="row"
                          spacing={2}
                          justifyContent={message.sender === 'user' ? 'flex-end' : 'flex-start'}
                          alignItems="flex-start"
                        >
                          {message.sender === 'bot' && (
                            <Avatar
                              sx={{
                                bgcolor: alpha('#FFC107', 0.2),
                                width: 32,
                                height: 32,
                                mt: 0.5,
                              }}
                            >
                              <SmartToy sx={{ fontSize: 18 }} />
                            </Avatar>
                          )}
                          
                          <Paper
                            elevation={2}
                            sx={{
                              p: 2,
                              maxWidth: '80%',
                              background: message.sender === 'user'
                                ? 'linear-gradient(45deg, #FFC107, #FF9800)'
                                : theme === 'dark'
                                ? 'rgba(255, 255, 255, 0.1)'
                                : 'rgba(0, 0, 0, 0.05)',
                              color: message.sender === 'user' ? 'white' : 'inherit',
                              borderRadius: 2,
                            }}
                          >
                            <Typography variant="body2">
                              {message.text}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                display: 'block',
                                mt: 1,
                                opacity: 0.7,
                                fontSize: '0.7rem',
                              }}
                            >
                              {message.timestamp.toLocaleTimeString()}
                            </Typography>
                          </Paper>
                          
                          {message.sender === 'user' && (
                            <Avatar
                              sx={{
                                bgcolor: alpha('#FFC107', 0.2),
                                width: 32,
                                height: 32,
                                mt: 0.5,
                              }}
                            >
                              <Person sx={{ fontSize: 18 }} />
                            </Avatar>
                          )}
                        </Stack>
                      </motion.div>
                    ))}
                    
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar
                            sx={{
                              bgcolor: alpha('#FFC107', 0.2),
                              width: 32,
                              height: 32,
                            }}
                          >
                            <SmartToy sx={{ fontSize: 18 }} />
                          </Avatar>
                          <Paper
                            elevation={2}
                            sx={{
                              p: 2,
                              background: theme === 'dark'
                                ? 'rgba(255, 255, 255, 0.1)'
                                : 'rgba(0, 0, 0, 0.05)',
                              borderRadius: 2,
                            }}
                          >
                            <Stack direction="row" spacing={1}>
                              <CircularProgress size={16} />
                              <Typography variant="body2" color="text.secondary">
                                AI is typing...
                              </Typography>
                            </Stack>
                          </Paper>
                        </Stack>
                      </motion.div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </Box>

                  {/* Quick Suggestions */}
                  {messages.length === 1 && (
                    <Box sx={{ p: 2, pt: 0 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                        Quick suggestions:
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {quickSuggestions.map((suggestion, index) => (
                          <Chip
                            key={index}
                            label={suggestion}
                            size="small"
                            onClick={() => handleQuickSuggestion(suggestion)}
                            sx={{
                              cursor: 'pointer',
                              '&:hover': {
                                background: alpha('#FFC107', 0.1),
                                color: '#FFC107',
                              },
                            }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}

                  <Divider />

                  {/* Input */}
                  <Box sx={{ p: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="flex-end">
                      <TextField
                        fullWidth
                        multiline
                        maxRows={3}
                        placeholder="Ask me anything about Gold Escrow..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        variant="outlined"
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#FFC107',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#FFC107',
                            },
                          },
                        }}
                      />
                      
                      <IconButton
                        color="primary"
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim()}
                        sx={{
                          color: '#FFC107',
                          '&:hover': {
                            background: alpha('#FFC107', 0.1),
                          },
                        }}
                      >
                        <Send />
                      </IconButton>
                    </Stack>
                  </Box>
                </>
              )}
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingChatbot;


