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
        <div className="card bg-base-100 shadow-xl animate-in fade-in zoom-in duration-300">
            <div className="card-body p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h2 className="card-title text-2xl">
                        User Management
                        <div className="badge badge-secondary">{filteredUsers.length}</div>
                    </h2>

                    <div className="relative w-full sm:w-64">
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="input input-bordered w-full pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
                    </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-base-200">
                    <table className="table table-zebra w-full">
                        {/* head */}
                        <thead className="bg-base-200">
                            <tr>
                                <th>ID</th>
                                <th>User Profile</th>
                                <th>Role</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((u) => (
                                <tr key={u.id}>
                                    <th>{u.id}</th>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="avatar placeholder">
                                                <div className="bg-neutral text-neutral-content rounded-full w-10">
                                                    <span className="text-xs">{u.fullName?.substring(0, 2).toUpperCase()}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="font-bold">{u.fullName}</div>
                                                <div className="text-sm opacity-50">{u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={`badge ${u.roles?.[0] === 'ROLE_SUPER_ADMIN' ? 'badge-primary text-white font-bold' :
                                                u.roles?.[0] === 'ROLE_ADMIN' ? 'badge-error text-white' :
                                                    u.roles?.[0] === 'ROLE_FARMER' ? 'badge-success text-white' :
                                                        u.roles?.[0] === 'ROLE_AGRONOMIST' ? 'badge-secondary text-white' :
                                                            'badge-info text-white'
                                            } badge-sm gap-2`}>
                                            {u.roles?.[0]?.replace('ROLE_', '') || 'USER'}
                                        </div>
                                    </td>
                                    <td>
                                        {u.roles?.[0] !== 'ROLE_ADMIN' && u.roles?.[0] !== 'ROLE_SUPER_ADMIN' && (
                                            <button
                                                className="btn btn-ghost btn-xs text-error tooltip"
                                                data-tip="Delete User"
                                                onClick={() => handleDeleteUser(u.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center py-8 text-gray-500">
                                        No users found matching "{searchTerm}"
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
