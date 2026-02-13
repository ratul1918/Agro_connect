import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Cloud, CloudRain, Sun, Wind, Droplets, CloudSnow, CloudLightning, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface WeatherData {
    temperature: number;
    humidity: number;
    windSpeed: number;
    weatherCode: number;
    precipitation: number;
    daily: {
        date: string;
        maxTemp: number;
        minTemp: number;
        weatherCode: number;
    }[];
}

interface WeatherWidgetProps {
    className?: string;
}

// Weather code mapping for Open-Meteo API
const getWeatherInfo = (code: number): { icon: React.ReactNode; description: string; descriptionBn: string } => {
    if (code === 0) return { icon: <Sun className="h-8 w-8 text-yellow-500" />, description: 'Clear sky', descriptionBn: 'পরিষ্কার আকাশ' };
    if (code === 1 || code === 2) return { icon: <Cloud className="h-8 w-8 text-gray-400" />, description: 'Partly cloudy', descriptionBn: 'আংশিক মেঘলা' };
    if (code === 3) return { icon: <Cloud className="h-8 w-8 text-gray-500" />, description: 'Overcast', descriptionBn: 'মেঘাচ্ছন্ন' };
    if (code >= 45 && code <= 48) return { icon: <Cloud className="h-8 w-8 text-gray-400" />, description: 'Foggy', descriptionBn: 'কুয়াশা' };
    if (code >= 51 && code <= 55) return { icon: <CloudRain className="h-8 w-8 text-blue-400" />, description: 'Drizzle', descriptionBn: 'গুঁড়ি গুঁড়ি বৃষ্টি' };
    if (code >= 61 && code <= 65) return { icon: <CloudRain className="h-8 w-8 text-blue-500" />, description: 'Rain', descriptionBn: 'বৃষ্টি' };
    if (code >= 66 && code <= 67) return { icon: <CloudRain className="h-8 w-8 text-blue-600" />, description: 'Freezing rain', descriptionBn: 'জমাট বৃষ্টি' };
    if (code >= 71 && code <= 77) return { icon: <CloudSnow className="h-8 w-8 text-blue-200" />, description: 'Snow', descriptionBn: 'তুষারপাত' };
    if (code >= 80 && code <= 82) return { icon: <CloudRain className="h-8 w-8 text-blue-600" />, description: 'Rain showers', descriptionBn: 'বৃষ্টির ঝাপটা' };
    if (code >= 85 && code <= 86) return { icon: <CloudSnow className="h-8 w-8 text-blue-300" />, description: 'Snow showers', descriptionBn: 'তুষার ঝাপটা' };
    if (code >= 95 && code <= 99) return { icon: <CloudLightning className="h-8 w-8 text-yellow-600" />, description: 'Thunderstorm', descriptionBn: 'বজ্রবৃষ্টি' };
    return { icon: <Cloud className="h-8 w-8 text-gray-400" />, description: 'Unknown', descriptionBn: 'অজানা' };
};

