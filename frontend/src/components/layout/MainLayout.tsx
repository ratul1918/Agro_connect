import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, Leaf } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';
// We will replace these with actual shadcn components later if needed, using raw for now for speed or generic html

// Placeholder sidebar items - these will be dynamic based on role later
const sidebarItems = [
    { label: 'Home', path: '/', icon: '🏠' },
    { label: 'Marketplace', path: '/marketplace', icon: '🛒' },
    { label: 'Bidding', path: '/bidding', icon: '🔨' },
    { label: 'Advisory', path: '/advisory', icon: '🤖' },
];

const MainLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { theme, setTheme } = useTheme();
    const location = useLocation();

    return (
        <div className="flex h-screen w-full bg-background text-foreground transition-colors duration-300">
            {/* Sidebar (Mobile Overlay) */}
            <div className={cn(
                "fixed inset-0 z-50 bg-black/50 lg:hidden",
                sidebarOpen ? "block" : "hidden"
            )} onClick={() => setSidebarOpen(false)} />

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:block",
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex h-16 items-center justify-between px-6 border-b border-border">
                    <h1 className="text-xl font-bold text-primary font-bangla">Agro Connect</h1>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <nav className="p-4 space-y-2">
                    {sidebarItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors",
                                location.pathname === item.path ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground"
                            )}
                        >
                            <span>{item.icon}</span>
                            <span className="font-bangla">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="absolute bottom-4 left-4 right-4 p-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Theme</p>
                    <div className="flex gap-2">
                        <button onClick={() => setTheme('dark')} className={cn("p-2 rounded-md hover:bg-muted", theme === 'dark' && "bg-muted")}><Moon size={16} /></button>
                        <button onClick={() => setTheme('light')} className={cn("p-2 rounded-md hover:bg-muted", theme === 'light' && "bg-muted")}><Sun size={16} /></button>
                        <button onClick={() => setTheme('forest')} className={cn("p-2 rounded-md hover:bg-muted", theme === 'forest' && "bg-muted")}><Leaf size={16} /></button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Top Header (Mobile only toggle) */}
                <header className="h-16 flex items-center px-4 border-b border-border lg:hidden bg-card">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2">
                        <Menu className="h-6 w-6" />
                    </button>
                    <span className="ml-4 font-bold">Menu</span>
                </header>

                <div className="flex-1 overflow-auto p-4 md:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
