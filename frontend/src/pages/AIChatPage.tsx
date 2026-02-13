import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { useNotification } from '../context/NotificationContext';
import api from '../api/axios';
import { Send, Image as ImageIcon, Loader2, Bot, User } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    image?: string;
}

const AIChatPage: React.FC = () => {
    const { error } = useNotification();
    const [messages, setMessages] = useState<Message[]>([{
        role: 'assistant',
        content: 'আসসালামুআলাইকুম! আমি আপনার কৃষি সহায়ক। আপনার ফসল, চাষাবাদ বা কৃষি সম্পর্কিত যেকোনো প্রশ্ন করতে পারেন। ছবি পাঠাতেও পারেন!'
    }]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                error('Image must be less than 5MB');
                return;
            }
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSend = async () => {
        if (!input.trim() && !selectedImage) return;

        const userMessage: Message = {
            role: 'user',
            content: input,
            image: imagePreview || undefined
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('query', input || 'Analyze this image');
            formData.append('lang', 'bn'); // Bangla

            if (selectedImage) {
                formData.append('image', selectedImage);
            }

            const response = await api.post('/ai/chat', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const aiMessage: Message = {
                role: 'assistant',
                content: response.data.response || response.data.message || 'Sorry, I could not process your request.'
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (err: any) {
            error(err.response?.data?.message || 'Failed to get AI response');
            // Add error message to chat
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'দুঃখিত, একটি সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'
            }]);
        } finally {
            setIsLoading(false);
            setSelectedImage(null);
            setImagePreview(null);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <Card className="h-[calc(100vh-16rem)] flex flex-col">
            <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Bot className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle>কৃষি AI সহায়ক</CardTitle>
                        <CardDescription>আপনার কৃষি বিষয়ক প্রশ্নের উত্তর পান</CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'assistant' && (
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Bot className="h-5 w-5 text-primary" />
                            </div>
                        )}
                        <div className={`max-w-[70%] rounded-lg p-3 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                            }`}>
                            {msg.image && (
                                <img src={msg.image} alt="uploaded" className="rounded-md mb-2 max-w-full h-auto max-h-64 object-contain" />
                            )}
                            <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                        </div>
                        {msg.role === 'user' && (
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                                <User className="h-5 w-5 text-primary-foreground" />
                            </div>
                        )}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex gap-3 justify-start">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Bot className="h-5 w-5 text-primary" />
                        </div>
                        <div className="bg-muted rounded-lg p-3">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </CardContent>

            <div className="p-4 border-t">
                {imagePreview && (
                    <div className="mb-3 relative inline-block">
                        <img src={imagePreview} alt="preview" className="rounded-md h-20 object-cover" />
                        <button
                            onClick={() => {
                                setSelectedImage(null);
                                setImagePreview(null);
                            }}
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs"
                        >
                            ×
                        </button>
                    </div>
                )}
                <div className="flex gap-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading}
                    >
                        <ImageIcon className="h-4 w-4" />
                    </Button>
                    <Textarea
                        placeholder="আপনার প্রশ্ন লিখুন... (Enter চাপুন পাঠাতে)"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                        className="min-h-[2.5rem] max-h-32 resize-none"
                        rows={1}
                    />
                    <Button
                        onClick={handleSend}
                        disabled={isLoading || (!input.trim() && !selectedImage)}
                        size="icon"
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                    ছবি পাঠাতে 📷 বাটন ক্লিক করুন • Bangla এবং English উভয়ে প্রশ্ন করতে পারেন
                </p>
            </div>
        </Card>
    );
};

export default AIChatPage;
