import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Send, User, Search, Loader2, Trash2 } from 'lucide-react';
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
    const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; chatId: number | null }>({ show: false, chatId: null });
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch chats
    const fetchChats = async () => {
        try {
            const response = await api.get('/messenger/chats');
            // Map response to expected format
            const mapped = response.data.map((chat: any) => ({
                chatId: chat.chat_id,
                contactId: chat.other_user_id,
                contactName: chat.other_user_name,
                lastMessage: chat.last_message,
                lastUpdated: chat.last_updated,
                unreadCount: chat.unread_count
            }));
            setChats(mapped);
        } catch (error) {
            console.error('Failed to fetch chats:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch messages for a chat
    const fetchMessages = async (chatId: number) => {
        try {
            const response = await api.get(`/messenger/chats/${chatId}/messages`);
            // Map response to expected format
            const mapped = response.data.map((msg: any) => ({
                id: msg.id,
                chatId: msg.chat_id,
                senderId: msg.sender_id,
                content: msg.content,
                isRead: msg.is_read,
                sentAt: msg.sent_at
            })).reverse(); // Reverse to show oldest first
            setMessages(mapped);
            // Mark as read
            await api.post(`/messenger/chats/${chatId}/read`);
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
            await api.post(`/messenger/chats/${selectedChat.chatId}/messages`, { content: message });
            setMessage('');
            fetchMessages(selectedChat.chatId);
        } catch (error) {
            toast.error('বার্তা পাঠাতে ব্যর্থ হয়েছে');
        } finally {
            setSending(false);
        }
    };

    const handleDeleteChat = (chatId: number, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent selecting the chat
        setDeleteConfirm({ show: true, chatId });
    };

    const confirmDeleteChat = async () => {
        if (!deleteConfirm.chatId) return;

        try {
            await api.delete(`/messenger/chats/${deleteConfirm.chatId}`);
            toast.success('কথোপকথন মুছে ফেলা হয়েছে');
            setChats(prev => prev.filter(c => c.chatId !== deleteConfirm.chatId));
            if (selectedChat?.chatId === deleteConfirm.chatId) {
                setSelectedChat(null);
                setMessages([]);
            }
        } catch (error) {
            toast.error('মুছে ফেলতে ব্যর্থ হয়েছে');
        }
        setDeleteConfirm({ show: false, chatId: null });
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
        <div className="grid md:grid-cols-3 gap-6 h-[calc(100vh-5rem)]">
            {/* Contacts List */}
            <Card className="md:col-span-1 flex flex-col h-full overflow-hidden">
                <CardHeader className="flex-shrink-0">
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        বার্তা (Messages)
                    </CardTitle>
                    <CardDescription>আপনার কথোপকথন</CardDescription>
                </CardHeader>
                <CardContent className="p-0 flex flex-col flex-1 min-h-0">
                    <div className="p-4 border-b flex-shrink-0">
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
                    <div className="overflow-y-auto flex-1">
                        {filteredChats.length === 0 ? (
                            <div className="p-6 text-center text-muted-foreground">
                                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>কোনো বার্তা নেই</p>
                                <p className="text-sm mt-1">বিড করলে স্বয়ংক্রিয় বার্তা আসবে</p>
                            </div>
                        ) : (
                            filteredChats.map((chat) => (
                                <div
                                    key={chat.chatId}
                                    className={`group relative w-full p-4 text-left border-b hover:bg-muted transition-colors cursor-pointer ${selectedChat?.chatId === chat.chatId ? 'bg-muted' : ''
                                        }`}
                                    onClick={() => setSelectedChat(chat)}
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
                                        <button
                                            onClick={(e) => handleDeleteChat(chat.chatId, e)}
                                            className="opacity-0 group-hover:opacity-100 p-2 rounded-md hover:bg-destructive/10 text-destructive transition-opacity"
                                            title="মুছে ফেলুন"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Chat Area */}
            <Card className="md:col-span-2 flex flex-col h-full overflow-hidden">
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

            {/* Delete Confirmation Modal */}
            {deleteConfirm.show && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-background rounded-lg p-6 max-w-sm mx-4 shadow-xl">
                        <h3 className="text-lg font-semibold mb-2">কথোপকথন মুছে ফেলুন</h3>
                        <p className="text-muted-foreground mb-4">এই কথোপকথন মুছে ফেলতে চান? এটি পুনরুদ্ধার করা যাবে না।</p>
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setDeleteConfirm({ show: false, chatId: null })}>
                                বাতিল
                            </Button>
                            <Button variant="destructive" onClick={confirmDeleteChat}>
                                মুছে ফেলুন
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessagesPage;
