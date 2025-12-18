import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Send, User, Search, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

interface Chat {
    chatId: number;
    contactId: number;
    contactName: string;
    lastMessage: string;
    lastUpdated: string;
    unreadCount: number;
}

interface Message {
    id: number;
    chatId: number;
    senderId: number;
    content: string;
    isRead: boolean;
    sentAt: string;
}

const MessagesPage: React.FC = () => {
    const { user } = useAuth();
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [message, setMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [chats, setChats] = useState<Chat[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch chats
    const fetchChats = async () => {
        try {
            const response = await api.get('/messages/chats');
            setChats(response.data);
        } catch (error) {
            console.error('Failed to fetch chats:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch messages for a chat
    const fetchMessages = async (chatId: number) => {
        try {
            const response = await api.get(`/messages/chats/${chatId}`);
            setMessages(response.data);
            // Mark as read
            await api.put(`/messages/chats/${chatId}/read`);
            // Update unread count in chats list
            setChats(prev => prev.map(chat =>
                chat.chatId === chatId ? { ...chat, unreadCount: 0 } : chat
            ));
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        }
    };

    useEffect(() => {
        fetchChats();
        // Poll for new messages every 5 seconds
        const interval = setInterval(fetchChats, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (selectedChat) {
            fetchMessages(selectedChat.chatId);
            // Poll for new messages in current chat
            const interval = setInterval(() => fetchMessages(selectedChat.chatId), 3000);
            return () => clearInterval(interval);
        }
    }, [selectedChat?.chatId]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!message.trim() || !selectedChat) return;

        setSending(true);
        try {
            await api.post(`/messages/chats/${selectedChat.chatId}/send`, { content: message });
            setMessage('');
            fetchMessages(selectedChat.chatId);
        } catch (error) {
            toast.error('বার্তা পাঠাতে ব্যর্থ হয়েছে');
        } finally {
            setSending(false);
        }
    };

    const filteredChats = chats.filter(c =>
        c.contactName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        if (date.toDateString() === today.toDateString()) {
            return 'আজ';
        }
        return date.toLocaleDateString('bn-BD');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-16rem)]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="grid md:grid-cols-3 gap-6 h-[calc(100vh-16rem)]">
            {/* Contacts List */}
            <Card className="md:col-span-1">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        বার্তা (Messages)
                    </CardTitle>
                    <CardDescription>আপনার কথোপকথন</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="p-4 border-b">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="খুঁজুন..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                    <div className="overflow-y-auto max-h-[calc(100vh-28rem)]">
                        {filteredChats.length === 0 ? (
                            <div className="p-6 text-center text-muted-foreground">
                                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>কোনো বার্তা নেই</p>
                                <p className="text-sm mt-1">বিড করলে স্বয়ংক্রিয় বার্তা আসবে</p>
                            </div>
                        ) : (
                            filteredChats.map((chat) => (
                                <button
                                    key={chat.chatId}
                                    onClick={() => setSelectedChat(chat)}
                                    className={`w-full p-4 text-left border-b hover:bg-muted transition-colors ${selectedChat?.chatId === chat.chatId ? 'bg-muted' : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <User className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-medium truncate">{chat.contactName}</h4>
                                                {chat.unreadCount > 0 && (
                                                    <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                                                        {chat.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground truncate">{chat.lastMessage || 'কোনো বার্তা নেই'}</p>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Chat Area */}
            <Card className="md:col-span-2 flex flex-col">
                {selectedChat ? (
                    <>
                        <CardHeader className="border-b">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">{selectedChat.contactName}</CardTitle>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    <div className="text-center">
                                        <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                        <p>কথোপকথন শুরু করুন</p>
                                    </div>
                                </div>
                            ) : (
                                messages.map((msg, index) => {
                                    const isMe = msg.senderId === user?.id;
                                    const showDate = index === 0 ||
                                        formatDate(msg.sentAt) !== formatDate(messages[index - 1].sentAt);

                                    return (
                                        <React.Fragment key={msg.id}>
                                            {showDate && (
                                                <div className="text-center text-xs text-muted-foreground my-2">
                                                    {formatDate(msg.sentAt)}
                                                </div>
                                            )}
                                            <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[70%] rounded-lg px-4 py-2 ${isMe
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-muted'
                                                    }`}>
                                                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                                    <p className={`text-xs mt-1 ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                                        {formatTime(msg.sentAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        </React.Fragment>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </CardContent>
                        <div className="p-4 border-t">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="বার্তা লিখুন... (Type your message)"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                                    disabled={sending}
                                />
                                <Button onClick={handleSend} size="icon" disabled={sending || !message.trim()}>
                                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                            <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">বার্তা দেখতে একটি কথোপকথন নির্বাচন করুন</p>
                            <p className="text-sm mt-1">বাম পাশ থেকে একটি যোগাযোগ নির্বাচন করুন</p>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default MessagesPage;
