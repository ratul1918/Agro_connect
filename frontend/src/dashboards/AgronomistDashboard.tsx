import React, { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { useNotification } from '../context/NotificationContext';
import { useConfirm } from '../components/ConfirmDialog';
import api from '../api/axios';

interface Blog {
    id: number;
    title: string;
    titleBn: string;
    content: string;
    contentBn: string;
    coverImageUrl: string;
    blogType: 'NORMAL' | 'TIP';
    isPublished: boolean;
    viewCount: number;
    createdAt: string;
}

const AgronomistDashboard: React.FC = () => {
    const { success, error } = useNotification();
    const { showConfirm, ConfirmDialog } = useConfirm();
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        titleBn: '',
        content: '',
        contentBn: '',
        coverImageUrl: '',
        blogType: 'NORMAL' as 'NORMAL' | 'TIP',
        isPublished: true
    });

    useEffect(() => {
        fetchMyBlogs();
    }, []);

    const fetchMyBlogs = async () => {
        try {
            const res = await api.get('/blogs/my');
            setBlogs(res.data);
        } catch (err) {
            console.error('Failed to fetch blogs', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/blogs', formData);
            success('Blog Created Successfully! / ব্লগ সফলভাবে তৈরি হয়েছে!');
            setShowForm(false);
            setFormData({
                title: '', titleBn: '', content: '', contentBn: '',
                coverImageUrl: '', blogType: 'NORMAL', isPublished: true
            });
            fetchMyBlogs();
        } catch (err) {
            error('Failed to create blog');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        showConfirm('Delete this blog?', 'This action cannot be undone.', async () => {
            try {
                await api.delete(`/blogs/${id}`);
                success('Blog deleted successfully');
                fetchMyBlogs();
            } catch (err) {
                error('Failed to delete blog');
            }
        }, true);
    };

    return (
        <>
            <div className="p-8 space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">🌱 Agronomist Dashboard / কৃষি বিশেষজ্ঞ ড্যাশবোর্ড</h1>
                    <Button onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : '+ New Blog / নতুন ব্লগ'}
                    </Button>
                </div>

                {/* Blog Creation Form */}
                {showForm && (
                    <div className="bg-white p-6 rounded shadow border-l-4 border-green-500">
                        <h2 className="text-xl font-bold mb-4">📝 Create New Blog</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium">Title (English)</label>
                                    <Input
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Enter title"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">শিরোনাম (বাংলা)</label>
                                    <Input
                                        value={formData.titleBn}
                                        onChange={e => setFormData({ ...formData, titleBn: e.target.value })}
                                        placeholder="শিরোনাম লিখুন"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium">Content (English)</label>
                                <Textarea
                                    value={formData.content}
                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                    placeholder="Write your blog content..."
                                    className="h-32"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium">বিষয়বস্তু (বাংলা)</label>
                                <Textarea
                                    value={formData.contentBn}
                                    onChange={e => setFormData({ ...formData, contentBn: e.target.value })}
                                    placeholder="আপনার ব্লগ লিখুন..."
                                    className="h-32"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium">Cover Image URL</label>
                                    <Input
                                        value={formData.coverImageUrl}
                                        onChange={e => setFormData({ ...formData, coverImageUrl: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Type</label>
                                    <select
                                        className="w-full border rounded p-2"
                                        value={formData.blogType}
                                        onChange={e => setFormData({ ...formData, blogType: e.target.value as 'NORMAL' | 'TIP' })}
                                    >
                                        <option value="NORMAL">Normal Blog</option>
                                        <option value="TIP">Agricultural Tip / কৃষি টিপস</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.isPublished}
                                    onChange={e => setFormData({ ...formData, isPublished: e.target.checked })}
                                />
                                <label>Publish Immediately</label>
                            </div>

                            <Button type="submit" disabled={loading} className="w-full">
                                {loading ? 'Creating...' : 'Create Blog / ব্লগ তৈরি করুন'}
                            </Button>
                        </form>
                    </div>
                )}

                {/* My Blogs List */}
                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-bold mb-4">📚 My Blogs ({blogs.length})</h2>
                    {blogs.length === 0 ? (
                        <p className="text-gray-500">No blogs yet. Create your first one!</p>
                    ) : (
                        <div className="space-y-4">
                            {blogs.map(blog => (
                                <div key={blog.id} className="border rounded p-4 flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-lg">{blog.title || blog.titleBn}</h3>
                                        <p className="text-sm text-gray-500">
                                            {blog.blogType === 'TIP' ? '🌿 Agricultural Tip' : '📄 Blog Post'} |
                                            👁 {blog.viewCount} views |
                                            {blog.isPublished ? '✅ Published' : '📝 Draft'}
                                        </p>
                                        <p className="text-gray-600 mt-2 line-clamp-2">
                                            {blog.content?.substring(0, 150)}...
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm">Edit</Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleDelete(blog.id)}>
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {ConfirmDialog}
        </>
    );
};

export default AgronomistDashboard;
