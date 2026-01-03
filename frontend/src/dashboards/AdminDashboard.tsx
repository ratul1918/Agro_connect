import React, { useEffect, useState } from 'react';
import { getAllUsers, deleteUser, deleteCropAdmin, updateCrop } from '../api/endpoints';
import { useNotification } from '../context/NotificationContext';
import { useConfirm, usePrompt } from '../components/ConfirmDialog';
import api from '../api/axios';
import { Menu, Settings } from 'lucide-react';
import Navbar from '../components/layout/Navbar';

// Sub-components
import AdminSidebar from './admin/AdminSidebar';
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
import AdminApiKeys from './admin/AdminApiKeys';

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

    return (
        <div className="min-h-screen bg-base-100 font-sans text-base-content" data-theme="emerald">
            {/* Main Navbar */}
            <div className="fixed top-0 left-0 right-0 z-50">
                <Navbar />
            </div>

            <div className="drawer lg:drawer-open">
                <input id="admin-drawer" type="checkbox" className="drawer-toggle" />

                <div className="drawer-content flex flex-col pt-16">
                    {/* Mobile Menu Button */}
                    <div className="w-full lg:hidden px-4 py-3 flex items-center gap-3 bg-base-100 shadow-sm sticky top-16 z-30">
                        <label htmlFor="admin-drawer" className="btn btn-square btn-ghost btn-sm">
                            <Menu className="w-5 h-5" />
                        </label>
                        <span className="font-bold text-lg">Admin Panel</span>
                    </div>

                    {/* Main Content */}
                    <main className="flex-1 p-6 md:p-10 bg-base-100 min-h-screen">
                        <div className="max-w-7xl mx-auto">
                            <div className="mb-8 flex justify-between items-end">
                                <div>
                                    <h1 className="text-3xl font-bold tracking-tight capitalize">
                                        {activeTab.replace('_', ' ')}
                                    </h1>
                                    <p className="text-gray-500 mt-1">
                                        Manage your platform efficiently
                                    </p>
                                </div>
                                <div className="text-sm border px-3 py-1 rounded-full bg-base-200">
                                    {new Date().toLocaleDateString()}
                                </div>
                            </div>

                            {activeTab === 'overview' && (
                                <AdminOverview
                                    stats={stats}
                                    orders={orders}
                                    exportApplications={exportApplications}
                                    handleExportAction={handleExportAction}
                                    getStatusColor={getStatusColor}
                                />
                            )}
                            {activeTab === 'users' && (
                                <AdminUsers users={users} handleDeleteUser={handleDeleteUser} />
                            )}
                            {activeTab === 'add-product' && (
                                <AdminAddProduct onSuccess={fetchData} />
                            )}
                            {activeTab === 'add-retail' && (
                                <AdminAddRetail onSuccess={fetchData} />
                            )}
                            {activeTab === 'add-b2b' && (
                                <AdminAddB2B onSuccess={fetchData} />
                            )}
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
                            {activeTab === 'orders' && (
                                <AdminOrders
                                    orders={orders}
                                    handleOrderStatus={handleOrderStatus}
                                    handleDeliveryStatus={handleDeliveryStatus}
                                    handleDeleteOrder={handleDeleteOrder}
                                    getStatusColor={getStatusColor}
                                />
                            )}
                            {activeTab === 'exports' && (
                                <AdminExports
                                    exportApplications={exportApplications}
                                    handleExportAction={handleExportAction}
                                    getStatusColor={getStatusColor}
                                />
                            )}
                            {activeTab === 'bids' && (
                                <AdminBids bids={bids} getStatusColor={getStatusColor} />
                            )}
                            {activeTab === 'blogs' && (
                                <AdminBlogs blogs={blogs} handleDeleteBlog={handleDeleteBlog} />
                            )}
                            {activeTab === 'agronomist' && (
                                <AdminAgronomist
                                    agronomistForm={agronomistForm}
                                    setAgronomistForm={setAgronomistForm}
                                    handleAddAgronomist={handleAddAgronomist}
                                    agronomistMessage={agronomistMessage}
                                    loading={loading}
                                />
                            )}
                            {activeTab === 'config' && (
                                <AdminConfig
                                    config={config}
                                    setConfig={setConfig}
                                    updateConfig={updateConfig}
                                    loading={loading}
                                />
                            )}
                            {activeTab === 'cashout' && (
            <AdminCashout 
                key={cashoutRefresh}
                handleCashoutAction={handleCashoutAction} 
            />
        )}
                            {activeTab === 'api-keys' && (
                                <AdminApiKeys />
                            )}
                        </div>
                    </main>
                </div>

                <AdminSidebar
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    pendingOrdersCount={orders.filter(o => o.status === 'PENDING' || o.deliveryStatus === 'PENDING').length}
                />

                {ConfirmDialog}
                {PromptDialog}

                {/* Edit Crop Modal */}
                {editingCrop && (
                    <div className="modal modal-open">
                        <div className="modal-box max-w-2xl">
                            <h3 className="font-bold text-lg mb-4">Edit Product</h3>
                            <form onSubmit={handleSaveCrop} className="space-y-4">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Product Name</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="input input-bordered"
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
                                        className="textarea textarea-bordered"
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
                                            className="input input-bordered"
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
                                            className="select select-bordered"
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
                                            className="input input-bordered"
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
                                            className="input input-bordered"
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
                                                    src={`http://localhost:8080${img}`}
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
                                        className="btn"
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
            </div>
        </div>
    );
};

export default AdminDashboard;
