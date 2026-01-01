'use client';

import { useState } from 'react';
import { 
  Button,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Box,
  Typography,
  Chip,
  IconButton
} from '@mui/material';
import { 
  IconMessage, 
  IconX, 
  IconSend, 
  IconRobot,
  IconUser,
  IconMinimize,
  IconMaximize
} from '@tabler/icons-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI assistant. How can I help you with the admin dashboard today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputValue),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const getBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('escrow') || input.includes('transaction')) {
      return 'I can help you with escrow management. You can view all escrows, create new ones, or manage existing transactions from the Escrows page.';
    } else if (input.includes('dispute') || input.includes('conflict')) {
      return 'For dispute management, navigate to the Disputes page where you can review, assign arbiters, and resolve conflicts.';
    } else if (input.includes('user') || input.includes('customer')) {
      return 'User management is available on the Users page. You can view user profiles, manage permissions, and handle KYC verification.';
    } else if (input.includes('paymaster') || input.includes('fund')) {
      return 'The Paymaster page allows you to manage wallet balances, allocate funds, and monitor gas sponsorship for escrow transactions.';
    } else if (input.includes('analytics') || input.includes('report')) {
      return 'Check the Analytics page for comprehensive reports, transaction volumes, and performance metrics.';
    } else if (input.includes('risk') || input.includes('security')) {
      return 'The Risk Center provides real-time risk assessment, fraud detection, and security monitoring tools.';
    } else {
      return 'I\'m here to help! You can ask me about escrow management, user administration, dispute resolution, analytics, or any other admin dashboard features.';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="large"
          sx={{
            borderRadius: '50%',
            width: 56,
            height: 56,
            boxShadow: 3,
            bgcolor: 'primary.main',
            '&:hover': {
              bgcolor: 'primary.dark'
            }
          }}
        >
          <IconMessage className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80">
      <Card className="shadow-xl border-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <IconRobot className="h-4 w-4 text-white" />
              </div>
              <div>
                <Typography variant="subtitle2">AI Assistant</Typography>
                <Chip label="Online" size="small" color="success" />
              </div>
            </div>
            <div className="flex items-center space-x-1">
                             <IconButton
                 onClick={() => setIsMinimized(!isMinimized)}
                 size="small"
               >
                                {isMinimized ? <IconMaximize className="h-4 w-4" /> : <IconMinimize className="h-4 w-4" />}
              </IconButton>
              <IconButton
                onClick={() => setIsOpen(false)}
                size="small"
              >
                <IconX className="h-4 w-4" />
              </IconButton>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <>
            <CardContent className="pt-0">
              <Box sx={{ height: 256, mb: 2, overflow: 'auto' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {messages.map((message) => (
                    <Box
                      key={message.id}
                      sx={{ 
                        display: 'flex', 
                        justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start' 
                      }}
                    >
                      <Box
                        sx={{
                          maxWidth: '80%',
                          borderRadius: 1,
                          px: 1.5,
                          py: 1,
                          bgcolor: message.sender === 'user' ? 'primary.main' : 'grey.100',
                          color: message.sender === 'user' ? 'primary.contrastText' : 'text.primary'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          {message.sender === 'bot' && (
                            <IconRobot style={{ fontSize: 16, marginTop: 2 }} />
                          )}
                          <Box>
                            <Typography variant="body2">{message.text}</Typography>
                            <Typography variant="caption" sx={{ opacity: 0.7, mt: 0.5 }}>
                              {message.timestamp.toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </Typography>
                          </Box>
                          {message.sender === 'user' && (
                            <IconUser style={{ fontSize: 16, marginTop: 2 }} />
                          )}
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>

                             <Box sx={{ display: 'flex', gap: 1 }}>
                 <TextField
                   value={inputValue}
                   onChange={(e) => setInputValue(e.target.value)}
                   onKeyPress={handleKeyPress}
                   placeholder="Type your message..."
                   size="small"
                   sx={{ flex: 1 }}
                 />
                 <IconButton
                   onClick={handleSendMessage}
                   disabled={!inputValue.trim()}
                   size="small"
                 >
                   <IconSend />
                 </IconButton>
               </Box>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
