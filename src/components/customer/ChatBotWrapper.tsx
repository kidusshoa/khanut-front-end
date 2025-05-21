'use client';

import dynamic from 'next/dynamic';

// Dynamically import the ChatBot component with no SSR
const ChatBot = dynamic(() => import('./ChatBot'), { ssr: false });

/**
 * Client-side wrapper for the ChatBot component
 * This allows us to use the client component in a server component
 */
export default function ChatBotWrapper() {
  return <ChatBot />;
}
