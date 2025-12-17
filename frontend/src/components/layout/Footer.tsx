import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Leaf className="h-8 w-8 text-green-500" />
                            <span className="text-2xl font-bold">AgroConnect</span>
                        </div>
                        <p className="text-gray-400">
                            Connecting farmers directly with buyers. Fresh produce, fair prices, sustainable agriculture.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-green-500 transition-colors">
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-green-500 transition-colors">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-green-500 transition-colors">
                                <Instagram className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li><Link to="/" className="text-gray-400 hover:text-green-500 transition-colors">Home</Link></li>
                            <li><Link to="/marketplace" className="text-gray-400 hover:text-green-500 transition-colors">Marketplace</Link></li>
                            <li><Link to="/market-prices" className="text-gray-400 hover:text-green-500 transition-colors">Market Prices</Link></li>
                            <li><Link to="/blogs" className="text-gray-400 hover:text-green-500 transition-colors">Blogs & Tips</Link></li>
                            <li><Link to="/about" className="text-gray-400 hover:text-green-500 transition-colors">About Us</Link></li>
                        </ul>
                    </div>

                    {/* For Users */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">For Users</h3>
                        <ul className="space-y-2">
                            <li><Link to="/auth" className="text-gray-400 hover:text-green-500 transition-colors">Login</Link></li>
                            <li><Link to="/auth?tab=signup" className="text-gray-400 hover:text-green-500 transition-colors">Register</Link></li>
                            <li><Link to="/farmer" className="text-gray-400 hover:text-green-500 transition-colors">Farmer Dashboard</Link></li>
                            <li><Link to="/buyer" className="text-gray-400 hover:text-green-500 transition-colors">Buyer Dashboard</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
                        <ul className="space-y-3">
                            <li className="flex items-center space-x-2 text-gray-400">
                                <MapPin className="h-5 w-5 text-green-500" />
                                <span>Dhaka, Bangladesh</span>
                            </li>
                            <li className="flex items-center space-x-2 text-gray-400">
                                <Phone className="h-5 w-5 text-green-500" />
                                <span>+880 1XXX-XXXXXX</span>
                            </li>
                            <li className="flex items-center space-x-2 text-gray-400">
                                <Mail className="h-5 w-5 text-green-500" />
                                <span>support@agroconnect.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                    <p>&copy; {new Date().getFullYear()} AgroConnect. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
