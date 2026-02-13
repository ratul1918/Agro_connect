import React, { useEffect, useState } from 'react';
import { 
    getAllUsers, deleteUser, getAllAdminCrops, deleteCropAdmin, updateCrop,
    getAllAdminBlogs, getAllExportApplications, getAllAdminOrders, getAllAdminBids,
    getAdminConfig, updateCropStockOut, updateCropBackInStock, updateBulkQuantitySettings,
    updateExportApplicationStatus
} from '../api/endpoints';
import { useNotification } from '../context/NotificationContext';
import { useConfirm, usePrompt } from '../components/ConfirmDialog';
import api, { BASE_URL } from '../api/axios';
import {
    BarChart3, Users, Leaf, ShoppingCart, Ship, FileCheck, BookOpen,
    UserPlus, Settings, DollarSign, Plus
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';

// Sub-components
import AdminOverview from './admin/AdminOverview';
import AdminUsers from './admin/AdminUsers';
import AdminCrops from './admin/AdminCrops';
import AdminAddProduct from './admin/AdminAddProduct';
import AdminOrders from './admin/AdminOrders';
import AdminExports from './admin/AdminExports';
import AdminBids from './admin/AdminBids';
import AdminBlogs from './admin/AdminBlogs';
import AdminAgronomist from './admin/AdminAgronomist';
import AdminConfig from './admin/AdminConfig';
import AdminCashout from './admin/AdminCashout';

const AdminDashboard: React.FC = () => {
    const { success, error } = useNotification();
    const { showConfirm, ConfirmDialog } = useConfirm();
    const { showPrompt, PromptDialog } = usePrompt();

    // State
    const [activeTab, setActiveTab] = useState('overview');
    const [users, setUsers] = useState<any[]>([]);
    const [crops, setCrops] = useState<any[]>([]);
    const [blogs, setBlogs] = useState<any[]>([]);
    const [exportApplications, setExportApplications] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [bids, setBids] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchError, _setFetchError] = useState(false);
    const [cashoutRefresh, setCashoutRefresh] = useState(false);

    // Forms & Settings
    const [agronomistForm, setAgronomistForm] = useState({ fullName: '', email: '', password: '', phone: '' });
    const [agronomistMessage, setAgronomistMessage] = useState('');
    const [editingCrop, setEditingCrop] = useState<any>(null);
    const [bulkSettings, setBulkSettings] = useState({ minWholesaleQty: 80, minRetailQty: 0.1, maxRetailQty: 10 });
    const [config, setConfig] = useState<any>({});

    // Sidebar Items
    const sidebarItems = [
        { label: 'Overview', icon: BarChart3, value: 'overview' },
        { label: 'Users', icon: Users, value: 'users' },
        { label: 'Add B2B Product', icon: Plus, value: 'add-b2b' },
        { label: 'Add Retail Product', icon: Plus, value: 'add-retail' },
        { label: 'All Products', icon: Leaf, value: 'crops' },
        { label: 'Orders', icon: ShoppingCart, value: 'orders' },
        { label: 'Export Crops', icon: Ship, value: 'exports' },
        { label: 'Bids', icon: FileCheck, value: 'bids' },
        { label: 'Cashouts', icon: DollarSign, value: 'cashout' },
        { label: 'Blogs', icon: BookOpen, value: 'blogs' },
        { label: 'Add Expert', icon: UserPlus, value: 'agronomist' },
        { label: 'Settings', icon: Settings, value: 'config' }
    ];

    // Computed Stats
    const stats = {
        totalUsers: users.length,
        totalFarmers: users.filter(u => u.roles?.includes('ROLE_FARMER')).length,
        totalBuyers: users.filter(u => u.roles?.includes('ROLE_BUYER')).length,
        totalCrops: crops.length,
        totalBlogs: blogs.length,
        totalOrders: orders.length,
        totalExports: exportApplications.length,
        totalBids: bids.length,
        totalIncome: orders
            .filter(o => o.status === 'COMPLETED' || o.status === 'DELIVERED')
            .reduce((sum, o) => sum + (o.totalAmount || 0), 0)
    };

    useEffect(() => {
        fetchData();
        fetchConfig();

        // Set initial tab from hash if present
        const hash = window.location.hash.substring(1);
        if (hash) {
            setActiveTab(hash);
        }

        // Listen for hash changes
        const handleHashChange = () => {
            const newHash = window.location.hash.substring(1);
            if (newHash) {
                setActiveTab(newHash);
            }
        };

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const fetchData = async () => {
        try {
            const [usersRes, cropsRes, blogsRes, exportsRes, ordersRes, bidsRes] = await Promise.all([
                getAllUsers().catch((err) => { console.error('Failed to fetch users:', err); return { data: [] }; }),
                getAllAdminCrops().catch((err) => { console.error('Failed to fetch crops:', err); return { data: [] }; }),
                getAllAdminBlogs().catch(() => ({ data: [] })),
                getAllExportApplications().catch(() => ({ data: [] })),
                getAllAdminOrders().catch(() => ({ data: [] })),
                getAllAdminBids().catch(() => ({ data: [] }))
            ]);

            console.log('Admin Dashboard Data:', {
                users: usersRes.data?.length || 0,
                crops: cropsRes.data?.length || 0,
                blogs: blogsRes.data?.length || 0,
                orders: ordersRes.data?.length || 0
            });

            setUsers(usersRes.data);
            setCrops(cropsRes.data);
            setBlogs(blogsRes.data);
            setExportApplications(exportsRes.data);
            setOrders(ordersRes.data);
            setBids(bidsRes.data);
        } catch (err) {
            console.error("Error fetching admin data", err);
        }
    };

    const fetchConfig = async () => {
        try {
            const res = await getAdminConfig();
            setConfig(res.data);
            if (res.data.default_min_wholesale_qty) {
                setBulkSettings({
                    minWholesaleQty: parseFloat(res.data.default_min_wholesale_qty) || 80,
                    minRetailQty: parseFloat(res.data.default_min_retail_qty) || 0.1,
                    maxRetailQty: parseFloat(res.data.default_max_retail_qty) || 10
                });
            }
        } catch (err) { console.error("Config fetch error", err); }
    };

    // Actions
    const handleDeleteUser = async (id: number) => {
        showConfirm('Delete User?', 'Cannot be undone.', async () => {
            try { await deleteUser(id); success('User deleted'); fetchData(); }
            catch { error('Failed to delete'); }
        }, true);
    };

    const handleDeleteCrop = async (id: number) => {
        showConfirm('Delete Crop?', 'Cannot be undone.', async () => {
            try { await deleteCropAdmin(id); success('Crop deleted'); fetchData(); }
            catch { error('Failed to delete'); }
        }, true);
    };

    const handleStockOut = async (id: number) => {
        showConfirm('Mark as Stock Out?', 'Product will be hidden from marketplace.', async () => {
            try {
                await updateCropStockOut(id);
                success('Product marked as stock out');
                fetchData();
            }
            catch { error('Failed to update stock status'); }
        }, true);
    };

    const handleBackInStock = async (id: number) => {
        try {
            await updateCropBackInStock(id);
            success('Product is back in stock');
            fetchData();
        }
        catch { error('Failed to update stock status'); }
    };

    const handleBulkUpdate = async () => {
        showConfirm('Apply Bulk Settings?', 'Update all crops?', async () => {
            setLoading(true);
            try {
                await updateBulkQuantitySettings(bulkSettings);
                success('Updated crops'); fetchData();
            } catch { error('Update failed'); }
            finally { setLoading(false); }
        }, true);
    };

    const handleExportAction = async (id: number, action: 'approve' | 'reject') => {
        showPrompt(`Note for ${action}:`, async (notes) => {
            try {
                await updateExportApplicationStatus(id, action, notes);
                success(`Application ${action}d`); fetchData();
            } catch { error('Action failed'); }
        });
    };

    const handleOrderStatus = async (id: number, status: string) => {
        try {
            await api.put(`/admin/orders/${id}/status`, { status });
            success('Status updated'); fetchData();
        } catch { error('Update failed'); }
    };

    const handleDeliveryStatus = async (id: number, deliveryStatus: string) => {
        try {
            await api.put(`/admin/orders/${id}/delivery-status`, { deliveryStatus });
            success('Delivery status updated'); fetchData();
        } catch { error('Update failed'); }
    };

    const handleDeleteOrder = async (id: number) => {
        showConfirm('Delete Order?', 'Irreversible.', async () => {
            try { await api.delete(`/admin/orders/${id}`); success('Order deleted'); fetchData(); }
            catch { error('Delete failed'); }
        }, true);
    };

    const handleDeleteBlog = async (id: number) => {
        showConfirm('Delete Blog?', 'Irreversible.', async () => {
            try { await api.delete(`/admin/blogs/${id}`); success('Blog deleted'); fetchData(); }
            catch { error('Delete failed'); }
        }, true);
    };

    const handleAddAgronomist = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setAgronomistMessage('');
        try {
            await api.post('/admin/users/agronomist', { ...agronomistForm, role: 'AGRONOMIST' });
            setAgronomistMessage('✅ Created');
            setAgronomistForm({ fullName: '', email: '', password: '', phone: '' });
            fetchData();
        } catch (err: any) { setAgronomistMessage('❌ ' + (err.response?.data?.message || err.message || 'Error')); }
        finally { setLoading(false); }
    };

    const updateConfig = async () => {
        setLoading(true);
        try { await api.post('/admin/config', config); success('Config saved'); }
        catch { error('Save failed'); }
        finally { setLoading(false); }
    };

    const handleCashoutAction = async (id: number, action: 'approve' | 'reject') => {
        if (action === 'approve') {
            showConfirm('Approve Cashout?', 'This will deduct from user wallet.', async () => {
                try {
                    console.log(`Approving cashout request ${id}`);
                    const response = await api.post(`/admin/cashout/${id}/approve`);
                    console.log('Approve response:', response.data);
                    if (response.data.success) {
                        success('Cashout Approved');
                        // Refresh cashout requests to update the UI
                        setCashoutRefresh(prev => !prev);
                    } else {
                        error(response.data.message || 'Approval failed');
                    }
                } catch (err: any) {
                    console.error('Cashout approve error:', err);
                    const errorMessage = err.response?.data?.message || err.message || 'Approval failed';
                    error(errorMessage);
                }
            }, true);
        } else {
            showPrompt('Reason for Rejection:', async (reason) => {
                try {
                    console.log(`Rejecting cashout request ${id} with reason:`, reason);
                    const response = await api.post(`/admin/cashout/${id}/reject`, { reason });
                    console.log('Reject response:', response.data);
                    if (response.data.success) {
                        success('Cashout Rejected');
                        // Refresh cashout requests to update the UI
                        setCashoutRefresh(prev => !prev);
                    } else {
                        error(response.data.message || 'Rejection failed');
                    }
                } catch (err: any) {
                    console.error('Cashout reject error:', err);
                    const errorMessage = err.response?.data?.message || err.message || 'Rejection failed';
                    error(errorMessage);
                }
            });
        }
    };

    const handleSaveCrop = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCrop) return;

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', editingCrop.title);
            formData.append('description', editingCrop.description || '');
            formData.append('cropTypeId', editingCrop.cropTypeId?.toString() || '1');
            formData.append('quantity', editingCrop.quantity?.toString() || '0');
            formData.append('unit', editingCrop.unit || 'kg');
            formData.append('minPrice', editingCrop.minPrice?.toString() || '0');
            formData.append('location', editingCrop.location || '');

            // Ensure ID is a number
            const cropId = typeof editingCrop.id === 'object' ? editingCrop.id.value || editingCrop.id.id : editingCrop.id;
            await updateCrop(Number(cropId), formData);
            success('Product updated successfully');
            setEditingCrop(null);
            fetchData();
        } catch (err: any) {
            error(err.message || 'Failed to update product');
        } finally {
            setLoading(false);
        }
    };

    // Helpers
    const getStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'APPROVED': case 'COMPLETED': case 'DELIVERED': return 'badge-success text-white';
            case 'REJECTED': case 'CANCELLED': return 'badge-error text-white';
            case 'PENDING': return 'badge-warning text-white';
            default: return 'badge-ghost';
        }
    };

    const getTitle = () => {
        const item = sidebarItems.find(i => i.value === activeTab);
        return item ? item.label : 'Admin Dashboard';
    };

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
    };

    return (
        <DashboardLayout
            sidebarItems={sidebarItems}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            title={getTitle()}
        >
            {ConfirmDialog}
            {PromptDialog}

            {/* Error Banner */}
            {fetchError && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        <span>Failed to load dashboard data. The server might be unreachable or you might need to login again.</span>
                    </div>
                    <button
                        onClick={() => fetchData()}
                        className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-md text-sm font-medium transition-colors"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Overview */}
            {activeTab === 'overview' && (
                <AdminOverview
                    stats={stats}
                    orders={orders}
                    exportApplications={exportApplications}
                    handleExportAction={handleExportAction}
                    getStatusColor={getStatusColor}
                />
            )}

            {/* Users */}
            {activeTab === 'users' && (
                <AdminUsers users={users} handleDeleteUser={handleDeleteUser} />
            )}

            {/* Add Products */}
            {activeTab === 'add-product' && (
                <AdminAddProduct onSuccess={fetchData} defaultMarketType="BOTH" />
            )}
            {activeTab === 'add-retail' && (
                <AdminAddProduct onSuccess={fetchData} defaultMarketType="RETAIL" />
            )}
            {activeTab === 'add-b2b' && (
                <AdminAddProduct onSuccess={fetchData} defaultMarketType="B2B" />
            )}

            {/* Crops */}
            {activeTab === 'crops' && (
                <AdminCrops
                    crops={crops}
                    handleDeleteCrop={handleDeleteCrop}
                    handleEditCrop={setEditingCrop}
                    handleStockOut={handleStockOut}
                    handleBackInStock={handleBackInStock}
                    handleBulkUpdate={handleBulkUpdate}
                    bulkSettings={bulkSettings}
                    setBulkSettings={setBulkSettings}
                    loading={loading}
                />
            )}

            {/* Orders */}
            {activeTab === 'orders' && (
                <AdminOrders
                    orders={orders}
                    handleOrderStatus={handleOrderStatus}
                    handleDeliveryStatus={handleDeliveryStatus}
                    handleDeleteOrder={handleDeleteOrder}
                />
            )}

            {/* Exports */}
            {activeTab === 'exports' && (
                <AdminExports
                    exportApplications={exportApplications}
                    handleExportAction={handleExportAction}
                />
            )}

            {/* Bids */}
            {activeTab === 'bids' && (
                <AdminBids bids={bids} />
            )}

            {/* Blogs */}
            {activeTab === 'blogs' && (
                <AdminBlogs blogs={blogs} handleDeleteBlog={handleDeleteBlog} />
            )}

            {/* Agronomist */}
            {activeTab === 'agronomist' && (
                <AdminAgronomist
                    agronomistForm={agronomistForm}
                    setAgronomistForm={setAgronomistForm}
                    handleAddAgronomist={handleAddAgronomist}
                    agronomistMessage={agronomistMessage}
                    loading={loading}
                />
            )}

            {/* Config */}
            {activeTab === 'config' && (
                <AdminConfig
                    config={config}
                    setConfig={setConfig}
                    updateConfig={updateConfig}
                    loading={loading}
                />
            )}

            {/* Cashout */}
            {activeTab === 'cashout' && (
                <AdminCashout
                    key={cashoutRefresh.toString()}
                    handleCashoutAction={handleCashoutAction}
                />
            )}

            {/* Edit Crop Modal */}
            {editingCrop && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="glass-card rounded-3xl border border-white/20 dark:border-gray-800 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="sticky top-0 z-10 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border-b border-white/20 dark:border-gray-800 p-6 sm:p-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Product</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Update product details below</p>
                                </div>
                                <button
                                    onClick={() => setEditingCrop(null)}
                                    disabled={loading}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-500 hover:text-gray-900 dark:hover:text-white"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Form Content */}
                        <form onSubmit={handleSaveCrop} className="p-6 sm:p-8 space-y-8">
                            {/* Product Name & Category */}
                            <div className="bg-white/50 dark:bg-gray-800/30 rounded-2xl p-6 border border-white/20 dark:border-gray-700/50">
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-6">Basic Information</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Name</label>
                                        <input
                                            type="text"
                                            className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                                            value={editingCrop.title || ''}
                                            onChange={e => setEditingCrop({ ...editingCrop, title: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                                        <textarea
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all resize-none"
                                            rows={4}
                                            value={editingCrop.description || ''}
                                            onChange={e => setEditingCrop({ ...editingCrop, description: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Inventory & Pricing */}
                            <div className="bg-white/50 dark:bg-gray-800/30 rounded-2xl p-6 border border-white/20 dark:border-gray-700/50">
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-6">Inventory & Pricing</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quantity</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-mono"
                                            value={editingCrop.quantity || 0}
                                            onChange={e => setEditingCrop({ ...editingCrop, quantity: parseFloat(e.target.value) })}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Unit</label>
                                        <select
                                            className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                                            value={editingCrop.unit || 'kg'}
                                            onChange={e => setEditingCrop({ ...editingCrop, unit: e.target.value })}
                                        >
                                            <option value="kg">Kilogram (kg)</option>
                                            <option value="ton">Ton</option>
                                            <option value="maund">Maund</option>
                                            <option value="pcs">Pieces (pcs)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price (৳ per unit)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">৳</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="w-full h-12 pl-8 pr-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-mono"
                                                value={editingCrop.minPrice || 0}
                                                onChange={e => setEditingCrop({ ...editingCrop, minPrice: parseFloat(e.target.value) })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
                                        <input
                                            type="text"
                                            className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                                            value={editingCrop.location || ''}
                                            onChange={e => setEditingCrop({ ...editingCrop, location: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Current Images */}
                            {editingCrop.images && editingCrop.images.length > 0 && (
                                <div className="bg-white/50 dark:bg-gray-800/30 rounded-2xl p-6 border border-white/20 dark:border-gray-700/50">
                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-6">Current Images</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {editingCrop.images.map((img: string, idx: number) => (
                                            <div key={idx} className="relative group">
                                                <img
                                                    src={`${BASE_URL}${img}`}
                                                    alt={`Product ${idx + 1}`}
                                                    className="w-full aspect-square object-cover rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
                                                />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                                                    <p className="text-white text-xs font-semibold">Image #{idx + 1}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">💡 Note: Image editing not yet supported. Delete and re-add product to change images.</p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 justify-end pt-6 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setEditingCrop(null)}
                                    disabled={loading}
                                    className="px-6 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-8 h-12 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold shadow-lg shadow-green-600/20 hover:shadow-green-600/30 transition-all disabled:opacity-50 flex items-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>Save Changes</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default AdminDashboard;
