/**
 * Chatbot API Service
 * Handles communication with the chatbot backend API
 */

import api from './api';

interface ChatbotStatusResponse {
  available: boolean;
  message: string;
}

interface ChatbotMessageResponse {
  response: string;
}

interface ChatHistory {
  role: string;
  parts: { text: string }[];
}

/**
 * Chatbot API service for handling AI assistant interactions
 */
export const chatbotApi = {
  /**
   * Check if the chatbot service is available
   * @returns Status response
   */
  async checkStatus(): Promise<ChatbotStatusResponse> {
    const response = await api.get('/chatbot/status');
    return response.data;
  },

  /**
   * Send a message to the chatbot and get a response
   * @param message The message to send
   * @param history Optional chat history for context
   * @returns The chatbot's response
   */
  async sendMessage(message: string, history: ChatHistory[] = []): Promise<ChatbotMessageResponse> {
    const response = await api.post('/chatbot/customer', {
      message,
      history
    });
    return response.data;
  }
};
