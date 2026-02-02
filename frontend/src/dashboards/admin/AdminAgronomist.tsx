import React from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { User, Mail, Phone, Lock, BadgeCheck, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface AdminAgronomistProps {
    agronomistForm: any;
    setAgronomistForm: (form: any) => void;
    handleAddAgronomist: (e: React.FormEvent) => void;
    agronomistMessage: string;
    loading: boolean;
}

const AdminAgronomist: React.FC<AdminAgronomistProps> = ({
    agronomistForm, setAgronomistForm, handleAddAgronomist, agronomistMessage, loading
}) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAgronomistForm({
            ...agronomistForm,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="relative min-h-[calc(100vh-100px)] flex items-center justify-center p-4">
            {/* Background Decorations */}
            <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-72 h-72 bg-teal-500/20 rounded-full blur-[100px] pointer-events-none animate-pulse delay-700"></div>

            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                {/* Left Side: Live Preview Card */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="hidden lg:flex flex-col items-center justify-center"
                >
                    <div className="relative w-full max-w-md aspect-[3/4] rounded-[2rem] overflow-hidden shadow-2xl border border-white/20 backdrop-blur-xl bg-white/10 dark:bg-gray-900/40 p-1">
                        {/* ID Card Design */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-teal-500/10 z-0"></div>
                        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-blue-600 to-blue-500 opacity-90 z-0"></div>

                        <div className="relative z-10 h-full flex flex-col items-center pt-12 pb-8 px-8 text-center">
                            {/* Avatar */}
                            <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl bg-white flex items-center justify-center mb-6 overflow-hidden">
                                <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-200">
                                    <User className="w-16 h-16" />
                                </div>
                            </div>

                            {/* Info */}
                            <div className="space-y-2 mb-8">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white filter drop-shadow-sm">
                                    {agronomistForm.fullName || "Expert Name"}
                                </h2>
                                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold">
                                    <BadgeCheck className="w-4 h-4" /> Certified Agronomist
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="w-full grid grid-cols-1 gap-4 mt-auto">
                                <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-xl border border-white/20 backdrop-blur-sm">
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Email</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {agronomistForm.email || "expert@example.com"}
                                    </p>
                                </div>
                                <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-xl border border-white/20 backdrop-blur-sm">
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Contact</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {agronomistForm.phone || "+880 1XXX-XXXXXX"}
                                    </p>
                                </div>
                            </div>

                            {/* Footer Badges */}
                            <div className="mt-8 flex gap-4 w-full justify-center opacity-70 grayscale">
                                <div className="h-2 w-12 bg-gray-400 rounded-full"></div>
                                <div className="h-2 w-12 bg-gray-400 rounded-full"></div>
                                <div className="h-2 w-12 bg-gray-400 rounded-full"></div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 text-center max-w-sm">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Create Expert Profile</h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            Authorized experts gain access to advanced diagnostic tools and community advisory features.
                        </p>
                    </div>
                </motion.div>

                {/* Right Side: Form */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full"
                >
                    <div className="glass-card rounded-3xl border border-white/20 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl shadow-2xl p-8 md:p-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <ShieldCheck className="w-32 h-32" />
                        </div>

                        <div className="relative z-10 space-y-8">
                            <div>
                                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500 mb-2">
                                    New Credential
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Register a new verified expert to the AgroConnect network.
                                </p>
                            </div>

                            <form onSubmit={handleAddAgronomist} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                        <Input
                                            name="fullName"
                                            placeholder="Dr. John Doe"
                                            value={agronomistForm.fullName}
                                            onChange={handleChange}
                                            className="pl-12 h-14 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Email Address</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                            <Input
                                                name="email"
                                                type="email"
                                                placeholder="expert@agro.com"
                                                value={agronomistForm.email}
                                                onChange={handleChange}
                                                className="pl-12 h-14 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Phone Number</label>
                                        <div className="relative group">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                            <Input
                                                name="phone"
                                                placeholder="+880 1XXX..."
                                                value={agronomistForm.phone}
                                                onChange={handleChange}
                                                className="pl-12 h-14 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Secure Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                        <Input
                                            name="password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={agronomistForm.password}
                                            onChange={handleChange}
                                            className="pl-12 h-14 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                                            required
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-14 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all transform hover:-translate-y-1 mt-4"
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <span className="loading loading-spinner loading-sm"></span> Processing...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Sparkles className="w-5 h-5" /> Generate Expert Profile
                                        </span>
                                    )}
                                </Button>

                                {agronomistMessage && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`p-4 rounded-xl text-sm font-medium flex items-center gap-3 ${agronomistMessage.includes('❌')
                                                ? 'bg-red-50 text-red-600 border border-red-100 dark:bg-red-900/20 dark:border-red-800'
                                                : 'bg-green-50 text-green-600 border border-green-100 dark:bg-green-900/20 dark:border-green-800'
                                            }`}
                                    >
                                        {agronomistMessage}
                                    </motion.div>
                                )}
                            </form>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminAgronomist;
