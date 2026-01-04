import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Calendar, User, ArrowLeft, Tag, Eye, Loader2 } from 'lucide-react';
import api from '../api/axios';

interface Blog {
    id: number;
    title: string;
    content: string;
    coverImageUrl: string;
    blogType: 'NORMAL' | 'TIP';
    isPublished: boolean;
    viewCount: number;
    createdAt: string;
    authorName?: string;
    authorImageUrl?: string;
}

const BlogDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [blog, setBlog] = useState<Blog | null>(null);
    const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBlog = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch the specific blog
                const res = await api.get(`/blogs/${id}`);
                setBlog(res.data);
                
                // Fetch all blogs for "related" section
                const allRes = await api.get('/blogs');
                const allBlogs = allRes.data as Blog[];
                // Filter out current blog and get related by same type
                const related = allBlogs
                    .filter((b: Blog) => b.id !== parseInt(id || '0') && b.blogType === res.data.blogType)
                    .slice(0, 3);
                setRelatedBlogs(related);
            } catch (err) {
                console.error('Failed to fetch blog', err);
                setError('Failed to load blog post');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchBlog();
        }
    }, [id]);

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
        } catch {
            return dateString;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Loading blog post...</p>
                </div>
            </div>
        );
    }

    if (error || !blog) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Card className="bg-white dark:bg-gray-800">
                        <CardContent className="py-12 text-center">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Blog Post Not Found</h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">{error || "The blog post you're looking for doesn't exist."}</p>
                            <Button onClick={() => navigate('/blogs')} className="bg-green-600 hover:bg-green-700">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Blogs
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    onClick={() => navigate('/blogs')}
                    className="mb-6 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Blogs
                </Button>

                {/* Blog Content */}
                <Card className="overflow-hidden bg-white dark:bg-gray-800">
                    {/* Header Image */}
                    {blog.coverImageUrl ? (
                        <div className="h-64 md:h-80 overflow-hidden">
                            <img 
                                src={blog.coverImageUrl.startsWith('http') ? blog.coverImageUrl : `http://localhost:8080${blog.coverImageUrl}`}
                                alt={blog.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="bg-gradient-to-br from-green-100 to-green-50 h-48 flex items-center justify-center">
                            <span className="text-8xl">
                                {blog.blogType === 'TIP' ? '🌿' : '📄'}
                            </span>
                        </div>
                    )}

                    <CardHeader className="space-y-4">
                        {/* Category Badge */}
                        <div className="flex items-center gap-2">
                            <span className="inline-block bg-green-100 text-green-700 text-sm font-semibold px-4 py-1.5 rounded-full">
                                <Tag className="inline h-3 w-3 mr-1" />
                                {blog.blogType === 'TIP' ? 'Agricultural Tip' : 'Blog Post'}
                            </span>
                            {!blog.isPublished && (
                                <span className="inline-block bg-yellow-100 text-yellow-700 text-sm font-semibold px-4 py-1.5 rounded-full">
                                    Draft
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <CardTitle className="text-3xl md:text-4xl leading-tight">
                            {blog.title}
                        </CardTitle>

                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-200 text-sm">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span>{blog.authorName || 'Unknown Author'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(blog.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Eye className="h-4 w-4" />
                                <span>{blog.viewCount} views</span>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="prose prose-lg dark:prose-invert max-w-none">
                        {/* Content with proper formatting */}
                        <div className="text-gray-700 dark:text-white leading-relaxed space-y-4">
                            {blog.content.split('\n\n').map((paragraph, index) => {
                                // Check if paragraph is a heading (starts with **)
                                if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                                    const headingText = paragraph.replace(/\*\*/g, '');
                                    return (
                                        <h3 key={index} className="text-xl font-bold text-gray-900 dark:text-white mt-6 mb-3">
                                            {headingText}
                                        </h3>
                                    );
                                }
                                // Split by single newlines for regular paragraphs
                                return (
                                    <div key={index} className="space-y-2">
                                        {paragraph.split('\n').map((line, lineIndex) => (
                                            <p key={lineIndex} className="text-base">
                                                {line}
                                            </p>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Related Posts Section */}
                {relatedBlogs.length > 0 && (
                    <div className="mt-12">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">More Articles</h3>
                        <div className="grid md:grid-cols-3 gap-6">
                            {relatedBlogs.map(relatedBlog => (
                                <Link
                                    key={relatedBlog.id}
                                    to={`/blogs/${relatedBlog.id}`}
                                    className="group"
                                >
                                    <Card className="hover:shadow-lg transition-shadow h-full overflow-hidden">
                                        {relatedBlog.coverImageUrl ? (
                                            <div className="h-32 overflow-hidden">
                                                <img 
                                                    src={relatedBlog.coverImageUrl.startsWith('http') ? relatedBlog.coverImageUrl : `http://localhost:8080${relatedBlog.coverImageUrl}`}
                                                    alt={relatedBlog.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                        ) : (
                                            <div className="bg-gradient-to-br from-green-100 to-green-50 h-24 flex items-center justify-center text-4xl">
                                                {relatedBlog.blogType === 'TIP' ? '🌿' : '📄'}
                                            </div>
                                        )}
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg group-hover:text-green-600 transition-colors line-clamp-2">
                                                {relatedBlog.title}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-gray-600 dark:text-white line-clamp-2">
                                                {relatedBlog.content?.substring(0, 100)}...
                                            </p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogDetailPage;
