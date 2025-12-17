import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

const CustomerDashboard: React.FC = () => {
    return (
        <Routes>
            {/* Default route - redirect to retail marketplace */}
            <Route path="/" element={<Navigate to="/marketplace/retail" replace />} />

            {/* Future routes for customer-specific features */}
            {/* <Route path="/orders" element={<MyOrdersPage />} /> */}
            {/* <Route path="/cart" element={<CartPage />} /> */}
            {/* <Route path="/checkout" element={<CheckoutPage />} /> */}
        </Routes>
    );
};

export default CustomerDashboard;
