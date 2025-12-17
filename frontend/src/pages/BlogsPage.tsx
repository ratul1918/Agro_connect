import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Search, Calendar, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BlogPost {
    id: number;
    title: string;
    excerpt: string;
    content: string;
    author: string;
    date: string;
    category: string;
    image: string;
}

const BlogsPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const categories = ["All", "Farming Tips", "Market Trends", "Pest Management", "Organic Farming", "Technology"];

    const blogPosts: BlogPost[] = [
        {
            id: 1,
            title: "10 Tips for Organic Tomato Farming",
            excerpt: "Learn the best practices to grow organic tomatoes without chemical pesticides...",
            content: "Growing organic tomatoes requires proper soil preparation, regular watering, and natural pest control methods. In this comprehensive guide, we cover everything from seed selection to harvest.",
            author: "Md. Karim",
            date: "Dec 10, 2024",
            category: "Organic Farming",
            image: "🍅"
        },
        {
            id: 2,
            title: "Understanding Market Prices: A Farmer's Guide",
            excerpt: "How to track and predict agricultural prices for better decision making...",
            content: "Market prices fluctuate based on supply, demand, and seasonal factors. This guide helps farmers understand price trends and negotiate better deals.",
            author: "Fatima Khan",
            date: "Dec 8, 2024",
            category: "Market Trends",
            image: "📊"
        },
        {
            id: 3,
            title: "Best Practices for Rice Cultivation",
            excerpt: "Maximize your rice yield with these proven cultivation techniques...",
            content: "Rice farming has been central to Bangladesh's agriculture for centuries. Modern techniques combined with traditional knowledge can significantly increase productivity.",
            author: "Abdul Rahman",
            date: "Dec 5, 2024",
            category: "Farming Tips",
            image: "🌾"
        },
        {
            id: 4,
            title: "Managing Pest Problems Naturally",
            excerpt: "Effective organic methods to protect crops from common pests...",
            content: "Chemical pesticides harm the environment and increase costs. Learn natural pest management techniques that are both effective and sustainable.",
            author: "Dr. Aisha Ahmed",
            date: "Dec 1, 2024",
            category: "Pest Management",
            image: "🐛"
        },
        {
            id: 5,
            title: "IoT Technology in Modern Farming",
            excerpt: "How sensors and data analytics are transforming agriculture...",
            content: "Internet of Things (IoT) technology allows farmers to monitor soil moisture, temperature, and crop health in real-time, leading to better decision making.",
            author: "Karim Rahman",
            date: "Nov 28, 2024",
            category: "Technology",
            image: "📱"
        },
        {
            id: 6,
            title: "Seasonal Vegetable Planting Guide",
            excerpt: "Know when and what to plant for maximum yield throughout the year...",
            content: "Bangladesh's climate allows for multiple harvests throughout the year. This guide helps you plan what vegetables to grow in each season.",
            author: "Hasan Ali",
            date: "Nov 25, 2024",
            category: "Farming Tips",
            image: "🥬"
        }
    ];

    const filteredPosts = blogPosts.filter(post => {
        const searchMatch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
        const categoryMatch = selectedCategory === 'All' || post.category === selectedCategory;
        return searchMatch && categoryMatch;
    });

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Blogs & Tips</h1>
                    <p className="text-xl text-gray-600">Expert advice, market insights, and farming best practices</p>
                </div>

                {/* Search & Filter */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <Input
                                placeholder="Search articles..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-2">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Blog Posts Grid */}
                {filteredPosts.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPosts.map(post => (
                            <Card key={post.id} className="hover:shadow-lg transition-shadow overflow-hidden flex flex-col">
                                <div className="bg-gradient-to-br from-green-100 to-green-50 h-32 flex items-center justify-center text-6xl">
                                    {post.image}
                                </div>
                                <CardHeader>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                                            {post.category}
                                        </span>
                                        <span className="flex items-center gap-1 text-xs text-gray-500">
                                            <Calendar className="h-3 w-3" />
                                            {post.date}
                                        </span>
                                    </div>
                                    <CardTitle className="text-lg leading-tight">{post.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <p className="text-gray-600 text-sm mb-4">{post.excerpt}</p>
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <User className="h-3 w-3" />
                                        {post.author}
                                    </div>
                                </CardContent>
                                <div className="px-6 pb-6">
                                    <Link to={`/blogs/${post.id}`}>
                                        <Button className="w-full bg-green-600 hover:bg-green-700 group">
                                            Read More
                                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No articles found matching your search</p>
                    </div>
                )}

                {/* Newsletter Signup */}
                <section className="mt-16 bg-gradient-to-br from-green-600 to-green-800 text-white rounded-lg p-8">
                    <div className="max-w-2xl mx-auto text-center">
                        <h2 className="text-2xl font-bold mb-2">Subscribe to Our Newsletter</h2>
                        <p className="text-green-100 mb-6">Get weekly farming tips, market insights, and agricultural news delivered to your inbox</p>
                        <div className="flex gap-2">
                            <Input
                                type="email"
                                placeholder="Enter your email..."
                                className="bg-white text-gray-900"
                            />
                            <Button className="bg-white text-green-600 hover:bg-green-50">Subscribe</Button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default BlogsPage;
