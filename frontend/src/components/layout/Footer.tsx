import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Facebook, Twitter, Instagram, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

const Footer: React.FC = () => {
    return (
        <footer className="bg-slate-950 text-white border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
                    {/* Brand */}
                    <div className="space-y-6">
                        <div className="flex items-center space-x-2">
                            <div className="bg-green-600 p-2 rounded-lg">
                                <Leaf className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">AgroConnect</span>
                        </div>
                        <p className="text-slate-400 leading-relaxed text-sm">
                            Empowering farmers and connecting communities with fresh, sustainable produce directly from the source.
                        </p>
                        <div className="flex space-x-4">
                            {[Facebook, Twitter, Instagram].map((Icon, i) => (
                                <a key={i} href="#" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-green-600 hover:text-white transition-all duration-300">
                                    <Icon className="h-5 w-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6 text-white">Platform</h3>
                        <ul className="space-y-4">
                            <li><Link to="/marketplace" className="text-slate-400 hover:text-green-400 transition-colors flex items-center gap-2 text-sm"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>Marketplace</Link></li>
                            <li><Link to="/market-prices" className="text-slate-400 hover:text-green-400 transition-colors flex items-center gap-2 text-sm"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>Market Prices</Link></li>
                            <li><Link to="/blogs" className="text-slate-400 hover:text-green-400 transition-colors flex items-center gap-2 text-sm"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>Success Stories</Link></li>
                            <li><Link to="/about" className="text-slate-400 hover:text-green-400 transition-colors flex items-center gap-2 text-sm"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>About Us</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6 text-white">Contact</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start space-x-3 text-slate-400 text-sm">
                                <MapPin className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                <span>Dhaka, Bangladesh</span>
                            </li>
                            <li className="flex items-center space-x-3 text-slate-400 text-sm">
                                <Phone className="h-5 w-5 text-green-500 shrink-0" />
                                <span>+880 1XXX-XXXXXX</span>
                            </li>
                            <li className="flex items-center space-x-3 text-slate-400 text-sm">
                                <Mail className="h-5 w-5 text-green-500 shrink-0" />
                                <span>support@agroconnect.com</span>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6 text-white">Stay Updated</h3>
                        <p className="text-slate-400 text-sm mb-4">Subscribe to our newsletter for the latest agricultural trends and price updates.</p>
                        <div className="space-y-3">
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-green-500"
                            />
                            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                                Subscribe <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-500 text-sm">&copy; {new Date().getFullYear()} AgroConnect. All rights reserved.</p>
                    <div className="flex gap-6 text-sm text-slate-500">
                        <Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link to="#" className="hover:text-white transition-colors">Terms of Service</Link>
                        <Link to="#" className="hover:text-white transition-colors">Cookie Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
