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
export const placeBid = (cropId: number, amount: number) => api.post(`/bids/${cropId}`, { amount });
export const getBidsByCrop = (cropId: number) => api.get(`/bids/${cropId}`);

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
