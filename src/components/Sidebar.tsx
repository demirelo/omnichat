import React from 'react';
import { MessageSquare, Disc, Send, Sparkles, Settings, Mail } from 'lucide-react';

interface SidebarProps {
    activeService: string;
    onServiceChange: (service: string) => void;
    onOpenSettings: () => void;
    unreadCounts?: Record<string, number>;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeService, onServiceChange, onOpenSettings, unreadCounts = {} }) => {
    const services = [
        { id: 'slack', icon: MessageSquare, color: 'text-purple-400', label: 'Slack' },
        { id: 'discord', icon: Disc, color: 'text-indigo-400', label: 'Discord' },
        { id: 'telegram', icon: Send, color: 'text-blue-400', label: 'Telegram' },
        { id: 'gmail', icon: Mail, color: 'text-red-400', label: 'Gmail' },
    ];

    return (
        <div className="w-20 h-full flex flex-col items-center py-2 bg-gray-900/80 backdrop-blur-xl border-r border-white/10">
            <div className="mb-6 mt-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 no-drag">
                    <Sparkles className="w-6 h-6 text-white" />
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-4 w-full px-3 overflow-y-auto no-scrollbar">
                {services.map((service) => (
                    <button
                        key={service.id}
                        onClick={() => onServiceChange(service.id)}
                        className={`
                            group relative w-full aspect-square rounded-2xl flex items-center justify-center transition-all duration-300 no-drag
                            ${activeService === service.id
                                ? 'bg-white/10 shadow-inner text-white'
                                : 'hover:bg-white/5 text-gray-400 hover:text-white'}
                        `}
                    >
                        {activeService === service.id && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                        )}

                        {/* Notification Badge */}
                        {unreadCounts[service.id] > 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-gray-900 z-10">
                                <span className="text-[10px] font-bold text-white">
                                    {unreadCounts[service.id] > 9 ? '9+' : unreadCounts[service.id]}
                                </span>
                            </div>
                        )}

                        <service.icon className={`w-6 h-6 transition-transform duration-300 group-hover:scale-110 ${activeService === service.id ? service.color : ''}`} />
                    </button>
                ))}
            </div>

            <div className="flex-grow" />

            <div className="flex flex-col gap-2 mb-4">
                <button
                    onClick={onOpenSettings}
                    className="p-3 rounded-xl transition-all duration-300 group relative hover:bg-white/5 text-gray-400 hover:text-white no-drag"
                    title="Settings"
                >
                    <Settings size={24} className="transition-transform duration-300 group-hover:rotate-90" />
                </button>

                <button
                    onClick={() => onServiceChange('ai')}
                    className={`p-3 rounded-xl transition-all duration-300 group relative no-drag ${activeService === 'ai' ? 'bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30' : 'hover:bg-white/5'
                        }`}
                    title="AI Assistant"
                >
                    <Sparkles
                        size={28}
                        className={`transition-all duration-300 ${activeService === 'ai' ? 'text-pink-400' : 'text-gray-400 group-hover:text-pink-300'
                            }`}
                    />
                </button>
            </div>
        </div>
    );
};
