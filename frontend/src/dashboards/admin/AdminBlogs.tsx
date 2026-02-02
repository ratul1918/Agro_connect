import React from 'react';
import { Trash2, Edit, BookOpen, User, Calendar, ArrowRight, Eye } from 'lucide-react';
import { BASE_URL } from '../../api/axios';
import { motion } from 'framer-motion';

interface AdminBlogsProps {
    blogs: any[];
    handleDeleteBlog: (id: number) => void;
}

const AdminBlogs: React.FC<AdminBlogsProps> = ({ blogs, handleDeleteBlog }) => {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="glass-card rounded-3xl border border-white/20 dark:border-gray-800 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-orange-500/10 blur-3xl pointer-events-none"></div>

                <div className="relative z-10">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <BookOpen className="w-8 h-8 text-orange-500" />
                        Blog Management
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
                        Publish and manage community articles.
                    </p>
                </div>
            </div>

            {/* Blog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.map((blog, idx) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={blog.id}
                        className="group relative bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800 flex flex-col h-full hover:shadow-2xl transition-all duration-300"
                    >
                        {/* Image Cover */}
                        <div className="relative h-48 overflow-hidden">
                            <img
                                src={blog.coverImageUrl ? `${BASE_URL}${blog.coverImageUrl}` : "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=2670&auto=format&fit=crop"}
                                alt={blog.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                            <div className="absolute top-4 right-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border ${blog.isPublished
                                        ? 'bg-green-500/20 text-white border-green-400/30'
                                        : 'bg-yellow-500/20 text-white border-yellow-400/30'
                                    }`}>
                                    {blog.isPublished ? 'Published' : 'Draft'}
                                </span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                                <span className="flex items-center gap-1"><User className="w-3 h-3" /> {blog.authorName}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(blog.createdAt || Date.now()).toLocaleDateString()}</span>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                {blog.title}
                            </h3>

                            <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3 mb-6 flex-1">
                                {blog.content?.substring(0, 150)}...
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                                <button className="text-sm font-bold text-gray-900 dark:text-white flex items-center group/btn hover:text-orange-600 transition-colors">
                                    Read Article <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                                </button>

                                <button
                                    onClick={() => handleDeleteBlog(blog.id)}
                                    className="p-2 rounded-full text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    title="Delete Article"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {/* Add New Placeholder handled in dashboard logic, but empty state here */}
                {blogs.length === 0 && (
                    <div className="col-span-full py-20 text-center rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                        <div className="w-16 h-16 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-500">
                            <BookOpen className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">No articles yet</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                            Start writing to share knowledge with the farming community.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminBlogs;
