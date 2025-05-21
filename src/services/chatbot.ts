/**
 * Chatbot API Service
 * For the defense presentation, this uses mock responses instead of calling the API
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
 * Chatbot service for the defense presentation
 * Uses mock responses instead of calling the API
 */
export const chatbotApi = {
  /**
   * Check if the chatbot service is available
   * @returns Status response
   */
  async checkStatus(): Promise<ChatbotStatusResponse> {
    // For the defense, always return available: true
    return { available: true, message: 'Chatbot service is available' };
  },

  /**
   * Send a message to the chatbot and get a response
   * @param message The message to send
   * @param history Optional chat history for context
   * @returns The chatbot's response
   */
  async sendMessage(message: string, history: ChatHistory[] = []): Promise<ChatbotMessageResponse> {
    // For the defense, use mock responses based on the message content
    return { response: this.getMockResponse(message) };
  },

  /**
   * Get a mock response based on the message content
   * @param message The user's message
   * @returns A predefined response based on the message content
   */
  getMockResponse(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    // Greetings
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return "Hello! I'm Khanut Assistant. How can I help you today? I can provide information about businesses, help with bookings, or answer questions about using the Khanut platform.";
    }
    
    // About Khanut
    if (lowerMessage.includes('about khanut') || lowerMessage.includes('what is khanut') || lowerMessage.includes('tell me about khanut')) {
      return "Khanut is a comprehensive platform that connects customers with local businesses in Ethiopia. Our mission is to help you discover and engage with the best local services. Khanut offers business listings, appointment booking, reviews, and personalized recommendations to enhance your shopping and service experience.";
    }

    // User Manual - General
    if (lowerMessage.includes('how to use') || lowerMessage.includes('user manual') || lowerMessage.includes('guide') || lowerMessage.includes('tutorial')) {
      return "Here's a quick guide to using Khanut:\n\n1. Browse businesses by category or search for specific services\n2. View business profiles, including services, hours, and reviews\n3. Book appointments directly through the platform\n4. Manage your appointments from your dashboard\n5. Leave reviews after your experience\n\nIs there a specific feature you'd like to learn more about?";
    }
    
    // User Manual - Booking
    if (lowerMessage.includes('how to book') || lowerMessage.includes('make appointment') || lowerMessage.includes('schedule')) {
      return "To book an appointment on Khanut:\n\n1. Find a business you're interested in\n2. Click on the business profile\n3. Select 'Book Appointment'\n4. Choose your preferred date and time\n5. Select the service you need\n6. Confirm your booking\n\nYou'll receive a confirmation and can manage all your appointments from your dashboard.";
    }
    
    // User Manual - Account
    if (lowerMessage.includes('account') || lowerMessage.includes('profile') || lowerMessage.includes('sign up') || lowerMessage.includes('login')) {
      return "To manage your Khanut account:\n\n1. Create an account with your email or phone number\n2. Complete your profile with your preferences\n3. Access your dashboard to view appointments and saved businesses\n4. Update your information anytime from the profile section\n5. Manage notification preferences in settings\n\nYour data is secure and only used to enhance your experience on Khanut.";
    }
    
    // Recommendations - General
    if (lowerMessage.includes('recommend') || lowerMessage.includes('suggestion')) {
      return "Based on popular choices in Khanut, I'd recommend:\n\n• System Electronics for tech needs (4.5★)\n• Liyu Coffee for a relaxing café experience (4.7★)\n• Habesha Restaurant for authentic cuisine (4.6★)\n• Kira Beauty Salon for beauty services (4.8★)\n\nWould you like more specific recommendations based on your preferences?";
    }
    
    // Recommendations - Restaurants
    if (lowerMessage.includes('restaurant') || lowerMessage.includes('food') || lowerMessage.includes('eat') || lowerMessage.includes('dining')) {
      return "For dining options on Khanut, I recommend:\n\n• Habesha Restaurant - Authentic Ethiopian cuisine with traditional coffee ceremony (4.6★)\n• KT Cafe - Casual dining with great pastries and coffee (4.4★)\n• Yod Abyssinia - Cultural dining experience with live music (4.7★)\n• Lucy Lounge - Modern fusion cuisine with excellent service (4.5★)\n\nAll these restaurants are highly rated by Khanut users.";
    }
    
    // Recommendations - Electronics
    if (lowerMessage.includes('electronics') || lowerMessage.includes('tech') || lowerMessage.includes('computer') || lowerMessage.includes('phone')) {
      return "For electronics and tech services on Khanut, check out:\n\n• System Electronics - Wide range of products and repair services (4.5★)\n• Digital Solutions - Specialized in computer repairs and custom builds (4.3★)\n• Mobile World - Expert phone repairs and accessories (4.6★)\n• Tech Hub - IT services and business solutions (4.4★)\n\nAll these businesses offer warranties on their services.";
    }
    
    // Recommendations - Beauty
    if (lowerMessage.includes('beauty') || lowerMessage.includes('salon') || lowerMessage.includes('hair') || lowerMessage.includes('spa')) {
      return "For beauty and wellness services on Khanut, I recommend:\n\n• Kira Beauty Salon - Full-service salon with skilled stylists (4.8★)\n• Harmony Spa - Relaxing treatments and massages (4.7★)\n• Glow Studio - Specialized in skincare and facials (4.6★)\n• Eve's Nail Bar - Premium nail care and art (4.5★)\n\nAll these businesses allow online booking through Khanut.";
    }
    
    // Reviews and Ratings
    if (lowerMessage.includes('review') || lowerMessage.includes('rating') || lowerMessage.includes('feedback')) {
      return "On Khanut, you can read and leave reviews for businesses you've visited. Reviews help other customers make informed decisions and help businesses improve their services. To leave a review:\n\n1. Go to the business profile\n2. Click on 'Write a Review'\n3. Rate your experience (1-5 stars)\n4. Share your feedback\n5. Submit your review\n\nYour honest feedback is valuable to our community!";
    }
    
    // Payment and Pricing
    if (lowerMessage.includes('payment') || lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('fee')) {
      return "Khanut is free to use for customers! Businesses list their prices on their profiles, and payment methods vary by business. Some accept online payments through the platform, while others take payment at the time of service. You can see the accepted payment methods on each business profile. If you have questions about specific pricing, I can help you find that information.";
    }
    
    // Troubleshooting
    if (lowerMessage.includes('problem') || lowerMessage.includes('issue') || lowerMessage.includes('not working') || lowerMessage.includes('help me')) {
      return "I'm sorry you're experiencing an issue with Khanut. Here are some common solutions:\n\n• Refresh the page or restart the app\n• Check your internet connection\n• Clear your browser cache\n• Make sure you're using a supported browser (Chrome, Firefox, Safari)\n\nIf you're still having trouble, please contact our support team at support@khanut.com or through the Help section in your account.";
    }
    
    // Business Categories
    if (lowerMessage.includes('category') || lowerMessage.includes('categories') || lowerMessage.includes('types of business')) {
      return "Khanut features businesses across many categories, including:\n\n• Restaurants & Cafes\n• Electronics & Tech Services\n• Beauty & Wellness\n• Health & Fitness\n• Home Services\n• Professional Services\n• Retail Shops\n• Entertainment\n\nYou can browse by category from the main page or use the search function to find specific services.";
    }
    
    // Location-based
    if (lowerMessage.includes('near me') || lowerMessage.includes('nearby') || lowerMessage.includes('location') || lowerMessage.includes('area')) {
      return "Khanut can help you find businesses near your location. Make sure you've enabled location services in your browser or app. You can also manually enter your area or city to find nearby businesses. The map view shows you exactly where businesses are located and provides directions.";
    }
    
    // Special Offers
    if (lowerMessage.includes('deal') || lowerMessage.includes('discount') || lowerMessage.includes('offer') || lowerMessage.includes('promotion')) {
      return "Khanut features special offers from many businesses! You can find current promotions on the Deals page or look for the special offer badge on business listings. Some current promotions include:\n\n• 15% off first-time appointments at Kira Beauty Salon\n• Free coffee with any meal at KT Cafe\n• Diagnostic check included with repairs at System Electronics\n\nCheck business profiles for their latest offers.";
    }
    
    // Thank you messages
    if (lowerMessage.includes('thank')) {
      return "You're welcome! I'm happy to help. If you have any other questions about Khanut or need assistance finding the right businesses for your needs, feel free to ask anytime. Enjoy your experience with Khanut!";
    }
    
    // Default response for other queries
    return "As Khanut Assistant, I can help you discover local businesses, book appointments, learn how to use the platform, or answer questions about services. What would you like to know about today? You can ask about restaurants, electronics, beauty services, or how to use specific features of Khanut.";
  }
};
