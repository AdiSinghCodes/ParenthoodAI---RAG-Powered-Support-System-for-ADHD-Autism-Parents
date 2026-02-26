// Add proper type declarations for the Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// Define custom types for Speech Recognition
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: {
    transcript: string;
    confidence: number;
  };
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mic, MicOff, Send, AlertCircle } from 'lucide-react';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const isSpeechRecognitionSupported = !!SpeechRecognition;

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [interim, setInterim] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (!isSpeechRecognitionSupported) {
      console.warn('Speech Recognition not supported by this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognitionRef.current = recognition;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      setMessage((prev) => prev + finalTranscript);
      setInterim(interimTranscript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      let errorMsg = `Speech recognition error: ${event.error}`;
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        errorMsg = 'Microphone access denied. Please allow microphone access in browser settings.';
      } else if (event.error === 'no-speech') {
        errorMsg = 'No speech detected. Please try again.';
      }
      setMicError(errorMsg);
      setIsRecording(false);
    };

    recognition.onend = () => {
      console.log('Speech recognition ended.');
      setIsRecording(false);
    };

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error('Error stopping recognition during cleanup:', error);
        }
      }
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
      setInterim('');
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleRecording = () => {
    if (!isSpeechRecognitionSupported) {
      setMicError('Speech Recognition is not supported by your browser.');
      return;
    }
    const recognition = recognitionRef.current;
    if (!recognition) {
      setMicError('Speech Recognition could not be initialized.');
      return;
    }

    setMicError(null);

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
      console.log('Speech recognition stopped by user.');
    } else {
      try {
        recognition.start();
        setIsRecording(true);
        console.log('Speech recognition started.');
      } catch (error) {
        if (error instanceof Error && error.name === 'InvalidStateError') {
          console.warn('Recognition already started.');
        } else {
          console.error('Error starting speech recognition:', error);
          setMicError('Could not start microphone. Check permissions.');
          setIsRecording(false);
        }
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-indigo-100/50 p-5 bg-gradient-to-r from-white/80 via-indigo-50/30 to-purple-50/30 backdrop-blur-xl">
      <div className="flex items-end gap-3">
        <div className="relative flex-1">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setInterim(''); // Clear interim when typing manually
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask Dr. Joy anything about parenting... 💬"
            className="min-h-[60px] w-full resize-none rounded-2xl border-2 border-indigo-200/50 bg-white/90 backdrop-blur-sm px-5 py-3 pr-12 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 shadow-lg hover:shadow-xl placeholder:text-gray-400"
            disabled={disabled}
            aria-label="Type your message here"
          />
          {interim && (
            <div className="absolute bottom-0 left-0 w-full px-5 py-3 text-indigo-500 italic text-sm animate-pulse">
              {interim}
            </div>
          )}
          {isRecording && (
            <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded-full text-xs font-medium animate-pulse shadow-lg">
              <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
              Recording...
            </div>
          )}
        </div>

        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={toggleRecording}
          className={`
            h-[60px] w-[60px] rounded-2xl transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl
            ${isRecording 
              ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white border-none animate-pulse' 
              : 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-600 hover:from-indigo-200 hover:to-purple-200 border-2 border-indigo-200/50'
            }
          `}
          disabled={disabled || !isSpeechRecognitionSupported}
          title={
            isSpeechRecognitionSupported
              ? isRecording
                ? 'Stop recording'
                : 'Start voice input'
              : 'Speech input not supported'
          }
        >
          {!isSpeechRecognitionSupported ? (
            <AlertCircle size={24} />
          ) : isRecording ? (
            <MicOff size={24} />
          ) : (
            <Mic size={24} />
          )}
        </Button>

        <Button
          type="submit"
          size="icon"
          disabled={!message.trim() || disabled}
          title="Send message"
          className="h-[60px] w-[60px] rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:from-indigo-600 hover:via-purple-700 hover:to-pink-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group"
        >
          <Send size={24} className="transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
        </Button>
      </div>

      {micError && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-600 text-sm animate-shake">
          <AlertCircle size={16} className="flex-shrink-0" />
          <p>{micError}</p>
        </div>
      )}
    </form>
  );
};

export default MessageInput;
