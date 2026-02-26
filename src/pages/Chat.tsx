import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import ChatSidebar from '@/components/chat/ChatSidebar';
import MessageList, { Message } from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import { toast } from 'sonner';
import { getInitialMessage, getDrKamraanResponse, memClient } from '@/lib/groq-service';
import { mongoDBService } from '@/lib/mongodb-service';
import { authService } from '@/lib/auth-service';
import { Switch } from '@/components/ui/switch';
import { Brain, Volume2, Globe, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Update type definition for chat sessions to match MongoDB service
interface ChatSession {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

const initialPlaceholder: Message[] = [
  {
    id: '1',
    content: "Loading Dr. Kamraan's response...",
    sender: 'bot',
    timestamp: new Date(),
  },
];

let messageCounter = 0;

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(initialPlaceholder);
  const [isTyping, setIsTyping] = useState(true);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [useReasoning, setUseReasoning] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);  useEffect(() => {
    // Get the token from auth service and set it in MongoDB service
    const token = authService.getToken();
    
    if (token) {
      console.log("Using valid authentication token from localStorage");
      mongoDBService.setToken(token);
    } else {
      console.warn("No authentication token found. Chat functionality may be limited.");
      // For testing purposes only - use a mock token in development
      if (import.meta.env.DEV) {
        console.log("Using mock token for development environment");
        mongoDBService.setToken("mock-token-for-testing");
      }
    }
    
    // Load chat sessions from MongoDB
    const loadChatSessions = async () => {
      try {
        const sessions = await mongoDBService.getChatSessions();
        console.log("Loaded chat sessions:", sessions);
        
        if (sessions.length > 0) {
          setChatSessions(sessions);
          // Set the most recent session as active
          setActiveChatId(sessions[0]._id);
        } else {
          // If no sessions exist, create a new one
          console.log("No existing chat sessions found, creating new chat");
          createNewChat();
        }
      } catch (error) {
        console.error("Failed to load chat sessions:", error);
        // If we can't load sessions, at least create a new one
        createNewChat();
      }
    };
    
    loadChatSessions();
  }, []);  // Initialize memory client with user ID
  useEffect(() => {
    const userId = authService.getUserId();
    if (userId) {
      console.log("Initializing memory client with user ID:", userId);
      memClient.setUserId(userId);
    } else {
      console.warn("No user ID found, using fallback for testing");
      memClient.setUserId("user123"); // Fallback for testing
    }
  }, []);
  
  // Load speech synthesis voices
  useEffect(() => {
    if ('speechSynthesis' in window) {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) setVoices(availableVoices);

      const voicesChangedHandler = () => {
        setVoices(window.speechSynthesis.getVoices());
      };

      window.speechSynthesis.addEventListener('voiceschanged', voicesChangedHandler);

      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', voicesChangedHandler);
      };
    }
  }, []);
  // Load messages when active chat changes
  useEffect(() => {
    if (!activeChatId) return;
    
    const loadChatMessages = async () => {
      try {
        setIsTyping(true);
        
        // Get chat session details including messages
        const session = await mongoDBService.getChatSessionById(activeChatId);
        
        // Set the collection name in memory client for this chat session
        memClient.setCollectionName(session.collectionName);
        
        // Convert the messages to our local Message format
        if (session.messages && session.messages.length > 0) {
          const formattedMessages = session.messages.map((msg: any) => ({
            id: msg._id || `msg-${Date.now()}-${++messageCounter}`,
            content: msg.content,
            sender: msg.sender,
            timestamp: new Date(msg.timestamp)
          }));
          
          setMessages(formattedMessages);
        } else {
          // If no messages, generate initial greeting
          const userId = authService.getUserId();
          if (userId) {
            console.log("Using authenticated user ID for initial greeting:", userId);
          } else {
            console.warn("No user ID found, using fallback for testing");
          }
          
          const greeting = await getInitialMessage(userId || "user123");
          console.log("Generated initial greeting:", greeting);
          
          const initialMessage = {
            id: `initial-${++messageCounter}`,
            content: greeting,
            sender: 'bot',
            timestamp: new Date()
          };
          setMessages([initialMessage]);
          
          // Store this initial message in MongoDB
          await mongoDBService.addMessage(activeChatId, {
            content: greeting,
            sender: 'bot',
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error("Failed to load chat messages:", error);
        toast.error("Couldn't load conversation. Please try again.");
        setMessages([]);
      } finally {
        setIsTyping(false);
      }
    };
    
    loadChatMessages();
  }, [activeChatId]);
  const selectChat = (id: string) => {
    setActiveChatId(id);
  };

  const createNewChat = async () => {
    try {
      setIsTyping(true);
      
      // Get user info for better logging
      const userId = authService.getUserId();
      const user = authService.getUser();
      console.log("Creating new chat for user:", userId, user ? `(${user.email || user.username})` : "(no user data)");
      
      // Create a new chat session in MongoDB
      const newSession = await mongoDBService.createChatSession('New conversation');
      console.log("New chat session created:", newSession);
      
      // Add session to local state
      setChatSessions(prev => [newSession, ...prev]);
      
      // Set as active chat
      setActiveChatId(newSession._id);
      
      // Set the collection name in memory client for this session
      memClient.setCollectionName(newSession.collectionName);
      console.log("Memory collection set to:", newSession.collectionName);
      
    } catch (error) {
      console.error("Failed to create new chat:", error);
      toast.error("Couldn't create a new conversation. Please try again.");
    }
  };
  const handleSendMessage = async (content: string) => {
    if (!activeChatId) {
      toast.error("No active chat session. Please create a new conversation.");
      return;
    }
    
    // Create user message
    const userMessage: Message = {
      id: `user-${Date.now()}-${++messageCounter}`,
      content,
      sender: 'user',
      timestamp: new Date(),
    };

    // Add to UI immediately
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Store user message in MongoDB 
      await mongoDBService.addMessage(activeChatId, {
        content: userMessage.content,
        sender: 'user',
        timestamp: userMessage.timestamp
      });
      
      // Update chat title if it's a new conversation
      if (chatSessions.find(s => s._id === activeChatId)?.title === 'New conversation') {
        const shortTitle = content.length > 20 ? content.substring(0, 20) + '...' : content;
        
        try {
          // Update the title in the database
          await mongoDBService.updateChatSessionTitle(activeChatId, shortTitle);
          
          // Update local state with new title
          setChatSessions(prev =>
            prev.map(session =>
              session._id === activeChatId ? { ...session, title: shortTitle } : session
            )
          );
        } catch (err) {
          console.error('Failed to update chat title:', err);
          // Still update local state even if the API call fails
          setChatSessions(prev =>
            prev.map(session =>
              session._id === activeChatId ? { ...session, title: shortTitle } : session
            )
          );
        }
      }      
      
      // Get response from AI, passing the user ID
      const userId = authService.getUserId();
      if (userId) {
        console.log("Using authenticated user ID for AI response:", userId);
      } else {
        console.warn("No user ID found, using fallback for testing");
      }
      
      const aiResponse = await getDrKamraanResponse(
        content, 
        useReasoning, 
        undefined, 
        2, 
        userId || "user123"
      );

      const botMessage: Message = {
        id: `bot-${Date.now()}-${++messageCounter}`,
        content: aiResponse,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
      toast("New message from Dr. Kamraan");
      
      // Store bot message in MongoDB
      await mongoDBService.addMessage(activeChatId, {
        content: botMessage.content, 
        sender: 'bot',
        timestamp: botMessage.timestamp
      });
    } catch (error) {
      console.error("Failed to get AI response:", error);
      const errorMessage: Message = {
        id: `error-${Date.now()}-${++messageCounter}`,
        content: "I apologize, but I'm having trouble connecting right now. Could you please try again in a moment?",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleReasoning = () => {
    setUseReasoning(!useReasoning);
    toast(`${!useReasoning ? "Structured advice mode enabled" : "Basic mode enabled"}`);
  };

  // Function to detect the language of the text
  const detectLanguage = (text: string): 'hindi' | 'english' | 'hinglish' => {
    // Hindi Unicode range: \u0900-\u097F
    const hindiPattern = /[\u0900-\u097F]/;
    const hasHindi = hindiPattern.test(text);
    
    // Check for English words (basic Latin characters)
    const englishPattern = /[a-zA-Z]/;
    const hasEnglish = englishPattern.test(text);
    
    if (hasHindi && hasEnglish) {
      return 'hinglish';
    } else if (hasHindi) {
      return 'hindi';
    } else {
      return 'english';
    }
  };

  const cleanTextForSpeech = (text: string): string => {
    // Remove emojis (unicode ranges)
    let cleaned = text.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF])/g, '');

    // Specifically remove asterisks
    cleaned = cleaned.replace(/\*/g, ' ');

    // Remove symbols like →, arrows, bullets, etc., but preserve Hindi characters
    cleaned = cleaned.replace(/[^\w\s.,!?'"()-\u0900-\u097F]/g, '');

    // Collapse multiple spaces
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    return cleaned;
  };

  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const cleanedText = cleanTextForSpeech(text);
      const language = detectLanguage(cleanedText);
      
      // Break long text into smaller chunks to ensure full playback
      // Speech synthesis often stops with long paragraphs
      const chunkSize = 150; // Characters per chunk
      const textChunks = [];
      
      // Split text into sentences and then into appropriate-sized chunks
      const sentences = cleanedText.match(/[^.!?]+[.!?]+/g) || [cleanedText];
      let currentChunk = '';
      
      for (const sentence of sentences) {
        if (currentChunk.length + sentence.length < chunkSize) {
          currentChunk += sentence;
        } else {
          // If current chunk is not empty, push it before starting a new one
          if (currentChunk.length > 0) {
            textChunks.push(currentChunk);
          }
          // If the sentence itself is too long, break it up
          if (sentence.length > chunkSize) {
            // Find a suitable breaking point (space) near the chunk size
            let sentenceRemaining = sentence;
            while (sentenceRemaining.length > 0) {
              const breakPoint = sentenceRemaining.length > chunkSize 
                ? sentenceRemaining.lastIndexOf(' ', chunkSize) 
                : sentenceRemaining.length;
              
              // If no space found, just use chunk size
              const actualBreakPoint = breakPoint > 0 ? breakPoint : Math.min(chunkSize, sentenceRemaining.length);
              
              textChunks.push(sentenceRemaining.substring(0, actualBreakPoint));
              sentenceRemaining = sentenceRemaining.substring(actualBreakPoint).trim();
            }
          } else {
            currentChunk = sentence;
          }
        }
      }
      
      // Add the last chunk if it's not empty
      if (currentChunk.length > 0) {
        textChunks.push(currentChunk);
      }

      // Create a counter for the number of chunks
      const totalChunks = textChunks.length;
      let chunkIndex = 0;
      
      // Show toast with appropriate message
      toast(`Speaking in ${language}... (${totalChunks} parts)`);
      
      // Function to speak each chunk in sequence
      const speakNextChunk = () => {
        if (chunkIndex < textChunks.length) {
          const chunk = textChunks[chunkIndex];
          const utterance = new SpeechSynthesisUtterance(chunk);
          
          // Configure utterance based on language
          configureUtterance(utterance, language);
          
          // Set handlers for this chunk
          utterance.onend = () => {
            chunkIndex++;
            speakNextChunk();
          };
          
          utterance.onerror = (event) => {
            console.error(`Speech synthesis error at chunk ${chunkIndex}:`, event);
            // Try to continue with next chunk despite error
            chunkIndex++;
            speakNextChunk();
          };
          
          window.speechSynthesis.speak(utterance);
        }
      };
      
      // Start speaking the first chunk
      speakNextChunk();
    } else {
      toast("Text-to-speech not supported in your browser");
    }
  };

  // Helper function to configure utterance based on language
  const configureUtterance = (utterance: SpeechSynthesisUtterance, language: 'hindi' | 'english' | 'hinglish') => {
    // Set speech parameters based on detected language
    if (language === 'hindi') {
      // Parameters for Hindi speech
      utterance.lang = 'hi-IN';
      utterance.rate = 0.9;  // Slightly slower for Hindi clarity
      utterance.pitch = 1.0;
      
      // Find a Hindi voice if available
      const hindiVoice = voices.find(voice => 
        voice.lang === 'hi-IN' || 
        voice.lang === 'hi' || 
        voice.name.includes('Hindi')
      );
      
      if (hindiVoice) {
        utterance.voice = hindiVoice;
      }
    } else if (language === 'hinglish') {
      // For Hinglish, we'll use Hindi settings but adjust the rate
      utterance.lang = 'hi-IN';
      utterance.rate = 0.85;  // Even slower for mixed language
      utterance.pitch = 1.0;
      
      const hindiVoice = voices.find(voice => 
        voice.lang === 'hi-IN' || 
        voice.lang === 'hi' || 
        voice.name.includes('Hindi')
      );
      
      if (hindiVoice) {
        utterance.voice = hindiVoice;
      }
    } else {
      // Parameters for English speech
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      // Find a good English voice
      const englishVoice = voices.find(voice => 
        voice.lang === 'en-US' && (
          voice.name.includes('Female') || 
          voice.name.includes('Samantha') || 
          voice.name.includes('Google')
        )
      );
      
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
    }
    
    // Set common parameters
    utterance.volume = 1.0;
  };
  const EnhancedMessageList = () => {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <h3 className="text-2xl font-semibold text-primary mb-2">Welcome to Dr. Kamraan</h3>
            <p className="text-muted-foreground max-w-md">
              Your child development specialist with 20+ years of experience with neurodivergent children.
              Ask me anything about parenting tips or daily challenges.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? "justify-end" : "justify-start"} animate-message-fade-in opacity-0`}
              style={{ animationDelay: '0.1s' }}
            >
              <div
                className={`max-w-[80%] px-4 py-3 rounded-lg ${message.sender === 'user' ? "chat-bubble-user" : "chat-bubble-bot"}`}
              >
                <div className="flex justify-between items-start">
                  <p className="whitespace-pre-wrap pr-2">{message.content}</p>
                  {message.sender === 'bot' && (
                    <div className="flex">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 mt-1 ml-1 text-muted-foreground hover:text-primary"
                              onClick={() => speakMessage(message.content)}
                              title="Listen to this message"
                            >
                              <Volume2 size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Listen ({detectLanguage(message.content)})</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}
                </div>
                <div className="text-xs opacity-70 text-right mt-1">
                  {new Intl.DateTimeFormat('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  }).format(message.timestamp)}
                </div>
              </div>
            </div>
          ))
        )}

        {isTyping && (
          <div className="flex justify-start animate-message-fade-in opacity-0">
            <div className="chat-bubble-bot px-4 py-3">
              <div className="typing-indicator">
                <span></span>
                <span style={{ animationDelay: '0.2s' }}></span>
                <span style={{ animationDelay: '0.4s' }}></span>
              </div>
            </div>
          </div>
        )}

        <div id="messagesEnd" />
      </div>
    );
  };

  useEffect(() => {
    document.getElementById('messagesEnd')?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <Layout>
      <div className="flex h-[calc(100vh-4rem-4rem)] overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative">
        {/* Animated Background Blobs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-indigo-300/30 to-purple-300/30 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-300/30 to-pink-300/30 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-gradient-to-r from-blue-300/30 to-indigo-300/30 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        
        <ChatSidebar
          chatSessions={chatSessions}
          onSelectChat={selectChat}
          onNewChat={createNewChat}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden bg-white/60 backdrop-blur-xl border-l border-indigo-100/50 shadow-2xl relative z-10">
          {/* Enhanced Header with Avatar and Controls */}
          <div className="relative px-6 py-5 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 text-white shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-700 opacity-50 blur-xl"></div>
            <div className="relative flex justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                {/* Animated Avatar */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-white/30 rounded-full blur-md group-hover:blur-lg transition-all duration-500"></div>
                  <div className="relative w-14 h-14 bg-gradient-to-br from-white/20 to-white/5 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/30 shadow-xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <MessageCircle size={24} className="text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-400 rounded-full border-2 border-white animate-pulse shadow-lg shadow-green-400/50"></div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-xl">Dr. Joy</h2>
                    <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium backdrop-blur-sm">AI</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/90">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <p>Online • Parenting Specialist</p>
                  </div>
                </div>
              </div>
              
              {/* Structured Advice Toggle */}
              <div className="flex items-center gap-3 bg-white/15 px-5 py-3 rounded-2xl backdrop-blur-xl border border-white/20 shadow-xl transform hover:scale-105 transition-all duration-300">
                <Brain size={20} className={cn("transition-all duration-300", useReasoning ? "text-white scale-110" : "text-white/60")} />
                <div className="flex flex-col">
                  <span className="text-xs text-white/80">AI Mode</span>
                  <span className="text-sm font-semibold">{useReasoning ? "Structured" : "Quick"}</span>
                </div>
                <Switch
                  checked={useReasoning}
                  onCheckedChange={toggleReasoning}
                  className="data-[state=checked]:bg-white/30"
                />
              </div>
            </div>
          </div>
          
          <EnhancedMessageList />
          <MessageInput onSendMessage={handleSendMessage} disabled={isTyping} />
        </div>
      </div>
    </Layout>
  );
};

export default Chat;
