/**
 * ChatBot Component
 * A floating chat interface for customer assistance
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, X, MessageSquare, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { chatbotApi } from '../../services/chatbot';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isChatbotAvailable, setIsChatbotAvailable] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Check if chatbot service is available
  useEffect(() => {
    const checkChatbotStatus = async () => {
      try {
        const response = await chatbotApi.checkStatus();
        setIsChatbotAvailable(response.available);
        
        // Add welcome message if chatbot is available
        if (response.available) {
          setMessages([
            {
              role: 'assistant',
              content: 'Hello! I\'m Khanut Assistant. How can I help you today?',
              timestamp: new Date()
            }
          ]);
        }
      } catch (error) {
        console.error('Error checking chatbot status:', error);
        setIsChatbotAvailable(false);
      }
    };

    checkChatbotStatus();
  }, []);

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !isChatbotAvailable) return;
    
    // Add user message to chat
    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);
    
    try {
      // Get chat history in format expected by API
      const history = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }));
      
      // Send message to API
      const response = await chatbotApi.sendMessage(message, history);
      
      // Add assistant response to chat
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again later.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Always show the chat button, but display a message if the service is unavailable
  console.log('ChatBot rendering, isChatbotAvailable:', isChatbotAvailable);

  return (
    <div className="fixed bottom-24 right-6 z-50">
      {/* Chat button */}
      <button
        onClick={toggleChat}
        className="bg-primary text-white rounded-full p-4 shadow-lg hover:bg-primary-dark transition-all duration-300"
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 h-[450px] bg-white rounded-lg shadow-xl flex flex-col overflow-hidden border border-gray-200">
          {/* Chat header */}
          <div className="bg-primary text-white p-3 flex justify-between items-center">
            <h3 className="font-medium">Khanut Assistant</h3>
            <button onClick={toggleChat} className="text-white hover:text-gray-200">
              <X size={18} />
            </button>
          </div>

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {!isChatbotAvailable && messages.length === 0 ? (
              <div className="flex justify-center items-center h-full">
                <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200 max-w-[80%]">
                  <p className="text-sm text-yellow-700 mb-2">Chatbot service is currently unavailable</p>
                  <p className="text-xs text-yellow-600">Please try again later or contact support</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex justify-center items-center h-full">
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200 max-w-[80%]">
                  <p className="text-sm text-blue-700 mb-2">Welcome to Khanut Assistant!</p>
                  <p className="text-xs text-blue-600">How can I help you today?</p>
                </div>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-2 ${
                      msg.role === 'user'
                        ? 'bg-primary text-white rounded-tr-none'
                        : 'bg-gray-100 text-gray-800 rounded-tl-none'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat input */}
          <form onSubmit={handleSubmit} className="border-t border-gray-200 p-3 flex">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={isChatbotAvailable ? "Type your message..." : "Chatbot service unavailable"}
              className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading || !isChatbotAvailable}
            />
            <button
              type="submit"
              className="bg-primary text-white rounded-r-lg px-3 py-2 disabled:bg-gray-400"
              disabled={isLoading || !message.trim() || !isChatbotAvailable}
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
