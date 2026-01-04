import React, { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { useNotification } from '../context/NotificationContext';
import { useConfirm } from '../components/ConfirmDialog';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import MobileCard from '../components/ui/MobileCard';
import { BookOpen, MessageSquare, Users, Edit2, Trash2, X } from 'lucide-react';

interface Blog {
    id: number;
    title: string;
    content: string;
    coverImageUrl: string;
    blogType: 'NORMAL' | 'TIP';
    isPublished: boolean;
    viewCount: number;
    createdAt: string;
}

const AgronomistDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { success, error } = useNotification();
    const { showConfirm, ConfirmDialog } = useConfirm();
    const [activeTab, setActiveTab] = useState('blogs');
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        blogType: 'NORMAL' as 'NORMAL' | 'TIP',
        isPublished: true
    });
    const [coverImage, setCoverImage] = useState<File | null>(null);
    
    // Edit state
    const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
    const [editFormData, setEditFormData] = useState({
        title: '',
        content: '',
        blogType: 'NORMAL' as 'NORMAL' | 'TIP',
        isPublished: true
    });
    const [editCoverImage, setEditCoverImage] = useState<File | null>(null);

    const sidebarItems = [
        { label: '🌱 My Blogs', icon: BookOpen, value: 'blogs' },
        { label: '💬 Messages', icon: MessageSquare, value: 'messages', onClick: () => navigate('/messages') },
        { label: '👥 Farmers', icon: Users, value: 'farmers' }
    ];

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
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('content', formData.content);
            formDataToSend.append('blogType', formData.blogType);
            formDataToSend.append('isPublished', formData.isPublished.toString());
            if (coverImage) {
                formDataToSend.append('coverImage', coverImage);
            }

            await api.post('/blogs', formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            success('Blog Created Successfully!');
            setShowForm(false);
            setFormData({
                title: '', content: '',
                blogType: 'NORMAL', isPublished: true
            });
            setCoverImage(null);
            fetchMyBlogs();
        } catch (err) {
            error('Failed to create blog');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (blog: Blog) => {
        setEditingBlog(blog);
        setEditFormData({
            title: blog.title,
            content: blog.content,
            blogType: blog.blogType,
            isPublished: blog.isPublished
        });
        setEditCoverImage(null);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBlog) return;
        
        setLoading(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('title', editFormData.title);
            formDataToSend.append('content', editFormData.content);
            formDataToSend.append('blogType', editFormData.blogType);
            formDataToSend.append('isPublished', editFormData.isPublished.toString());
            if (editCoverImage) {
                formDataToSend.append('coverImage', editCoverImage);
            }

            await api.put(`/blogs/${editingBlog.id}`, formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            success('Blog Updated Successfully!');
            setEditingBlog(null);
            setEditFormData({
                title: '', content: '',
                blogType: 'NORMAL', isPublished: true
            });
            setEditCoverImage(null);
            fetchMyBlogs();
        } catch (err) {
            error('Failed to update blog');
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
        <DashboardLayout
            sidebarItems={sidebarItems}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            title="🌱 Agronomist Dashboard"
        >
            {ConfirmDialog}
            {activeTab === 'blogs' && (
                <div className="space-y-8">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">Blog Management</h2>
                        <Button onClick={() => setShowForm(!showForm)}>
                            {showForm ? 'Cancel' : '+ New Blog'}
                        </Button>
                    </div>

                {/* Blog Creation Form */}
                {showForm && (
                    <MobileCard padding="lg">
                        <h2 className="text-xl font-bold mb-4">📝 Create New Blog</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium">Title</label>
                                <Input
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Enter title"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium">Content</label>
                                <Textarea
                                    value={formData.content}
                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                    placeholder="Write your blog content..."
                                    className="h-32"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium">Cover Image</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                            onChange={e => {
                                                if (e.target.files && e.target.files[0]) {
                                                    setCoverImage(e.target.files[0]);
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Type</label>
                                    <select
                                        className="w-full border rounded p-2 text-sm"
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
                                {loading ? 'Creating...' : 'Create Blog'}
                            </Button>
                        </form>
                    </MobileCard>
                )}

                    {/* My Blogs List */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold">📚 My Blogs ({blogs.length})</h3>
                        {blogs.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No blogs yet. Create your first one!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {blogs.map(blog => (
                                    <MobileCard key={blog.id} padding="md">
                                        <div className="space-y-4">
                                            {/* Blog Cover Image */}
                                            {blog.coverImageUrl && (
                                                <img 
                                                    src={`http://localhost:8080${blog.coverImageUrl}`} 
                                                    alt={blog.title}
                                                    className="w-full h-48 object-cover rounded-lg"
                                                />
                                            )}
                                            
                                            <div className="space-y-2">
                                                <h3 className="font-bold text-lg">{blog.title}</h3>
                                                <p className="text-sm text-gray-500">
                                                    {blog.blogType === 'TIP' ? '🌿 Agricultural Tip' : '📄 Blog Post'} |
                                                    👁 {blog.viewCount} views |
                                                    {blog.isPublished ? '✅ Published' : '📝 Draft'}
                                                </p>
                                                <p className="text-gray-600">
                                                    {blog.content?.substring(0, 150)}...
                                                </p>
                                            </div>

                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" className="flex-1 touch-manipulation" onClick={() => handleEdit(blog)}>
                                                    <Edit2 className="w-4 h-4 mr-1" /> Edit
                                                </Button>
                                                <Button variant="destructive" size="sm" className="flex-1 touch-manipulation" onClick={() => handleDelete(blog.id)}>
                                                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                                                </Button>
                                            </div>
                                        </div>
                                    </MobileCard>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}



            {activeTab === 'farmers' && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded shadow">
                        <h3 className="text-xl font-bold mb-4">👥 Connected Farmers</h3>
                        <p className="text-gray-500">No farmers connected yet.</p>
                    </div>
                </div>
            )}

            {/* Edit Blog Modal */}
            {editingBlog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h2 className="text-xl font-bold">✏️ Edit Blog</h2>
                            <button 
                                onClick={() => setEditingBlog(null)}
                                className="p-1 hover:bg-gray-100 rounded"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <Input
                                    value={editFormData.title}
                                    onChange={e => setEditFormData({ ...editFormData, title: e.target.value })}
                                    placeholder="Enter title"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Content</label>
                                <Textarea
                                    value={editFormData.content}
                                    onChange={e => setEditFormData({ ...editFormData, content: e.target.value })}
                                    placeholder="Write your blog content..."
                                    className="h-40"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Cover Image</label>
                                    {editingBlog.coverImageUrl && (
                                        <div className="mb-2">
                                            <img 
                                                src={`http://localhost:8080${editingBlog.coverImageUrl}`}
                                                alt="Current cover"
                                                className="w-32 h-20 object-cover rounded border"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Current image</p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="file-input file-input-bordered file-input-sm w-full"
                                        onChange={e => {
                                            if (e.target.files && e.target.files[0]) {
                                                setEditCoverImage(e.target.files[0]);
                                            }
                                        }}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Leave empty to keep current image</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Type</label>
                                    <select
                                        className="w-full border rounded p-2"
                                        value={editFormData.blogType}
                                        onChange={e => setEditFormData({ ...editFormData, blogType: e.target.value as 'NORMAL' | 'TIP' })}
                                    >
                                        <option value="NORMAL">Normal Blog</option>
                                        <option value="TIP">Agricultural Tip / কৃষি টিপস</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={editFormData.isPublished}
                                    onChange={e => setEditFormData({ ...editFormData, isPublished: e.target.checked })}
                                    id="edit-published"
                                />
                                <label htmlFor="edit-published">Published</label>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => setEditingBlog(null)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading} className="flex-1">
                                    {loading ? 'Updating...' : 'Update Blog'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default AgronomistDashboard;

