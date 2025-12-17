import React from 'react';
import { Palette } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle: React.FC = () => {
    const { theme, setTheme } = useTheme();

    const themes = [
        { id: 'light', name: 'Light ☀️' },
        { id: 'dark', name: 'Dark 🌙' },
        { id: 'forest', name: 'Forest 🌲' },
        { id: 'emerald', name: 'Emerald 💎' },
    ];

    return (
        <div className="dropdown dropdown-top w-full">
            <div tabIndex={0} role="button" className="btn btn-ghost w-full justify-start gap-3">
                <Palette className="w-5 h-5" />
                <span className="font-medium capitalize">{theme} Theme</span>
            </div>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 mb-2">
                {themes.map((t) => (
                    <li key={t.id}>
                        <a
                            className={theme === t.id ? 'active' : ''}
                            onClick={() => setTheme(t.id as any)}
                        >
                            {t.name}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};
