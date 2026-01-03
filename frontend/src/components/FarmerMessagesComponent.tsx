import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, Users, Mail, MailOpen, Trash2, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '@/api/axios';

interface Message {
    id: number;
    senderId: number;
    receiverId: number;
    content: string;
    messageType: string;
    isRead: boolean;
    createdAt: string;
    senderName: string;
    senderEmail: string;
    senderRole: string;
    receiverName: string;
    receiverEmail: string;
    receiverRole: string;
}

interface User {
    id: number;
    fullName: string;
    email: string;
    profileImageUrl?: string;
}

const FarmerMessagesComponent: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [agronomists, setAgronomists] = useState<User[]>([]);
    const [selectedAgronomist, setSelectedAgronomist] = useState<User | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox');
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchMessages();
        fetchAgronomists();
        fetchUnreadCount();
    }, []);

    const fetchMessages = async () => {
        try {
            const response = await api.get(`/messages/${activeTab}`);
            setMessages(response.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const fetchAgronomists = async () => {
        try {
            const response = await api.get('/messages/agronomists');
            setAgronomists(response.data);
        } catch (error) {
            console.error('Error fetching agronomists:', error);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const response = await api.get('/messages/unread/count');
            setUnreadCount(response.data.count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const fetchConversation = async (agronomistId: number) => {
        try {
            const response = await api.get(`/messages/conversation/${agronomistId}`);
            setMessages(response.data);
            // Mark conversation as read
            await api.put(`/messages/conversation/${agronomistId}/read`);
            fetchUnreadCount();
        } catch (error) {
            console.error('Error fetching conversation:', error);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedAgronomist) return;

        setLoading(true);
        try {
            await api.post('/messages', {
                receiverId: selectedAgronomist.id,
                content: newMessage,
                messageType: 'CONSULTATION'
            });
            setNewMessage('');
            // Refresh conversation
            fetchConversation(selectedAgronomist.id);
        } catch (error) {
            console.error('Error sending message:', error);
        }
        setLoading(false);
    };

    const deleteMessage = async (messageId: number) => {
        try {
            await api.delete(`/messages/${messageId}`);
            fetchMessages();
            fetchUnreadCount();
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    const filteredAgronomists = agronomists.filter(agronomist =>
        agronomist.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agronomist.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredMessages = messages.filter(message => {
        if (selectedAgronomist) {
            return message.senderId === selectedAgronomist.id || message.receiverId === selectedAgronomist.id;
        }
        return true;
    });

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Agronomists List */}
            <div className="lg:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Agronomists
                        </CardTitle>
                        <Input
                            placeholder="Search agronomists..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full"
                        />
                    </CardHeader>
                    <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                        {filteredAgronomists.map(agronomist => (
                            <div
                                key={agronomist.id}
                                onClick={() => {
                                    setSelectedAgronomist(agronomist);
                                    fetchConversation(agronomist.id);
                                }}
                                className={`p-3 rounded cursor-pointer transition-colors ${
                                    selectedAgronomist?.id === agronomist.id
                                        ? 'bg-green-100 border-green-300 border'
                                        : 'hover:bg-gray-100'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
                                        <User className="h-5 w-5 text-green-700" />
                                    </div>
                                    <div>
                                        <div className="font-medium">{agronomist.fullName}</div>
                                        <div className="text-sm text-gray-500">{agronomist.email}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Messages Area */}
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MessageCircle className="h-5 w-5" />
                                Consultation Messages
                                {unreadCount > 0 && (
                                    <Badge variant="destructive">{unreadCount}</Badge>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant={activeTab === 'inbox' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => {
                                        setActiveTab('inbox');
                                        fetchMessages();
                                    }}
                                >
                                    <Mail className="h-4 w-4 mr-1" />
                                    Inbox
                                </Button>
                                <Button
                                    variant={activeTab === 'sent' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => {
                                        setActiveTab('sent');
                                        fetchMessages();
                                    }}
                                >
                                    <Send className="h-4 w-4 mr-1" />
                                    Sent
                                </Button>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {selectedAgronomist ? (
                            <div>
                                <div className="mb-4 p-3 bg-green-50 rounded">
                                    <div className="font-medium">{selectedAgronomist.fullName}</div>
                                    <div className="text-sm text-gray-500">{selectedAgronomist.email}</div>
                                </div>
                                
                                {/* Messages */}
                                <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                                    {filteredMessages.map(message => (
                                        <div
                                            key={message.id}
                                            className={`p-3 rounded ${
                                                message.senderRole === 'ROLE_FARMER'
                                                    ? 'bg-blue-50 ml-8'
                                                    : 'bg-gray-50 mr-8'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="font-medium text-sm">
                                                        {message.senderRole === 'ROLE_FARMER' ? 'You' : message.senderName}
                                                    </div>
                                                    <div>{message.content}</div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {formatTime(message.createdAt)}
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => deleteMessage(message.id)}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* New Message Input */}
                                <div className="flex gap-2">
                                    <Textarea
                                        placeholder="Ask your agricultural question..."
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                        className="flex-1"
                                        rows={2}
                                    />
                                    <Button
                                        onClick={sendMessage}
                                        disabled={loading || !newMessage.trim()}
                                        className="self-end"
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 py-8">
                                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                <p>Select an agronomist to start consultation</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default FarmerMessagesComponent;