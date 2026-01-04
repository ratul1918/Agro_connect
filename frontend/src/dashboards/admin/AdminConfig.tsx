import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Bot, Settings, Save, Truck, Check } from 'lucide-react';

interface AdminConfigProps {
    config: any;
    setConfig: (config: any) => void;
    updateConfig: () => void;
    loading: boolean;
}

const AdminConfig: React.FC<AdminConfigProps> = ({
    config, setConfig, updateConfig, loading
}) => {
    return (
        <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-primary/10">
                        <Settings className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">System Configuration</h1>
                        <p className="text-muted-foreground">Manage AI settings and system defaults</p>
                    </div>
                </div>
                <Button
                    onClick={updateConfig}
                    disabled={loading}
                    size="lg"
                    className="gap-2"
                >
                    <Save className="h-4 w-4" />
                    {loading ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>

                <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                            <Bot className="h-5 w-5 text-primary dark:text-primary-foreground" />
                        </div>
                        <div>
                            <CardTitle className="dark:text-white">AI Configuration</CardTitle>
                            <CardDescription className="dark:text-gray-400">Configure your AI provider and model settings</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* AI Provider - Fixed to Gemini */}
                        <div className="space-y-2">
                            <Label htmlFor="ai-provider" className="text-base font-semibold dark:text-gray-200">
                                AI Provider
                            </Label>
                            <input
                                id="ai-provider"
                                type="text"
                                className="w-full h-10 px-3 rounded-md border border-input bg-muted text-sm dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                                value="Google Gemini"
                                disabled
                            />
                        </div>

                        {/* Model Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="ai-model" className="text-base font-semibold flex items-center gap-2 dark:text-gray-200">
                                Model Selection
                                <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">Performance</span>
                            </Label>
                            <select
                                id="ai-model"
                                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                value={config.ai_model || ''}
                                onChange={(e) => setConfig({ ...config, ai_model: e.target.value })}
                            >
                                <option value="">Select Model</option>
                                <option value="gemini-1.5-flash">⚡ Gemini 1.5 Flash (Recommended)</option>
                                <option value="gemini-1.5-pro">🔥 Gemini 1.5 Pro (High Quality)</option>
                                <option value="gemini-1.5-flash-8b">🚀 Gemini 1.5 Flash 8B (Fastest)</option>
                            </select>
                            <p className="text-xs text-muted-foreground dark:text-gray-400">
                                <strong>Flash:</strong> Fast & affordable for most queries<br/>
                                <strong>Pro:</strong> Best for complex agricultural analysis<br/>
                                <strong>Flash 8B:</strong> Ultra-fast for simple questions
                            </p>
                        </div>
                    </div>

                    {/* System Prompt */}
                    <div className="space-y-2">
                        <Label htmlFor="system-prompt" className="text-base font-semibold flex items-center gap-2 dark:text-gray-200">
                            System Prompt
                            <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded-full">AI Behavior</span>
                        </Label>
                        <textarea
                            id="system-prompt"
                            className="w-full min-h-[120px] px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
                            placeholder="You are an agricultural expert AI assistant. Help farmers with crop advice, disease diagnosis, and best practices..."
                            value={config.ai_system_prompt || ''}
                            onChange={(e) => setConfig({ ...config, ai_system_prompt: e.target.value })}
                        />
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground dark:text-gray-400">
                                <strong>💡 Tip:</strong> Define how the AI should behave and respond to users
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <button 
                                    type="button"
                                    onClick={() => setConfig({ ...config, ai_system_prompt: "You are an agricultural expert AI assistant. Help farmers with crop advice, disease diagnosis, pest control, irrigation tips, and modern farming best practices. Always provide practical, actionable advice suitable for the local climate and conditions." })}
                                    className="text-xs px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-900/40"
                                >
                                    🌾 Expert Advisor
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setConfig({ ...config, ai_system_prompt: "You are a friendly farming assistant. Use simple language, be encouraging, and help beginners with basic farming questions. Focus on easy-to-understand guidance for small-scale farmers." })}
                                    className="text-xs px-2 py-1 bg-green-50 hover:bg-green-100 text-green-700 rounded border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800 dark:hover:bg-green-900/40"
                                >
                                    🤝 Beginner Helper
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setConfig({ ...config, ai_system_prompt: "You are a crop disease specialist. Analyze symptoms, suggest treatments, provide prevention strategies, and recommend organic and chemical solutions when appropriate." })}
                                    className="text-xs px-2 py-1 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded border border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800 dark:hover:bg-orange-900/40"
                                >
                                    🔬 Disease Specialist
                                </button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Customer Logistics Card */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                            <Truck className="h-5 w-5 text-green-700 dark:text-green-400" />
                        </div>
                        <div>
                            <CardTitle className="dark:text-white">Customer Logistics</CardTitle>
                            <CardDescription className="dark:text-gray-400">Manage delivery charges and shipping settings</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="del-dhaka" className="dark:text-gray-200">Delivery Charge (Inside Dhaka)</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-gray-500 dark:text-gray-400">৳</span>
                                <input
                                    id="del-dhaka"
                                    type="number"
                                    className="w-full h-10 pl-8 pr-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                    value={config.delivery_charge_dhaka || '70'}
                                    onChange={(e) => setConfig({ ...config, delivery_charge_dhaka: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="del-outside" className="dark:text-gray-200">Delivery Charge (Outside Dhaka)</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-gray-500 dark:text-gray-400">৳</span>
                                <input
                                    id="del-outside"
                                    type="number"
                                    className="w-full h-10 pl-8 pr-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                    value={config.delivery_charge_outside || '130'}
                                    onChange={(e) => setConfig({ ...config, delivery_charge_outside: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* AI Status Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-800">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 dark:text-white">
                        🤖 AI System Status
                        <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full">Ready</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100 dark:bg-gray-800 dark:border-blue-800">
                            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium dark:text-gray-200">Provider Status</p>
                                <p className="text-xs text-muted-foreground dark:text-gray-400">Google Gemini Active</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100 dark:bg-gray-800 dark:border-blue-800">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                <Settings className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium dark:text-gray-200">Configuration</p>
                                <p className="text-xs text-muted-foreground dark:text-gray-400">
                                    {config.ai_model ? `Model: ${config.ai_model}` : 'Model not selected'}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Quick Actions</h4>
                        <div className="flex flex-wrap gap-2">
                            <button 
                                type="button"
                                onClick={() => window.open('/admin#api-keys', '_self')}
                                className="text-xs px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1"
                            >
                                🔑 Configure API Keys
                            </button>
                            <button 
                                type="button"
                                onClick={() => window.open('/chat', '_blank')}
                                className="text-xs px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-1"
                            >
                                💬 Test AI Chat
                            </button>
                            <button 
                                type="button"
                                onClick={() => window.open('https://makersuite.google.com/app/apikey', '_blank')}
                                className="text-xs px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-1"
                            >
                                🏪 Get Gemini API Key
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                        <p className="font-semibold dark:text-gray-200">💡 Configuration Tips:</p>
                        <ul className="space-y-1 ml-3">
                            <li>• <strong>Gemini 1.5 Flash</strong> is recommended for most agricultural queries</li>
                            <li>• <strong>Multilingual support:</strong> Perfect for Bangla and English conversations</li>
                            <li>• <strong>Cost-effective:</strong> Lower token costs compared to other providers</li>
                            <li>• <strong>Image analysis:</strong> Supports plant disease diagnosis from photos</li>
                            <li>• <strong>API Key required:</strong> Configure in API Keys section before testing</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminConfig;
