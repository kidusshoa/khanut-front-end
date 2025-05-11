"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Search,
  Send,
  User,
  Clock,
  MoreVertical,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import DashboardLayout from "@/components/layout/DashboardLayout";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

// Mock data for messages
const mockConversations = [
  {
    id: "1",
    customer: {
      id: "c1",
      name: "John Doe",
      avatar: null,
    },
    lastMessage: {
      text: "Hello, I'd like to inquire about your services",
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      isRead: false,
      sender: "customer",
    },
    unreadCount: 1,
  },
  {
    id: "2",
    customer: {
      id: "c2",
      name: "Jane Smith",
      avatar: null,
    },
    lastMessage: {
      text: "Thank you for your prompt response!",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      isRead: true,
      sender: "customer",
    },
    unreadCount: 0,
  },
  {
    id: "3",
    customer: {
      id: "c3",
      name: "Michael Johnson",
      avatar: null,
    },
    lastMessage: {
      text: "Your appointment has been confirmed for tomorrow at 2 PM",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      isRead: true,
      sender: "business",
    },
    unreadCount: 0,
  },
];

const mockMessages = [
  {
    id: "m1",
    conversationId: "1",
    text: "Hello, I'd like to inquire about your services",
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    sender: "customer",
    senderName: "John Doe",
  },
  {
    id: "m2",
    conversationId: "2",
    text: "Hi, I'm interested in booking an appointment for next week",
    timestamp: new Date(Date.now() - 1000 * 60 * 35), // 35 minutes ago
    sender: "customer",
    senderName: "Jane Smith",
  },
  {
    id: "m3",
    conversationId: "2",
    text: "Sure, we have availability on Monday and Wednesday. What time works for you?",
    timestamp: new Date(Date.now() - 1000 * 60 * 32), // 32 minutes ago
    sender: "business",
    senderName: "Your Business",
  },
  {
    id: "m4",
    conversationId: "2",
    text: "Wednesday at 2 PM would be perfect!",
    timestamp: new Date(Date.now() - 1000 * 60 * 31), // 31 minutes ago
    sender: "customer",
    senderName: "Jane Smith",
  },
  {
    id: "m5",
    conversationId: "2",
    text: "Thank you for your prompt response!",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    sender: "customer",
    senderName: "Jane Smith",
  },
  {
    id: "m6",
    conversationId: "3",
    text: "Hello, I'd like to book an appointment for tomorrow if possible",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    sender: "customer",
    senderName: "Michael Johnson",
  },
  {
    id: "m7",
    conversationId: "3",
    text: "Hi Michael, we have a slot available at 2 PM tomorrow. Would that work for you?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.5), // 2.5 hours ago
    sender: "business",
    senderName: "Your Business",
  },
  {
    id: "m8",
    conversationId: "3",
    text: "Yes, that would be perfect!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.2), // 2.2 hours ago
    sender: "customer",
    senderName: "Michael Johnson",
  },
  {
    id: "m9",
    conversationId: "3",
    text: "Your appointment has been confirmed for tomorrow at 2 PM",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    sender: "business",
    senderName: "Your Business",
  },
];

interface MessagesContentProps {
  businessId: string;
}

