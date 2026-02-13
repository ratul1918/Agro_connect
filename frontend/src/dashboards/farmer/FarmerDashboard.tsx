import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sprout, TrendingUp, MessageCircle, AlertTriangle } from 'lucide-react';

const FarmerDashboard = () => {
    return (
        <div className="space-y-6 font-bangla">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-primary">কৃষক ড্যাশবোর্ড (Farmer Dashboard)</h1>
                <Button>নতুন ফসল যোগ করুন (Add Crop)</Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">মোট আয় (Total Earnings)</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">৳ ১৫,০০০</div>
                        <p className="text-xs text-muted-foreground">+২০% গত মাস থেকে</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">সক্রিয় ফসল (Active Crops)</CardTitle>
                        <Sprout className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">৫ টি</div>
                        <p className="text-xs text-muted-foreground">আলু, টমেটো, ধান...</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">নতুন বার্তা (New Messages)</CardTitle>
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">৩ টি</div>
                        <p className="text-xs text-muted-foreground">ক্রেতা এবং পরামর্শক থেকে</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">সতর্কবর্তা (Alerts)</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">বন্যা সতর্কতা</div>
                        <p className="text-xs text-muted-foreground">আগামী ৩ দিন ভারী বৃষ্টিপাত হতে পারে</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Orders / Activity Section could go here */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>হোলসেল অর্ডার (Wholesale Orders)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">কোনো নতুন অর্ডার নেই।</p>
                    </CardContent>
                </Card>
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>আবহাওয়ার পূর্বাভাস (Weather Forecast)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <span className="text-4xl">🌤</span>
                            <div>
                                <p className="font-bold">আজ: ২৮°C</p>
                                <p className="text-sm text-muted-foreground">আংশিক মেঘলা</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default FarmerDashboard;
