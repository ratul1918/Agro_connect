import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('❌ [ERROR BOUNDARY] Caught error:', error);
        console.error('❌ [ERROR BOUNDARY] Error Info:', errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <ErrorFallback error={this.state.error} />;
        }

        return this.props.children;
    }
}

const ErrorFallback: React.FC<{ error?: Error }> = ({ error }) => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate('/');
    };

    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/10 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
                <div className="mb-6 flex justify-center">
                    <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-4">
                        <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
                    </div>
                </div>
                
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Oops! Something Went Wrong
                </h1>
                
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                    We're sorry for the inconvenience. An unexpected error has occurred.
                </p>

                {error && (
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-6 text-left">
                        <p className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
                            {error.message}
                        </p>
                    </div>
                )}

                <div className="space-y-3">
                    <Button
                        onClick={handleRefresh}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 flex items-center justify-center gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh Page
                    </Button>
                    
                    <Button
                        onClick={handleGoHome}
                        variant="outline"
                        className="w-full border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg py-2 flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        <Home className="h-4 w-4" />
                        Back to Home
                    </Button>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
                    If the problem persists, please contact support
                </p>
            </div>
        </div>
    );
};

export default ErrorBoundary;
