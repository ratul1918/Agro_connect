import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Bot, Settings, Save } from 'lucide-react';

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

            {/* AI Configuration Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Bot className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle>AI Configuration</CardTitle>
                            <CardDescription>Configure your AI provider and model settings</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* AI Provider */}
                        <div className="space-y-2">
                            <Label htmlFor="ai-provider" className="text-base font-semibold">
                                AI Provider
                            </Label>
                            <select
                                id="ai-provider"
                                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                value={config.ai_provider || ''}
                                onChange={(e) => setConfig({ ...config, ai_provider: e.target.value })}
                            >
                                <option value="">Select Provider</option>
                                <option value="openai">OpenAI</option>
                                <option value="gemini">Google Gemini</option>
                                <option value="anthropic">Anthropic Claude</option>
                                <option value="openrouter">OpenRouter</option>
                            </select>
                            <p className="text-xs text-muted-foreground">
                                Choose your preferred AI service provider
                            </p>
                        </div>

                        {/* Model Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="ai-model" className="text-base font-semibold">
                                Model
                            </Label>
                            {config.ai_provider === 'gemini' ? (
                                <>
                                    <select
                                        id="ai-model"
                                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        value={config.ai_model || ''}
                                        onChange={(e) => setConfig({ ...config, ai_model: e.target.value })}
                                    >
                                        <option value="">Select Model</option>
                                        <option value="gemini-3-flash">Gemini 3 Flash</option>
                                        <option value="gemini-3-pro">Gemini 3 Pro</option>
                                        <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash (Experimental)</option>
                                        <option value="gemini-exp-1206">Gemini Exp 1206 (Latest)</option>
                                        <option value="gemini-2.0-flash-thinking-exp-1219">Gemini 2.0 Flash Thinking</option>
                                        <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                                        <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                                        <option value="gemini-1.5-flash-8b">Gemini 1.5 Flash 8B</option>
                                    </select>
                                    <p className="text-xs text-muted-foreground">
                                        Select from available Gemini models
                                    </p>
                                </>
                            ) : (
                                <>
                                    <input
                                        id="ai-model"
                                        type="text"
                                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        placeholder={
                                            config.ai_provider === 'openai' ? 'e.g., gpt-4o' :
                                                config.ai_provider === 'anthropic' ? 'e.g., claude-3-5-sonnet-20241022' :
                                                    config.ai_provider === 'openrouter' ? 'e.g., google/gemini-2.0-flash-exp:free' :
                                                        'Enter model name'
                                        }
                                        value={config.ai_model || ''}
                                        onChange={(e) => setConfig({ ...config, ai_model: e.target.value })}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        {config.ai_provider === 'openrouter'
                                            ? 'Paste model ID from OpenRouter (e.g., google/gemini-2.0-flash-exp:free)'
                                            : 'Enter the exact model identifier'}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* System Prompt */}
                    <div className="space-y-2">
                        <Label htmlFor="system-prompt" className="text-base font-semibold">
                            System Prompt
                        </Label>
                        <textarea
                            id="system-prompt"
                            className="w-full min-h-[120px] px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                            placeholder="You are an agricultural expert AI assistant. Help farmers with crop advice, disease diagnosis, and best practices..."
                            value={config.ai_system_prompt || ''}
                            onChange={(e) => setConfig({ ...config, ai_system_prompt: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">
                            Define how the AI should behave and respond to users
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Info Card */}
            <Card className="bg-muted/50">
                <CardHeader>
                    <CardTitle className="text-lg">Configuration Tips</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0"></span>
                            <span><strong>Gemini</strong> offers the most cost-effective options with excellent multilingual support</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0"></span>
                            <span><strong>OpenRouter</strong> provides access to multiple providers through a single API</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0"></span>
                            <span>System prompts can be customized for specific agricultural domains or regions</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0"></span>
                            <span>Remember to save your changes after updating any configuration</span>
                        </li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminConfig;
