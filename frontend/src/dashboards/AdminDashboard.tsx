import React, { useEffect, useState } from 'react';
import { getAllUsers, deleteUser, deleteCropAdmin, updateCrop } from '../api/endpoints';
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
import AdminAddRetail from './admin/AdminAddRetail';
import AdminAddB2B from './admin/AdminAddB2B';
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
        { label: 'Export Apps', icon: Ship, value: 'exports' },
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
                getAllUsers(),
                api.get('/admin/crops'),
                api.get('/admin/blogs').catch(() => ({ data: [] })),
                api.get('/admin/export-applications').catch(() => ({ data: [] })),
                api.get('/admin/orders').catch(() => ({ data: [] })),
                api.get('/admin/bids').catch(() => ({ data: [] }))
            ]);

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
            const res = await api.get('/admin/config');
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
                await api.put(`/admin/crops/${id}/stock-out`);
                success('Product marked as stock out');
                fetchData();
            }
            catch { error('Failed to update stock status'); }
        }, true);
    };

    const handleBackInStock = async (id: number) => {
        try {
            await api.put(`/admin/crops/${id}/back-in-stock`);
            success('Product is back in stock');
            fetchData();
        }
        catch { error('Failed to update stock status'); }
    };

    const handleBulkUpdate = async () => {
        showConfirm('Apply Bulk Settings?', 'Update all crops?', async () => {
            setLoading(true);
            try {
                await api.put('/admin/crops/bulk-quantity-settings', bulkSettings);
                success('Updated crops'); fetchData();
            } catch { error('Update failed'); }
            finally { setLoading(false); }
        }, true);
    };

    const handleExportAction = async (id: number, action: 'approve' | 'reject') => {
        showPrompt(`Note for ${action}:`, async (notes) => {
            try {
                await api.put(`/admin/export-applications/${id}/${action}`, { notes });
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
        } catch (err: any) { setAgronomistMessage('❌ ' + (err.message || 'Error')); }
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
                <AdminAddProduct onSuccess={fetchData} />
            )}
            {activeTab === 'add-retail' && (
                <AdminAddRetail onSuccess={fetchData} />
            )}
            {activeTab === 'add-b2b' && (
                <AdminAddB2B onSuccess={fetchData} />
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
                <div className="modal modal-open">
                    <div className="modal-box max-w-2xl bg-white dark:bg-gray-800 dark:text-white">
                        <h3 className="font-bold text-lg mb-4">Edit Product</h3>
                        <form onSubmit={handleSaveCrop} className="space-y-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Product Name</span>
                                </label>
                                <input
                                    type="text"
                                    className="input input-bordered dark:bg-gray-700 dark:text-white"
                                    value={editingCrop.title || ''}
                                    onChange={e => setEditingCrop({ ...editingCrop, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Description</span>
                                </label>
                                <textarea
                                    className="textarea textarea-bordered dark:bg-gray-700 dark:text-white"
                                    rows={3}
                                    value={editingCrop.description || ''}
                                    onChange={e => setEditingCrop({ ...editingCrop, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Quantity</span>
                                    </label>
                                    <input
                                        type="number"
                                        className="input input-bordered dark:bg-gray-700 dark:text-white"
                                        value={editingCrop.quantity || 0}
                                        onChange={e => setEditingCrop({ ...editingCrop, quantity: parseFloat(e.target.value) })}
                                        required
                                    />
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Unit</span>
                                    </label>
                                    <select
                                        className="select select-bordered dark:bg-gray-700 dark:text-white"
                                        value={editingCrop.unit || 'kg'}
                                        onChange={e => setEditingCrop({ ...editingCrop, unit: e.target.value })}
                                    >
                                        <option value="kg">Kilogram (kg)</option>
                                        <option value="ton">Ton</option>
                                        <option value="maund">Maund</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Price (৳ per unit)</span>
                                    </label>
                                    <input
                                        type="number"
                                        className="input input-bordered dark:bg-gray-700 dark:text-white"
                                        value={editingCrop.minPrice || 0}
                                        onChange={e => setEditingCrop({ ...editingCrop, minPrice: parseFloat(e.target.value) })}
                                        required
                                    />
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Location</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="input input-bordered dark:bg-gray-700 dark:text-white"
                                        value={editingCrop.location || ''}
                                        onChange={e => setEditingCrop({ ...editingCrop, location: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Show existing images */}
                            {editingCrop.images && editingCrop.images.length > 0 && (
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Current Images</span>
                                    </label>
                                    <div className="flex gap-2 flex-wrap">
                                        {editingCrop.images.map((img: string, idx: number) => (
                                            <img
                                                key={idx}
                                                src={`${BASE_URL}${img}`}
                                                alt={`Product ${idx + 1}`}
                                                className="w-20 h-20 object-cover rounded border"
                                            />
                                        ))}
                                    </div>
                                    <label className="label">
                                        <span className="label-text-alt text-gray-500">Note: Image editing not supported yet</span>
                                    </label>
                                </div>
                            )}

                            <div className="modal-action">
                                <button
                                    type="button"
                                    className="btn dark:bg-gray-700 dark:text-white"
                                    onClick={() => setEditingCrop(null)}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
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
