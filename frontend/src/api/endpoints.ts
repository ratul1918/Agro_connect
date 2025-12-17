import api from './axios';

// AUTH APIs
export const login = (credentials: any) => api.post('/auth/login', credentials);
export const signup = (data: any) => api.post('/auth/signup', data);
export const forgotPassword = (email: string) => api.post('/auth/forgot-password', { email });
export const resetPassword = (data: any) => api.post('/auth/reset-password', data);
export const getCurrentUser = () => api.get('/auth/me');
export const updateProfile = (data: any) => api.put('/auth/profile', data);

// ADMIN APIs
export const getAllUsers = () => api.get('/admin/users');
export const deleteUser = (id: number) => api.delete(`/admin/users/${id}`);
export const deleteCropAdmin = (id: number) => api.delete(`/admin/crops/${id}`);
export const deleteReviewAdmin = (id: number) => api.delete(`/admin/reviews/${id}`);

// CROP APIs
export const getAllCrops = () => api.get('/crops');
export const getCropById = (id: number) => api.get(`/crops/${id}`);
export const addCrop = (formData: FormData) => api.post('/crops', formData);
export const updateCrop = (id: number, formData: FormData) => api.put(`/crops/${id}`, formData);

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

// ORDER APIs
export const createOrder = (data: any) => api.post('/orders/create', data);

// FEATURE APIs (Export, Subsidy, Review)
export const applyExport = (data: any) => api.post('/features/export/apply', data);
export const getSubsidySchemes = () => api.get('/features/subsidy/schemes');
export const applySubsidy = (data: any) => api.post('/features/subsidy/apply', data);
export const addReview = (data: any) => api.post('/features/review', data);
export const getMarketPrices = (district?: string) => api.get('/market-prices', { params: { district } });

// AI API
export const chatWithAI = (payload: { query: string, lang?: string }) => api.post('/ai/chat', payload, {
    headers: { 'Content-Type': 'application/json' }
});
