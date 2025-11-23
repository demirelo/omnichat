
import { GoogleGenerativeAI } from "@google/generative-ai";
import { memoryService } from "./MemoryService";

// We'll need to get the API key from somewhere. 
// For now, we assume it's passed in or stored in localStorage.

export class AIAgent {
    private genAI: GoogleGenerativeAI | null = null;
    private model: any = null;

    constructor(apiKey?: string) {
        if (apiKey) {
            this.init(apiKey);
        }
    }

    public init(apiKey: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite-preview-02-05" });
    }

    public async processNewMessages() {
        if (!this.model) return;

        const messages = memoryService.getRecentMessages(10);
        if (messages.length === 0) return;

        const profile = memoryService.getUserProfile();

        const prompt = `
      You are a helpful AI assistant embedded in a chat aggregator.
      
      User Profile:
      ${JSON.stringify(profile.facts)}
      
      Recent Messages:
      ${messages.map(m => `[${m.platform}] ${m.content}`).join('\n')}
      
      Task:
      1. Identify any new facts about the user (e.g., "I am a python dev") and output them as "FACT: <fact>".
      2. If there is something urgent or actionable, output "ACTION: <suggestion>".
      3. Otherwise, just output "OK".
    `;

        try {
            const result = await this.model.generateContent(prompt);
            const response = result.response.text();

            // Parse response
            const lines = response.split('\n');
            for (const line of lines) {
                if (line.startsWith('FACT:')) {
                    const fact = line.replace('FACT:', '').trim();
                    memoryService.addUserFact(fact);
                    console.log('[AIAgent] Learned fact:', fact);
                }
                if (line.startsWith('ACTION:')) {
                    const action = line.replace('ACTION:', '').trim();
                    console.log('[AIAgent] Suggestion:', action);
                    // In a real app, we'd trigger a UI notification here
                    return action;
                }
            }
        } catch (e) {
            console.error('AI Processing failed:', e);
        }
        return null;
    }

    public async getSummary(): Promise<string> {
        if (!this.model) return "AI not initialized";

        const messages = memoryService.getRecentMessages(50);
        const prompt = `
        Summarize the following chat logs for the user. Group by topic if possible.
        
        Messages:
        ${messages.map(m => `[${m.platform}] ${m.content}`).join('\n')}
      `;

        try {
            const result = await this.model.generateContent(prompt);
            return result.response.text();
        } catch (e) {
            return "Failed to generate summary.";
        }
    }
}

export const aiAgent = new AIAgent();
