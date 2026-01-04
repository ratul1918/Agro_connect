import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Search, Calendar, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api, { BASE_URL } from '../api/axios';

interface BlogPost {
    id: number;
    title: string;
    content: string;
    blogType: string; // 'NORMAL' or 'TIP'
    coverImageUrl?: string;
    createdAt: string;
    authorName: string;
    authorImageUrl?: string;
    authorEmail?: string;
}

const BlogsPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const categories = ["All", "Tips", "Blogs"];

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const res = await api.get('/blogs');
            setBlogPosts(res.data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch blogs:', err);
            setError('Failed to load blogs. Please try again later.');
            setBlogPosts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    const filteredPosts = blogPosts.filter(post => {
        const searchMatch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.content.toLowerCase().includes(searchTerm.toLowerCase());
        const categoryMatch = selectedCategory === 'All' || 
            (selectedCategory === 'Tips' && post.blogType === 'TIP') ||
            (selectedCategory === 'Blogs' && post.blogType === 'NORMAL');
        return searchMatch && categoryMatch;
    });

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    const getExcerpt = (content: string, maxLength: number = 150) => {
        if (content.length <= maxLength) return content;
        return content.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
    };

    const getImageUrl = (imageUrl: string | null | undefined) => {
        if (!imageUrl) return null;
        // If URL is already absolute (starts with http), return as is
        if (imageUrl.startsWith('http')) {
            return imageUrl;
        }
        // If URL is relative, prepend backend URL
        return `${BASE_URL.replace('/api', '')}${imageUrl}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Blogs & Tips</h1>
                    <p className="text-xl text-gray-600 dark:text-white">Expert advice, market insights, and farming best practices</p>
                </div>

                {/* Search & Filter */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <Input
                                placeholder="Search articles..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                        <p className="text-gray-500 dark:text-gray-400 text-lg mt-4">Loading blogs...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="text-center py-12">
                        <p className="text-red-500 text-lg">{error}</p>
                        <Button onClick={fetchBlogs} className="mt-4 bg-green-600 hover:bg-green-700">
                            Try Again
                        </Button>
                    </div>
                )}

                {/* Blog Posts Grid */}
                {!loading && !error && filteredPosts.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPosts.map(post => (
                            <Card key={post.id} className="hover:shadow-lg transition-shadow overflow-hidden flex flex-col">
                                {post.coverImageUrl ? (
                                    <img 
                                        src={getImageUrl(post.coverImageUrl) || ''} 
                                        alt={post.title}
                                        className="w-full h-32 object-cover"
                                        onError={(e) => {
                                            // Fallback to placeholder if image fails to load
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            target.nextElementSibling?.classList.remove('hidden');
                                        }}
                                    />
                                ) : null}
                                <div className={`bg-gradient-to-br from-green-100 to-green-50 h-32 flex items-center justify-center text-6xl ${post.coverImageUrl ? 'hidden' : ''}`}>
                                    {post.blogType === 'TIP' ? '💡' : '📝'}
                                </div>
                                <CardHeader>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
                                            post.blogType === 'TIP' 
                                                ? 'bg-blue-100 text-blue-700' 
                                                : 'bg-green-100 text-green-700'
                                        }`}>
                                            {post.blogType === 'TIP' ? 'Tip' : 'Blog'}
                                        </span>
                                        <span className="flex items-center gap-1 text-xs text-gray-500">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(post.createdAt)}
                                        </span>
                                    </div>
                                    <CardTitle className="text-lg leading-tight">{post.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <p className="text-gray-600 dark:text-white text-sm mb-4">{getExcerpt(post.content)}</p>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-200">
                                        <User className="h-3 w-3" />
                                        {post.authorName}
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
                ) : !loading && !error && filteredPosts.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400 text-lg">
                            {searchTerm || selectedCategory !== 'All' 
                                ? 'No articles found matching your search' 
                                : 'No blog posts published yet'}
                        </p>
                    </div>
                ) : null}

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
