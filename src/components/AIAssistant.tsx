import React from 'react';
import { Send, Bot, Copy, User, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { aiAgent } from '../services/AIAgent';

interface AIAssistantProps {
    userName?: string;
    apiKey?: string;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ userName, apiKey }) => {
    const [input, setInput] = React.useState('');
    const [messages, setMessages] = React.useState<{ role: 'user' | 'assistant' | 'error'; content: string }[]>([
        { role: 'assistant', content: `Hello${userName ? ' ' + userName : ''}! I'm your AI assistant powered by Gemini. How can I help you today?` }
    ]);
    const [isTyping, setIsTyping] = React.useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;
        if (!apiKey) {
            setMessages(prev => [...prev, { role: 'user', content: input }, { role: 'error', content: 'Please set your Gemini API Key in Settings to use the AI.' }]);
            setInput('');
            return;
        }

        const userMessage = input;
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setInput('');
        setIsTyping(true);

        try {
            // Use the shared agent if initialized, or fallback to direct call (though agent should be init)
            // For consistency, we should probably move all logic to AIAgent, but for now we keep direct chat here
            // and use AIAgent for background tasks/summaries.
            // Actually, let's use the agent for everything if possible, but the agent class I wrote
            // is designed for background processing. Let's just use it for "Catch Up" for now.

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

            const result = await model.generateContent(userMessage);
            const response = result.response;
            const text = response.text();

            setMessages(prev => [...prev, { role: 'assistant', content: text }]);

            // Also feed this interaction to memory? 
            // memoryService.addMessage('user', userMessage); // Optional

        } catch (error: any) {
            console.error("Gemini Error:", error);
            const errorMessage = error.message || 'Unknown error occurred';
            setMessages(prev => [...prev, { role: 'error', content: `Failed to get response from Gemini: ${errorMessage}. Please check your API key.` }]);
        } finally {
            setIsTyping(false);
        }
    };

    React.useEffect(() => {
        if (apiKey) {
            aiAgent.init(apiKey);
        }
    }, [apiKey]);

    const handleCatchUp = async () => {
        if (!apiKey) return;
        setIsTyping(true);
        try {
            const summary = await aiAgent.getSummary();
            setMessages(prev => [...prev, { role: 'assistant', content: `**Catch Up Summary:**\n\n${summary}` }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'error', content: 'Failed to generate summary.' }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-gray-900 text-white">
            <div className="flex items-center p-4 border-b border-white/10 bg-gray-900/50 backdrop-blur-md justify-between">
                <div className="flex items-center">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/20 mr-3">
                        <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-lg">AI Assistant</h2>
                        <p className="text-xs text-gray-400">Powered by Gemini</p>
                    </div>
                </div>
                <button
                    onClick={handleCatchUp}
                    disabled={isTyping || !apiKey}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs font-medium transition-colors border border-white/10 disabled:opacity-50"
                    title="Summarize recent chats"
                >
                    <RefreshCw size={14} />
                    Catch Up
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl p-4 ${msg.role === 'user'
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : msg.role === 'error'
                                ? 'bg-red-900/50 border border-red-500/50 text-red-200 rounded-tl-none'
                                : 'bg-gray-800 text-gray-100 rounded-tl-none border border-white/5'
                            }`}>
                            {msg.role === 'error' && <AlertCircle size={16} className="inline-block mr-2 mb-1" />}
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                            {msg.role === 'assistant' && (
                                <div className="mt-3 flex gap-2">
                                    <button
                                        onClick={() => navigator.clipboard.writeText(msg.content)}
                                        className="text-xs flex items-center gap-1 px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
                                    >
                                        <Copy size={12} /> Copy
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-gray-800 rounded-2xl rounded-tl-none p-4 border border-white/5">
                            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-white/10 bg-gray-900/50 backdrop-blur-md">
                <div className="relative">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder={apiKey ? "Ask Gemini anything..." : "Please set API Key in Settings"}
                        className="w-full bg-gray-800/50 border border-white/10 rounded-xl p-4 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 resize-none h-24"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isTyping}
                        className="absolute right-3 bottom-3 p-2 bg-pink-600 rounded-lg text-white hover:bg-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};
