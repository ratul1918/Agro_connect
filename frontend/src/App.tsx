import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { Toaster } from 'react-hot-toast';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import NavOnlyLayout from './components/layout/NavOnlyLayout';

// Public Pages
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import MessagesPage from './pages/MessagesPage';
import RetailMarketplacePage from './pages/RetailMarketplacePage';
import B2BMarketplacePage from './pages/B2BMarketplacePage';
import MarketPricesPage from './pages/MarketPricesPage';
import AboutPage from './pages/AboutPage';
import BlogsPage from './pages/BlogsPage';
import BlogDetailPage from './pages/BlogDetailPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import AgronomistDirectoryPage from './pages/AgronomistDirectoryPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import NotFoundPage from './pages/NotFoundPage';

// Dashboard Pages
import AdminDashboard from './dashboards/AdminDashboard';
import FarmerDashboard from './dashboards/FarmerDashboard';
import BuyerDashboard from './dashboards/BuyerDashboard';
import AgronomistDashboard from './dashboards/AgronomistDashboard';
import CustomerDashboard from './dashboards/CustomerDashboard';

// Components
import PrivateRoute from './components/PrivateRoute';
import MobileDashboardContainer from './components/MobileDashboardContainer';
import ErrorBoundary from './components/ErrorBoundary';

// Theme-aware Toaster
const ThemedToaster = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark' || theme === 'forest';

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: isDark ? '#1f2937' : '#ffffff',
          color: isDark ? '#f3f4f6' : '#111827',
          border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#ffffff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#ffffff',
          },
        },
      }}
    />
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                {/* Public Routes with Navbar & Footer */}
                <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
                <Route path="/marketplace" element={<Navigate to="/marketplace/retail" />} />
                <Route path="/marketplace/retail" element={<PublicLayout><RetailMarketplacePage /></PublicLayout>} />
                <Route path="/marketplace/b2b" element={<PublicLayout><B2BMarketplacePage /></PublicLayout>} />
                <Route path="/crop/:id" element={<PublicLayout><ProductDetailsPage /></PublicLayout>} />
                <Route path="/cart" element={<PublicLayout><CartPage /></PublicLayout>} />
                <Route path="/checkout" element={<PublicLayout><CheckoutPage /></PublicLayout>} />
                <Route path="/orders" element={<PublicLayout><OrdersPage /></PublicLayout>} />
                <Route path="/market-prices" element={<PublicLayout><MarketPricesPage /></PublicLayout>} />
                <Route path="/blogs" element={<PublicLayout><BlogsPage /></PublicLayout>} />
                <Route path="/blogs/:id" element={<PublicLayout><BlogDetailPage /></PublicLayout>} />
                <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />

                {/* Profile & Settings Routes (Protected) */}
                <Route path="/profile" element={<PublicLayout><PrivateRoute><ProfilePage /></PrivateRoute></PublicLayout>} />
                <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
                <Route path="/messages" element={<PrivateRoute><NavOnlyLayout><MessagesPage /></NavOnlyLayout></PrivateRoute>} />
                <Route path="/agronomists" element={<PrivateRoute><NavOnlyLayout><AgronomistDirectoryPage /></NavOnlyLayout></PrivateRoute>} />

                {/* Auth Routes (no navbar/footer) */}
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/login" element={<Navigate to="/auth" />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                {/* Protected Dashboard Routes */}
                <Route path="/admin/*" element={<PrivateRoute><MobileDashboardContainer><AdminDashboard /></MobileDashboardContainer></PrivateRoute>} />
                <Route path="/farmer/*" element={<PrivateRoute><MobileDashboardContainer><FarmerDashboard /></MobileDashboardContainer></PrivateRoute>} />
                <Route path="/buyer/*" element={<PrivateRoute><MobileDashboardContainer><BuyerDashboard /></MobileDashboardContainer></PrivateRoute>} />
                <Route path="/agronomist/*" element={<PrivateRoute><MobileDashboardContainer><AgronomistDashboard /></MobileDashboardContainer></PrivateRoute>} />
                <Route path="/customer/*" element={<PrivateRoute><MobileDashboardContainer><CustomerDashboard /></MobileDashboardContainer></PrivateRoute>} />

                {/* 404 Not Found - Catch all */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
              <ThemedToaster />
            </AuthProvider>
          </BrowserRouter>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
