import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

export class AIClient {
    private client: OpenAI;
    private model: string;

    constructor() {
        const apiKey = process.env.AI_ML_API_KEY || '';
        const baseURL = process.env.AI_ML_API_URL || 'https://api.aimlapi.com/v1';
        this.model = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet';

        this.client = new OpenAI({
            apiKey: apiKey,
            baseURL: baseURL,
        });

        if (!apiKey) {
            console.warn('AI_ML_API_KEY is not set in .env');
        }
    }

    async chat(messages: { role: any; content: string }[], systemPrompt?: string) {
        const fullMessages = systemPrompt
            ? [{ role: 'system', content: systemPrompt }, ...messages]
            : messages;

        try {
            const response = await this.client.chat.completions.create({
                model: this.model,
                messages: fullMessages as any,
            });

            return response.choices[0].message.content || '';
        } catch (error: any) {
            console.error('AI/ML API Error:', error.message);
            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Data:', JSON.stringify(error.response.data, null, 2));
            } else {
                console.error('Full Error:', error);
            }
            throw error;
        }
    }

    async getReasoning(prompt: string, context: string): Promise<string> {
        const messages = [
            { role: 'user', content: `Context: ${context}\n\nTask: ${prompt}` }
        ];
        return this.chat(messages, "You are a highly logical AI agent in a decentralized marketplace. Analyze tasks and make strategic decisions.");
    }
}
