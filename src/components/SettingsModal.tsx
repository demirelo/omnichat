import React from 'react';
import { X, Save, Key, User } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (settings: UserSettings) => void;
    initialSettings: UserSettings;
}

export interface UserSettings {
    userName: string;
    openaiKey: string;
    geminiKey: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, initialSettings }) => {
    const [settings, setSettings] = React.useState<UserSettings>(initialSettings);

    React.useEffect(() => {
        setSettings(initialSettings);
    }, [initialSettings, isOpen]);

    if (!isOpen) return null;

    const handleChange = (field: keyof UserSettings, value: string) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(settings);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gray-800/50">
                    <h2 className="text-lg font-semibold text-white">Settings</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1.5 flex items-center gap-2">
                                <User size={16} />
                                Your Name
                            </label>
                            <input
                                type="text"
                                value={settings.userName}
                                onChange={(e) => handleChange('userName', e.target.value)}
                                placeholder="e.g. Alice"
                                className="w-full bg-gray-950 border border-white/10 rounded-xl p-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            />
                            <p className="mt-1.5 text-xs text-gray-500">This helps the AI know who you are.</p>
                        </div>

                        <div className="pt-4 border-t border-white/5">
                            <h3 className="text-sm font-medium text-gray-300 mb-3">API Keys</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1.5 flex items-center gap-2">
                                        <Key size={16} />
                                        OpenAI API Key
                                    </label>
                                    <input
                                        type="password"
                                        value={settings.openaiKey}
                                        onChange={(e) => handleChange('openaiKey', e.target.value)}
                                        placeholder="sk-..."
                                        className="w-full bg-gray-950 border border-white/10 rounded-xl p-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1.5 flex items-center gap-2">
                                        <Key size={16} />
                                        Gemini API Key
                                    </label>
                                    <input
                                        type="password"
                                        value={settings.geminiKey}
                                        onChange={(e) => handleChange('geminiKey', e.target.value)}
                                        placeholder="AIza..."
                                        className="w-full bg-gray-950 border border-white/10 rounded-xl p-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/20"
                        >
                            <Save size={18} />
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
