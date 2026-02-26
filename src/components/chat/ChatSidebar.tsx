
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, MessageSquare, Sparkles, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatSession {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatSidebarProps {
  chatSessions: ChatSession[];
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ 
  chatSessions, 
  onSelectChat,
  onNewChat
}) => {
  const [activeChat, setActiveChat] = useState<string | null>(null);

  // Function to format the date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // If today
    if (date.toDateString() === now.toDateString()) {
      return 'Today';
    }
    // If yesterday
    else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    // If this year
    else if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    // Otherwise show date with year
    else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const handleSelectChat = (id: string) => {
    setActiveChat(id);
    onSelectChat(id);
  };

  return (
    <div className="w-72 h-full flex flex-col bg-gradient-to-b from-indigo-50/50 via-purple-50/50 to-pink-50/50 backdrop-blur-xl border-r border-indigo-100/50 relative z-10">
      {/* Header with New Chat Button */}
      <div className="p-5">
        <Button 
          onClick={onNewChat} 
          className="w-full bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:from-indigo-600 hover:via-purple-700 hover:to-pink-700 text-white font-semibold flex items-center justify-center gap-2 py-6 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          <Plus size={20} className="relative z-10 transform group-hover:rotate-90 transition-transform duration-300" />
          <span className="relative z-10">New Chat</span>
          <Sparkles size={16} className="relative z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Button>
      </div>

      {/* Chat History Section */}
      <div className="px-5 pb-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
          <Clock size={16} className="text-indigo-500" />
          <span>Recent Conversations</span>
        </div>
      </div>
      
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-2 pb-4">
          {chatSessions.length === 0 ? (
            <div className="text-center py-8 px-4">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">No conversations yet</p>
              <p className="text-xs text-gray-400 mt-1">Start a new chat to begin!</p>
            </div>
          ) : (
            chatSessions.map((session, index) => (
              <button
                key={session._id}
                onClick={() => handleSelectChat(session._id)}
                className={cn(
                  "group w-full text-left px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden",
                  activeChat === session._id
                    ? "bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 shadow-lg border border-indigo-200"
                    : "bg-white/60 hover:bg-white/80 border border-transparent hover:border-indigo-200 shadow-sm hover:shadow-md"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Active indicator */}
                {activeChat === session._id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 via-purple-600 to-pink-600 rounded-r"></div>
                )}
                
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "mt-0.5 p-2 rounded-lg transition-all duration-300",
                    activeChat === session._id 
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg" 
                      : "bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200"
                  )}>
                    <MessageSquare size={16} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      "font-medium text-sm truncate mb-1 transition-colors duration-300",
                      activeChat === session._id ? "text-indigo-900" : "text-gray-700 group-hover:text-indigo-700"
                    )}>
                      {session.title}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Clock size={12} />
                      <span>{formatDate(session.updatedAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-indigo-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 rounded-xl transition-all duration-300"></div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Bottom Decorative Element */}
      <div className="p-4 border-t border-indigo-100/50 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>All chats are encrypted</span>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
