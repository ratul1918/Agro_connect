import React, { useState } from 'react';
import { Trash2, Search } from 'lucide-react';

interface AdminUsersProps {
    users: any[];
    handleDeleteUser: (id: number) => void;
}

const AdminUsers: React.FC<AdminUsersProps> = ({ users, handleDeleteUser }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = users.filter(u =>
        u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="card bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in duration-300">
            <div className="card-body p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <div>
                        <h2 className="card-title text-2xl font-bold text-gray-800 dark:text-white mb-1">
                            User Management
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Manage users and their permissions
                            <span className="ml-2 badge badge-ghost badge-sm">{filteredUsers.length} total</span>
                        </p>
                    </div>

                    <div className="relative w-full sm:w-72">
                        <input
                            type="text"
                            placeholder="Search users by name or email..."
                            className="input input-bordered w-full pl-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white rounded-lg transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="w-4 h-4 absolute left-3 top-3.5 text-gray-400 dark:text-gray-500" />
                    </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700">
                    <table className="table w-full">
                        {/* head */}
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-200">
                            <tr>
                                <th className="py-4">ID</th>
                                <th className="py-4">User Profile</th>
                                <th className="py-4">Role</th>
                                <th className="py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredUsers.map((u) => (
                                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <th className="font-mono text-gray-500 dark:text-gray-400 font-normal opacity-70">#{u.id}</th>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="avatar placeholder">
                                                <div className="bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 text-green-700 dark:text-green-100 rounded-full w-10 ring-2 ring-white dark:ring-gray-700 shadow-sm">
                                                    <span className="text-xs font-bold">{u.fullName?.substring(0, 2).toUpperCase()}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-800 dark:text-gray-100">{u.fullName}</div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">{u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={`badge ${u.roles?.[0] === 'ROLE_SUPER_ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-0' :
                                                u.roles?.[0] === 'ROLE_ADMIN' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-0' :
                                                    u.roles?.[0] === 'ROLE_FARMER' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-0' :
                                                        u.roles?.[0] === 'ROLE_AGRONOMIST' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-0' :
                                                            'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300 border-0'
                                            } py-3 px-4 font-medium rounded-lg`}>
                                            {u.roles?.[0]?.replace('ROLE_', '') || 'USER'}
                                        </div>
                                    </td>
                                    <td>
                                        {u.roles?.[0] !== 'ROLE_ADMIN' && u.roles?.[0] !== 'ROLE_SUPER_ADMIN' && (
                                            <button
                                                className="btn btn-ghost btn-sm text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                onClick={() => handleDeleteUser(u.id)}
                                                title="Delete User"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center py-12">
                                        <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                                            <Search className="w-12 h-12 mb-3 opacity-20" />
                                            <p className="text-lg font-medium">No users found</p>
                                            <p className="text-sm">Try searching for a different name or email</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminUsers;
