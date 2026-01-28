import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Search, Phone, MessageCircle, MapPin, User, Send, X, Loader2 } from 'lucide-react';
import api, { BASE_URL } from '../api/axios';
import { useNotification } from '../context/NotificationContext';

interface Agronomist {
    id: number;
    fullName: string;
    email: string;
    phone?: string;
    profileImageUrl?: string;
    address?: string;
}

const AgronomistDirectoryPage: React.FC = () => {
    const navigate = useNavigate();
    const { success, error } = useNotification();
    const [searchQuery, setSearchQuery] = useState('');
    const [agronomists, setAgronomists] = useState<Agronomist[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAgronomist, setSelectedAgronomist] = useState<Agronomist | null>(null);
    const [messageContent, setMessageContent] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        fetchAgronomists();
    }, []);

    const fetchAgronomists = async () => {
        try {
            setLoading(true);
            const response = await api.get('/messages/agronomists');
            setAgronomists(response.data);
        } catch (err) {
            console.error('Error fetching agronomists:', err);
            error('Failed to load agronomists');
        } finally {
            setLoading(false);
        }
    };

    const filteredAgronomists = agronomists.filter(a =>
        a.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSendMessage = async () => {
        if (!selectedAgronomist || !messageContent.trim()) return;

        setSending(true);
        try {
            await api.post('/messages', {
                receiverId: selectedAgronomist.id,
                content: messageContent,
                messageType: 'CONSULTATION'
            });
            success(`Message sent to ${selectedAgronomist.fullName}!`);
            setSelectedAgronomist(null);
            setMessageContent('');
            // Navigate to messages page to see the conversation
            navigate('/messages');
        } catch (err) {
            console.error('Error sending message:', err);
            error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const openMessageModal = (agronomist: Agronomist) => {
        setSelectedAgronomist(agronomist);
        setMessageContent('');
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 space-y-6">
                {/* Header */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl flex items-center gap-2">
                            <User className="h-6 w-6 text-green-600" />
                            কৃষিবিদ খুঁজুন (Find Agronomist)
                        </CardTitle>
                        <CardDescription>বিশেষজ্ঞ কৃষিবিদদের সাথে যোগাযোগ করুন</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="নাম বা ইমেইল দিয়ে খুঁজুন..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-12">
                        <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
                        <p className="text-gray-500">Loading agronomists...</p>
                    </div>
                )}

                {/* Results */}
                {!loading && (
                    <div className="grid gap-4">
                        {filteredAgronomists.length === 0 ? (
                            <Card>
                                <CardContent className="py-12 text-center text-muted-foreground">
                                    <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                    <p>কোন কৃষিবিদ পাওয়া যায়নি</p>
                                    <p className="text-sm">অনুসন্ধান পরিবর্তন করে আবার চেষ্টা করুন</p>
                                </CardContent>
                            </Card>
                        ) : (
                            filteredAgronomists.map((agronomist) => (
                                <Card key={agronomist.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex gap-4 flex-1">
                                                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                    {agronomist.profileImageUrl ? (
                                                        <img
                                                            src={`${BASE_URL}${agronomist.profileImageUrl}`}
                                                            alt={agronomist.fullName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <User className="h-8 w-8 text-green-600" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="text-lg font-semibold">{agronomist.fullName}</h3>
                                                        <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                                            <span className="h-1.5 w-1.5 bg-green-500 rounded-full"></span>
                                                            Agronomist
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mb-2">
                                                        {agronomist.email}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                        {agronomist.phone && (
                                                            <div className="flex items-center gap-1">
                                                                <Phone className="h-4 w-4" />
                                                                <span className="font-mono">{agronomist.phone}</span>
                                                            </div>
                                                        )}
                                                        {agronomist.address && (
                                                            <div className="flex items-center gap-1">
                                                                <MapPin className="h-4 w-4" />
                                                                <span>{agronomist.address}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                onClick={() => openMessageModal(agronomist)}
                                                className="gap-2 flex-shrink-0 bg-green-600 hover:bg-green-700"
                                            >
                                                <MessageCircle className="h-4 w-4" />
                                                Message
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                )}

                {/* Info Card */}
                <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                        <p className="text-sm text-green-800">
                            💡 <strong>টিপস:</strong> কৃষিবিদের সাথে বার্তা পাঠালে আপনার ইনবক্সে কথোপকথন দেখা যাবে। Messages আইকনে ক্লিক করে সব কথোপকথন দেখতে পারবেন।
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Message Modal */}
            {selectedAgronomist && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
                        <div className="flex justify-between items-center p-4 border-b">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                    {selectedAgronomist.profileImageUrl ? (
                                        <img
                                            src={`${BASE_URL}${selectedAgronomist.profileImageUrl}`}
                                            alt={selectedAgronomist.fullName}
                                            className="w-full h-full object-cover rounded-full"
                                        />
                                    ) : (
                                        <User className="h-5 w-5 text-green-600" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-semibold">{selectedAgronomist.fullName}</h3>
                                    <p className="text-sm text-gray-500">Agronomist</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedAgronomist(null)}
                                className="p-1 hover:bg-gray-100 rounded"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-4">
                            <Textarea
                                placeholder="আপনার কৃষি সম্পর্কিত প্রশ্ন লিখুন..."
                                value={messageContent}
                                onChange={(e) => setMessageContent(e.target.value)}
                                rows={4}
                                className="w-full mb-4"
                            />
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setSelectedAgronomist(null)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSendMessage}
                                    disabled={sending || !messageContent.trim()}
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                    {sending ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <Send className="h-4 w-4 mr-2" />
                                    )}
                                    Send Message
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgronomistDirectoryPage;
