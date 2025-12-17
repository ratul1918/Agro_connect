import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Search, Phone, MessageCircle, MapPin, User } from 'lucide-react';
import toast from 'react-hot-toast';

interface Agronomist {
    id: number;
    name: string;
    phone: string;
    specialization: string;
    division: string;
    district: string;
    experience: string;
    available: boolean;
}

const AgronomistDirectoryPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDivision, setSelectedDivision] = useState('all');
    const [selectedDistrict, setSelectedDistrict] = useState('all');

    // Mock data - TODO: Fetch from API
    const agronomists: Agronomist[] = [
        { id: 1, name: 'ডঃ সালমা আক্তার', phone: '০১৭১২৩৪৫৬৭৮', specialization: 'Crop Disease', division: 'Dhaka', district: 'Dhaka', experience: '10 years', available: true },
        { id: 2, name: 'ডঃ করিম হোসেন', phone: '০১৮১২৩৪৫৬৭৮', specialization: 'Soil Science', division: 'Dhaka', district: 'Gazipur', experience: '8 years', available: true },
        { id: 3, name: 'ডঃ রহিমা বেগম', phone: '০১৯১২৩৪৫৬৭৮', specialization: 'Pest Management', division: 'Chittagong', district: 'Chittagong', experience: '12 years', available: false },
        { id: 4, name: 'ডঃ জাহিদ ইসলাম', phone: '০১৬১২৩৪৫৬৭৮', specialization: 'Water Management', division: 'Rajshahi', district: 'Rajshahi', experience: '6 years', available: true },
    ];

    const divisions = ['all', ...Array.from(new Set(agronomists.map(a => a.division)))];
    const districts = selectedDivision === 'all'
        ? ['all', ...Array.from(new Set(agronomists.map(a => a.district)))]
        : ['all', ...Array.from(new Set(agronomists.filter(a => a.division === selectedDivision).map(a => a.district)))];

    const filteredAgronomists = agronomists.filter(a => {
        const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.specialization.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDivision = selectedDivision === 'all' || a.division === selectedDivision;
        const matchesDistrict = selectedDistrict === 'all' || a.district === selectedDistrict;
        return matchesSearch && matchesDivision && matchesDistrict;
    });

    const handleSendMessage = (agronomist: Agronomist) => {
        // TODO: Create conversation and navigate to messages
        toast.success(`Starting conversation with ${agronomist.name}`, {
            icon: '💬',
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">কৃষিবিদ খুঁজুন (Find Agronomist)</CardTitle>
                    <CardDescription>বিশেষজ্ঞ কৃষিবিদদের সাথে যোগাযোগ করুন</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="নাম বা বিশেষত্ব দিয়ে খুঁজুন..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    {/* Filters */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">বিভাগ (Division)</label>
                            <select
                                value={selectedDivision}
                                onChange={(e) => {
                                    setSelectedDivision(e.target.value);
                                    setSelectedDistrict('all');
                                }}
                                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                            >
                                {divisions.map(div => (
                                    <option key={div} value={div}>
                                        {div === 'all' ? 'সব বিভাগ (All)' : div}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">জেলা (District)</label>
                            <select
                                value={selectedDistrict}
                                onChange={(e) => setSelectedDistrict(e.target.value)}
                                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                            >
                                {districts.map(dist => (
                                    <option key={dist} value={dist}>
                                        {dist === 'all' ? 'সব জেলা (All)' : dist}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Results */}
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
                        <Card key={agronomist.id}>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex gap-4 flex-1">
                                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <User className="h-8 w-8 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-lg font-semibold">{agronomist.name}</h3>
                                                {agronomist.available && (
                                                    <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                                        <span className="h-1.5 w-1.5 bg-green-500 rounded-full"></span>
                                                        Available
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-2">
                                                <span className="font-medium">বিশেষত্ব:</span> {agronomist.specialization} • {agronomist.experience}
                                            </p>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="h-4 w-4" />
                                                    <span>{agronomist.district}, {agronomist.division}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Phone className="h-4 w-4" />
                                                    <span className="font-mono">{agronomist.phone}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => handleSendMessage(agronomist)}
                                        className="gap-2 flex-shrink-0"
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

            {/* Info Card */}
            <Card className="bg-muted/50">
                <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">
                        💡 <strong>টিপস:</strong> কৃষিবিদের সাথে বার্তা পাঠালে আপনার ইনবক্সে কথোপকথন দেখা যাবে। ফোনে সরাসরি যোগাযোগও করতে পারেন।
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

export default AgronomistDirectoryPage;
