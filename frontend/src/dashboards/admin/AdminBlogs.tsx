import React from 'react';
import { Trash2 } from 'lucide-react';
import { BASE_URL } from '../../api/axios';

interface AdminBlogsProps {
    blogs: any[];
    handleDeleteBlog: (id: number) => void;
}

const AdminBlogs: React.FC<AdminBlogsProps> = ({ blogs, handleDeleteBlog }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-8 duration-500">
            {blogs.map(blog => (
                <div key={blog.id} className="card bg-base-100 shadow-xl image-full group">
                    <figure>
                        <img
                            src={blog.coverImageUrl ? `${BASE_URL}${blog.coverImageUrl}` : "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=2670&auto=format&fit=crop"}
                            alt={blog.title}
                            className="group-hover:scale-110 transition duration-500 w-full h-full object-cover"
                        />
                    </figure>
                    <div className="card-body">
                        <div className="flex justify-between items-start">
                            <h2 className="card-title text-white">{blog.title}</h2>
                            <button
                                className="btn btn-circle btn-sm btn-error opacity-0 group-hover:opacity-100 transition"
                                onClick={() => handleDeleteBlog(blog.id)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-gray-200 text-sm">By {blog.authorName}</p>
                        <div className="card-actions justify-end mt-auto">
                            <div className={`badge ${blog.isPublished ? 'badge-success' : 'badge-warning'} text-white`}>
                                {blog.isPublished ? 'Published' : 'Draft'}
                            </div>
                            <button className="btn btn-primary btn-sm">Read</button>
                        </div>
                    </div>
                </div>
            ))}
            {blogs.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                    No blogs published yet
                </div>
            )}
        </div>
    );
};

export default AdminBlogs;
