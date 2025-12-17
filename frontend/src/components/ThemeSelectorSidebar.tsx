import React, { useState } from 'react';
import { Palette, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeSelectorSidebarProps {
    isSidebarOpen: boolean;
}

export const ThemeSelectorSidebar: React.FC<ThemeSelectorSidebarProps> = ({ isSidebarOpen }) => {
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const themes = [
        { id: 'light', name: 'Light', icon: '☀️' },
        { id: 'dark', name: 'Dark', icon: '🌙' },
        { id: 'forest', name: 'Forest', icon: '🌲' },
        { id: 'emerald', name: 'Emerald', icon: '💎' },
    ];

    const currentTheme = themes.find(t => t.id === theme) || themes[0];

    if (!isSidebarOpen) {
        return (
            <div className="relative px-2 py-3 border-t">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-center p-2.5 rounded-md transition-all duration-200 text-muted-foreground hover:bg-muted hover:text-foreground"
                    title="Change Theme"
                >
                    <Palette className="h-5 w-5 flex-shrink-0" />
                </button>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <div className="absolute left-full bottom-0 ml-2 z-50 bg-card border rounded-lg shadow-lg p-2 min-w-[180px]">
                            {themes.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => {
                                        setTheme(t.id as any);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-md transition-all duration-200 ${theme === t.id
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                        }`}
                                >
                                    <span className="flex items-center gap-2">
                                        <span>{t.icon}</span>
                                        <span className="font-medium">{t.name}</span>
                                    </span>
                                    {theme === t.id && <Check className="h-4 w-4" />}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="relative px-2 py-3 border-t">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
                <Palette className="h-5 w-5 flex-shrink-0" />
                <div className="flex-1 text-left">
                    <div className="text-sm font-medium">Theme</div>
                    <div className="text-xs opacity-70">{currentTheme.icon} {currentTheme.name}</div>
                </div>
            </button>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute bottom-full left-2 right-2 mb-2 z-50 bg-card border rounded-lg shadow-lg p-2">
                        {themes.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => {
                                    setTheme(t.id as any);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-md transition-all duration-200 ${theme === t.id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                            >
                                <span className="flex items-center gap-2">
                                    <span>{t.icon}</span>
                                    <span className="font-medium">{t.name}</span>
                                </span>
                                {theme === t.id && <Check className="h-4 w-4" />}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
