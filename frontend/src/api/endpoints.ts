import api from './axios';

// AUTH APIs
export const login = (credentials: any) => api.post('/auth/login', credentials);
export const signup = (data: any) => api.post('/auth/signup', data);
export const forgotPassword = (email: string) => api.post('/auth/forgot-password', { email });
export const resetPassword = (data: any) => api.post('/auth/reset-password', data);
export const getCurrentUser = () => api.get('/auth/me');
export const updateProfile = (data: any) => api.put('/auth/profile', data);
export const changePassword = (currentPassword: string, newPassword: string) => api.put('/auth/change-password', { currentPassword, newPassword });

// USER APIs
export const updateUserProfile = (data: any) => api.put('/users/profile', data);
export const changeUserPassword = (currentPassword: string, newPassword: string) => api.put('/users/change-password', { currentPassword, newPassword });

// ADMIN APIs
export const getAllUsers = () => api.get('/admin/users');
export const deleteUser = (id: number) => api.delete(`/admin/users/${id}`);
export const getAllAdminCrops = () => api.get('/admin/crops');
export const deleteCropAdmin = (id: number) => api.delete(`/admin/crops/${id}`);
export const deleteReviewAdmin = (id: number) => api.delete(`/admin/reviews/${id}`);
export const getAllAdminBlogs = () => api.get('/admin/blogs');
export const addBlog = (data: any) => api.post('/admin/blogs', data);
export const updateBlog = (id: number, data: any) => api.put(`/admin/blogs/${id}`, data);
export const deleteBlog = (id: number) => api.delete(`/admin/blogs/${id}`);
export const getAllExportApplications = () => api.get('/admin/export-applications');
export const getAllAdminOrders = () => api.get('/admin/orders');
export const getAllAdminBids = () => api.get('/admin/bids');
export const getAdminConfig = () => api.get('/admin/config');
export const updateCropStockOut = (id: number) => api.put(`/admin/crops/${id}/stock-out`);
export const updateCropBackInStock = (id: number) => api.put(`/admin/crops/${id}/back-in-stock`);
export const updateBulkQuantitySettings = (data: any) => api.put('/admin/crops/bulk-quantity-settings', data);
export const updateExportApplicationStatus = (id: number, action: string, notes?: string) => api.put(`/admin/export-applications/${id}/${action}`, { notes });

// CROP APIs
export const getAllCrops = () => api.get('/crops');
export const getCropById = (id: number) => api.get(`/crops/${id}`);
export const getMyFarmerCrops = () => api.get('/crops/my');
export const addCrop = (formData: FormData) => api.post('/crops', formData);
export const updateCrop = (id: number, formData: FormData) => api.put(`/crops/${id}`, formData);
export const deleteCrop = (id: number) => api.delete(`/crops/${id}`);
export const updateFarmerCropBackInStock = (id: number) => api.put(`/crops/${id}/back-in-stock`);
export const updateFarmerCropStockOut = (id: number) => api.put(`/crops/${id}/stock-out`);


// BIDDING APIs
export const placeBid = (cropId: number, amount: number, quantity: number) => api.post(`/bids/${cropId}`, { amount, quantity });
export const getBidsByCrop = (cropId: number) => api.get(`/bids/crop/${cropId}`);
export const getMyBids = () => api.get('/bids/my-bids');
export const getFarmerBids = () => api.get('/bids/farmer-bids');
export const getBidById = (bidId: number) => api.get(`/bids/${bidId}`);
export const counterOfferBid = (bidId: number, counterPrice: number) => api.put(`/bids/${bidId}/counter`, { counterPrice });
export const buyerRespondBid = (bidId: number, action: string, amount?: number) => api.put(`/bids/${bidId}/buyer-respond`, { action, amount });
export const acceptBid = (bidId: number) => api.put(`/bids/${bidId}/accept`);
export const rejectBid = (bidId: number) => api.put(`/bids/${bidId}/reject`);
export const deleteBid = (bidId: number) => api.delete(`/bids/${bidId}`);
export const updateFarmerBidStatus = (bidId: number, action: string) => api.put(`/features/farmer/bids/${bidId}/${action}`);

// ORDER APIs
export const createOrder = (data: any) => api.post('/orders/create', data);
export const getCustomerOrders = () => api.get('/customer/orders');
export const getFarmerOrders = () => api.get('/features/farmer/orders');
export const acceptOrder = (orderId: number) => api.put(`/features/farmer/orders/${orderId}/accept`);
export const rejectOrder = (orderId: number) => api.put(`/features/farmer/orders/${orderId}/reject`);
export const getOrderInvoice = (orderId: number) => api.get(`/orders/${orderId}/invoice`);
export const downloadInvoicePdf = (orderId: number) => api.get(`/orders/${orderId}/invoice/pdf`);

// BLOG APIs
export const getBlogs = () => api.get('/blogs');
export const getBlogById = (id: number) => api.get(`/blogs/${id}`);

// EXPORT APIs
export const applyExport = (data: any) => api.post('/features/export/apply', data);
export const getFarmerExports = () => api.get('/features/farmer/exports');

// FARMER FINANCIAL APIs
export const getWalletBalance = () => api.get('/wallet/balance');
export const getPendingMoney = () => api.get('/features/farmer/pending-money');
export const getTotalIncome = () => api.get('/features/farmer/total-income');
export const getWalletTransactions = () => api.get('/wallet/transactions');
export const addCashToWallet = (amount: number) => api.post('/wallet/add-cash', { amount });

// CASHOUT APIs
export const getMyCashoutRequests = () => api.get('/cashout/my-requests');
export const requestCashout = (amount: number, details: any) => api.post('/cashout/request', { amount, ...details });

// FEATURE APIs (Export, Subsidy, Review)
export const getSubsidySchemes = () => api.get('/features/subsidy/schemes');
export const applySubsidy = (data: any) => api.post('/features/subsidy/apply', data);
export const addReview = (data: any) => api.post('/features/review', data);
export const getMarketPrices = (district?: string) => api.get('/market-prices', { params: { district } });

// MESSENGER APIs
export const getChats = () => api.get('/messenger/chats');
export const getChatMessages = (chatId: number) => api.get(`/messenger/chats/${chatId}/messages`);
export const markChatAsRead = (chatId: number) => api.post(`/messenger/chats/${chatId}/read`);
export const sendMessage = (chatId: number, content: string) => api.post(`/messenger/chats/${chatId}/messages`, { content });
export const deleteChat = (chatId: number) => api.delete(`/messenger/chats/${chatId}`);
export const getAgronomists = () => api.get('/messages/agronomists');
export const sendDirectMessage = (data: any) => api.post('/messages', data);

// NOTIFICATION APIs
export const getNotifications = () => api.get('/notifications');

// AI API
export const chatWithAI = (payload: { query: string, lang?: string }) => api.post('/ai/chat', payload, {
    headers: { 'Content-Type': 'application/json' }
});
export const checkAIHealth = () => api.get('/ai/health');
export const getAIStatus = () => api.get('/ai/status');

