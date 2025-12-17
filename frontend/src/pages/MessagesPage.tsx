import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Send, User, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Contact {
    id: number;
    name: string;
    role: string;
    lastMessage: string;
    unread: number;
    online: boolean;
}

const MessagesPage: React.FC = () => {
    const { user } = useAuth();
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [message, setMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [conversations, setConversations] = useState<Contact[]>([]);


    // Initialize contacts in state - TODO: Fetch from API
    React.useEffect(() => {
        const initialContacts: Contact[] = user?.role === 'ROLE_FARMER' ? [
            // Agronomists (main contacts for farmers)
            { id: 1, name: 'ডঃ সালমা (Agronomist)', role: 'AGRONOMIST', lastMessage: 'ফসলের রোগ সম্পর্কে...', unread: 1, online: true },
            { id: 2, name: 'ডঃ করিম (Agronomist)', role: 'AGRONOMIST', lastMessage: 'সার ব্যবহারের পরামর্শ', unread: 0, online: false },
            // Bid notifications (auto-generated when buyer places bid)
            { id: 3, name: '🔔 Bid: রহিম খান (Buyer)', role: 'BUYER', lastMessage: 'আপনার টমেটোর জন্য বিড দিয়েছে - ৳120/kg', unread: 1, online: false },
        ] : [
            // For other roles, show relevant contacts
            { id: 1, name: 'করিম মিয়া (Farmer)', role: 'FARMER', lastMessage: 'ধন্যবাদ', unread: 0, online: true },
            { id: 2, name: 'রহিম খান (Buyer)', role: 'BUYER', lastMessage: 'আপনার ফসলের দাম কত?', unread: 2, online: true },
        ];
        setConversations(initialContacts);
    }, [user]);

    const filteredContacts = conversations.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDeleteChat = (contactId: number, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent selecting the contact

        // Use toast.promise for async deletion with loading/success/error states
        const deletePromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                setConversations(prev => prev.filter(c => c.id !== contactId));
                if (selectedContact?.id === contactId) {
                    setSelectedContact(null);
                }
                resolve('Conversation deleted');
            }, 300);
        });

        toast.promise(deletePromise, {
            loading: 'Deleting conversation...',
            success: 'Conversation deleted successfully',
            error: 'Failed to delete conversation',
        });
    };

    const handleSend = () => {
        if (!message.trim()) return;
        // TODO: Send message via WebSocket
        console.log('Sending message:', message);
        setMessage('');
    };

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
                        {filteredContacts.map((contact) => (
                            <div
                                key={contact.id}
                                className={`group relative border-b hover:bg-muted transition-colors ${selectedContact?.id === contact.id ? 'bg-muted' : ''
                                    }`}
                            >
                                <button
                                    onClick={() => setSelectedContact(contact)}
                                    className="w-full p-4 text-left"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="relative">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <User className="h-5 w-5 text-primary" />
                                            </div>
                                            {contact.online && (
                                                <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background"></div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-medium truncate">{contact.name}</h4>
                                                {contact.unread > 0 && (
                                                    <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                                                        {contact.unread}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground truncate">{contact.lastMessage}</p>
                                        </div>
                                    </div>
                                </button>
                                <button
                                    onClick={(e) => handleDeleteChat(contact.id, e)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-destructive transition-opacity"
                                    title="Delete conversation"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Chat Area */}
            <Card className="md:col-span-2 flex flex-col">
                {selectedContact ? (
                    <>
                        <CardHeader className="border-b">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User className="h-5 w-5 text-primary" />
                                    </div>
                                    {selectedContact.online && (
                                        <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background"></div>
                                    )}
                                </div>
                                <div>
                                    <CardTitle className="text-lg">{selectedContact.name}</CardTitle>
                                    <CardDescription>
                                        {selectedContact.online ? 'Online' : 'Offline'}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto p-4">
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                <div className="text-center">
                                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                    <p>Start a conversation with {selectedContact.name}</p>
                                    <p className="text-sm mt-1">Real-time messaging coming soon</p>
                                </div>
                            </div>
                        </CardContent>
                        <div className="p-4 border-t">
                            <div className="flex gap-2">
                                <Textarea
                                    placeholder="বার্তা লিখুন... (Type your message)"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                                    className="min-h-[2.5rem] max-h-32 resize-none"
                                    rows={1}
                                />
                                <Button onClick={handleSend} size="icon">
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                            <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">Select a contact to start messaging</p>
                            <p className="text-sm mt-1">Choose from your contacts on the left</p>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default MessagesPage;