export default function MessagesContent({ businessId }: MessagesContentProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [conversations, setConversations] = useState(mockConversations);
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Filter conversations based on active tab
  const filteredConversations = conversations.filter((conversation) => {
    if (activeTab === "unread") {
      return conversation.unreadCount > 0;
    }
    return true;
  });

  // Filter conversations based on search query
  const searchedConversations = filteredConversations.filter((conversation) => {
    if (!searchQuery) return true;
    return conversation.customer.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Get messages for selected conversation
  const conversationMessages = messages.filter(
    (message) => message.conversationId === selectedConversation
  );

  // Handle sending a new message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const newMessageObj = {
      id: `m${messages.length + 1}`,
      conversationId: selectedConversation,
      text: newMessage,
      timestamp: new Date(),
      sender: "business",
      senderName: "Your Business",
    };

    setMessages([...messages, newMessageObj]);
    
    // Update last message in conversation
    setConversations(
      conversations.map((conv) => {
        if (conv.id === selectedConversation) {
          return {
            ...conv,
            lastMessage: {
              text: newMessage,
              timestamp: new Date(),
              isRead: true,
              sender: "business",
            },
          };
        }
        return conv;
      })
    );

    setNewMessage("");
  };

  // Mark conversation as read when selected
  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
    
    // Mark as read
    setConversations(
      conversations.map((conv) => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            unreadCount: 0,
            lastMessage: {
              ...conv.lastMessage,
              isRead: true,
            },
          };
        }
        return conv;
      })
    );
  };

  if (isLoading) {
    return (
      <DashboardLayout businessId={businessId}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout businessId={businessId}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground">
            Communicate with your customers and manage inquiries
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
          {/* Conversations List */}
          <Card className="md:col-span-1 flex flex-col">
            <CardHeader className="space-y-4 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Conversations</CardTitle>
                <Badge variant="outline" className="font-normal">
                  {conversations.reduce((acc, conv) => acc + conv.unreadCount, 0)} unread
                </Badge>
              </div>
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
                prefix={<Search className="h-4 w-4 text-muted-foreground" />}
              />
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="unread">Unread</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full">
                {searchedConversations.length > 0 ? (
                  <div className="space-y-1 p-2">
                    {searchedConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors ${
                          selectedConversation === conversation.id
                            ? "bg-orange-100 dark:bg-orange-900/20"
                            : "hover:bg-muted"
                        }`}
                        onClick={() => handleSelectConversation(conversation.id)}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={conversation.customer.avatar || ""} />
                          <AvatarFallback className="bg-orange-100 text-orange-600">
                            {conversation.customer.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">
                              {conversation.customer.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {dayjs(conversation.lastMessage.timestamp).fromNow()}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <p className="text-sm text-muted-foreground truncate">
                              {conversation.lastMessage.sender === "business" && "You: "}
                              {conversation.lastMessage.text}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <Badge className="ml-auto bg-orange-500 hover:bg-orange-600">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                    <AlertTriangle className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="font-medium">No conversations found</p>
                    <p className="text-sm text-muted-foreground">
                      {searchQuery
                        ? "Try a different search term"
                        : activeTab === "unread"
                        ? "You have no unread messages"
                        : "Start communicating with your customers"}
                    </p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Message Thread */}
          <Card className="md:col-span-2 flex flex-col">
            {selectedConversation ? (
              <>
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={
                            conversations.find(
                              (c) => c.id === selectedConversation
                            )?.customer.avatar || ""
                          }
                        />
                        <AvatarFallback className="bg-orange-100 text-orange-600">
                          {conversations
                            .find((c) => c.id === selectedConversation)
                            ?.customer.name.split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>
                          {
                            conversations.find((c) => c.id === selectedConversation)
                              ?.customer.name
                          }
                        </CardTitle>
                        <CardDescription>Customer</CardDescription>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Customer Profile</DropdownMenuItem>
                        <DropdownMenuItem>Mark as Unread</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          Delete Conversation
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0">
                  <ScrollArea className="h-[calc(100%-70px)]">
                    <div className="p-4 space-y-4">
                      {conversationMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.sender === "business" ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              message.sender === "business"
                                ? "bg-orange-100 dark:bg-orange-900/20 text-orange-900 dark:text-orange-50"
                                : "bg-muted"
                            }`}
                          >
                            <p className="text-sm">{message.text}</p>
                            <div
                              className={`flex items-center gap-1 mt-1 text-xs ${
                                message.sender === "business"
                                  ? "text-orange-600/70 dark:text-orange-300/70 justify-end"
                                  : "text-muted-foreground"
                              }`}
                            >
                              <Clock className="h-3 w-3" />
                              <span>{dayjs(message.timestamp).format("h:mm A")}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
                <CardFooter className="border-t p-3">
                  <div className="flex items-center gap-2 w-full">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <User className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No conversation selected</h3>
                <p className="text-muted-foreground max-w-md">
                  Select a conversation from the list to view messages and respond to your
                  customers.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
