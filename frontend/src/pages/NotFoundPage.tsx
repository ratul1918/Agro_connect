import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Search, Home, ArrowRight } from 'lucide-react';

const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4 py-12">
            <div className="max-w-lg w-full">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="mb-8 flex justify-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-2xl opacity-30"></div>
                            <div className="relative bg-white dark:bg-gray-800 rounded-full p-6 shadow-lg">
                                <Search className="h-16 w-16 text-gradient-to-r from-blue-600 to-purple-600" />
                            </div>
                        </div>
                    </div>

                    <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
                        404
                    </h1>
                    
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                        Page Not Found
                    </h2>
                    
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                        The page you're looking for doesn't exist or has been moved. Don't worry, we'll help you get back on track.
                    </p>
                </div>

                {/* Suggestions */}
                <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">
                        What you can do:
                    </h3>
                    <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mt-0.5">
                                <span className="text-blue-600 dark:text-blue-400 font-semibold text-xs">1</span>
                            </span>
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">Check the URL</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Make sure the address is spelled correctly</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mt-0.5">
                                <span className="text-blue-600 dark:text-blue-400 font-semibold text-xs">2</span>
                            </span>
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">Go back</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Use your browser's back button to return</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mt-0.5">
                                <span className="text-blue-600 dark:text-blue-400 font-semibold text-xs">3</span>
                            </span>
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">Start fresh</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Go to the home page and navigate from there</p>
                            </div>
                        </li>
                    </ul>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <Button
                        onClick={() => navigate('/')}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all duration-200 hover:shadow-blue-600/30"
                    >
                        <Home className="h-5 w-5" />
                        Back to Home
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                    
                    <Button
                        onClick={() => navigate('/marketplace/retail')}
                        variant="outline"
                        className="w-full border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white font-semibold rounded-xl py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200"
                    >
                        Browse Marketplace
                    </Button>
                </div>

                {/* Footer Info */}
                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                        Still need help? <a href="/" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">Contact us</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;