const getSmallWeatherIcon = (code: number): React.ReactNode => {
    if (code === 0) return <Sun className="h-5 w-5 text-yellow-500" />;
    if (code === 1 || code === 2 || code === 3) return <Cloud className="h-5 w-5 text-gray-400" />;
    if (code >= 45 && code <= 48) return <Cloud className="h-5 w-5 text-gray-400" />;
    if (code >= 51 && code <= 67) return <CloudRain className="h-5 w-5 text-blue-400" />;
    if (code >= 71 && code <= 77) return <CloudSnow className="h-5 w-5 text-blue-200" />;
    if (code >= 80 && code <= 86) return <CloudRain className="h-5 w-5 text-blue-500" />;
    if (code >= 95 && code <= 99) return <CloudLightning className="h-5 w-5 text-yellow-600" />;
    return <Cloud className="h-5 w-5 text-gray-400" />;
};

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ className }) => {
    const { language } = useLanguage();
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [location, setLocation] = useState<{ lat: number; lon: number; name: string }>({
        lat: 23.8103,
        lon: 90.4125,
        name: 'Dhaka'
    });

    useEffect(() => {
        // Try to get user's location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude,
                        name: language === 'bn' ? 'আপনার অবস্থান' : 'Your Location'
                    });
                },
                () => {
                    // If geolocation fails, use default Dhaka location
                    console.log('Geolocation not available, using default location');
                }
            );
        }
    }, [language]);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                setLoading(true);
                // Using Open-Meteo API (free, no API key required)
                const response = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FDhaka&forecast_days=5`
                );

                if (!response.ok) {
                    throw new Error('Weather data not available');
                }

                const data = await response.json();

                setWeather({
                    temperature: Math.round(data.current.temperature_2m),
                    humidity: data.current.relative_humidity_2m,
                    windSpeed: Math.round(data.current.wind_speed_10m),
                    weatherCode: data.current.weather_code,
                    precipitation: data.current.precipitation,
                    daily: data.daily.time.map((date: string, index: number) => ({
                        date,
                        maxTemp: Math.round(data.daily.temperature_2m_max[index]),
                        minTemp: Math.round(data.daily.temperature_2m_min[index]),
                        weatherCode: data.daily.weather_code[index]
                    }))
                });
                setError(null);
            } catch (err) {
                console.error('Failed to fetch weather:', err);
                setError(language === 'bn' ? 'আবহাওয়া তথ্য লোড করতে ব্যর্থ' : 'Failed to load weather data');
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
        // Refresh weather every 30 minutes
        const interval = setInterval(fetchWeather, 30 * 60 * 1000);
        return () => clearInterval(interval);
    }, [location, language]);

    const formatDay = (dateStr: string): string => {
        const date = new Date(dateStr);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) {
            return language === 'bn' ? 'আজ' : 'Today';
        }
        if (date.toDateString() === tomorrow.toDateString()) {
            return language === 'bn' ? 'আগামীকাল' : 'Tomorrow';
        }

        const days = language === 'bn'
            ? ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি']
            : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days[date.getDay()];
    };

    if (loading) {
        return (
            <Card className={className}>
                <CardContent className="flex items-center justify-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
            </Card>
        );
    }

    if (error || !weather) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Cloud className="h-5 w-5" />
                        {language === 'bn' ? 'আবহাওয়া' : 'Weather'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center">{error || (language === 'bn' ? 'তথ্য উপলব্ধ নয়' : 'Data not available')}</p>
                </CardContent>
            </Card>
        );
    }

    const currentWeather = getWeatherInfo(weather.weatherCode);

    return (
        <Card className={`${className} overflow-hidden`}>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                    <Cloud className="h-5 w-5" />
                    {language === 'bn' ? 'আবহাওয়া পূর্বাভাস' : 'Weather Forecast'}
                </CardTitle>
                <CardDescription>{location.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Current Weather */}
                <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/30 dark:to-green-950/30 rounded-lg p-4">
                    <div className="flex items-center gap-4">
                        {currentWeather.icon}
                        <div>
                            <div className="text-4xl font-bold">{weather.temperature}°C</div>
                            <div className="text-muted-foreground">
                                {language === 'bn' ? currentWeather.descriptionBn : currentWeather.description}
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                            <Droplets className="h-4 w-4 text-blue-500" />
                            <span>{language === 'bn' ? 'আর্দ্রতা' : 'Humidity'}: {weather.humidity}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Wind className="h-4 w-4 text-gray-500" />
                            <span>{language === 'bn' ? 'বাতাস' : 'Wind'}: {weather.windSpeed} km/h</span>
                        </div>
                        {weather.precipitation > 0 && (
                            <div className="flex items-center gap-2">
                                <CloudRain className="h-4 w-4 text-blue-500" />
                                <span>{language === 'bn' ? 'বৃষ্টি' : 'Rain'}: {weather.precipitation} mm</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 5-Day Forecast */}
                <div>
                    <h4 className="text-sm font-medium mb-2">
                        {language === 'bn' ? '৫ দিনের পূর্বাভাস' : '5-Day Forecast'}
                    </h4>
                    <div className="grid grid-cols-5 gap-2">
                        {weather.daily.map((day, index) => (
                            <div
                                key={index}
                                className="flex flex-col items-center p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                            >
                                <span className="text-xs font-medium">{formatDay(day.date)}</span>
                                {getSmallWeatherIcon(day.weatherCode)}
                                <div className="text-xs mt-1">
                                    <span className="font-medium">{day.maxTemp}°</span>
                                    <span className="text-muted-foreground">/{day.minTemp}°</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Farming Tips based on weather */}
                <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">
                        {language === 'bn' ? '🌾 কৃষি পরামর্শ' : '🌾 Farming Tip'}
                    </h4>
                    <p className="text-xs text-green-600 dark:text-green-500">
                        {weather.weatherCode >= 61 && weather.weatherCode <= 82
                            ? (language === 'bn'
                                ? 'বৃষ্টির সময় ফসলে সেচ এড়িয়ে চলুন। পানি নিষ্কাশন নিশ্চিত করুন।'
                                : 'Avoid irrigation during rain. Ensure proper drainage for crops.')
                            : weather.weatherCode === 0 && weather.temperature > 35
                            ? (language === 'bn'
                                ? 'গরম আবহাওয়ায় সকাল বা সন্ধ্যায় সেচ দিন। ফসলে মালচিং করুন।'
                                : 'Water crops in early morning or evening during hot weather. Consider mulching.')
                            : weather.humidity > 80
                            ? (language === 'bn'
                                ? 'উচ্চ আর্দ্রতায় ছত্রাকজনিত রোগের ঝুঁকি বেশি। ফসল পর্যবেক্ষণ করুন।'
                                : 'High humidity increases risk of fungal diseases. Monitor your crops closely.')
                            : (language === 'bn'
                                ? 'আজকের আবহাওয়া কৃষি কাজের জন্য উপযুক্ত।'
                                : 'Today\'s weather is suitable for farming activities.')
                        }
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};

export default WeatherWidget;
