import React from 'react';

interface LayoutProps {
    sidebar: React.ReactNode;
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ sidebar, children }) => {
    return (
        <div className="flex h-screen w-screen bg-gray-950 text-white overflow-hidden selection:bg-blue-500/30">
            {/* Draggable Title Bar Area */}
            <div className="absolute top-0 left-0 right-0 h-8 z-[100] drag-region flex items-center" />

            <aside className="flex-shrink-0 z-50 relative pt-8">
                {sidebar}
            </aside>
            <main className="flex-1 relative bg-gray-900/50 pt-8">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />
                {children}
            </main>
        </div>
    );
};
