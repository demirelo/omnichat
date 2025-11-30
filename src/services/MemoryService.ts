
export interface Message {
    id: string;
    platform: string;
    content: string;
    timestamp: number;
    sender?: string;
}

export interface UserProfile {
    facts: string[];
    preferences: Record<string, any>;
}

class MemoryService {
    private messages: Message[] = [];
    private userProfile: UserProfile = {
        facts: [],
        preferences: {}
    };
    private readonly MAX_HISTORY = 100;

    constructor() {
        this.load();
    }

    private load() {
        try {
            const saved = localStorage.getItem('omnichat_memory');
            if (saved) {
                const data = JSON.parse(saved);
                this.messages = data.messages || [];
                this.userProfile = data.userProfile || { facts: [], preferences: {} };
            }
        } catch (e) {
            console.error('Failed to load memory', e);
        }
    }

    private save() {
        try {
            localStorage.setItem('omnichat_memory', JSON.stringify({
                messages: this.messages,
                userProfile: this.userProfile
            }));
        } catch (e) {
            console.error('Failed to save memory', e);
        }
    }

    public addMessage(platform: string, content: string, sender?: string) {
        const msg: Message = {
            id: crypto.randomUUID(),
            platform,
            content,
            timestamp: Date.now(),
            sender
        };

        this.messages.push(msg);
        if (this.messages.length > this.MAX_HISTORY) {
            this.messages.shift();
        }
        this.save();
        return msg;
    }

    public getRecentMessages(limit: number = 20): Message[] {
        return this.messages.slice(-limit);
    }

    public addUserFact(fact: string) {
        if (!this.userProfile.facts.includes(fact)) {
            this.userProfile.facts.push(fact);
            this.save();
        }
    }

    public getUserProfile(): UserProfile {
        return this.userProfile;
    }

    public clearHistory() {
        this.messages = [];
        this.save();
    }
}

export const memoryService = new MemoryService();
