import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export class MoltbookClient {
    private apiKey: string;
    private baseUrl: string;
    private aiClient: any;

    constructor(apiKey: string, aiClient?: any) {
        this.apiKey = apiKey;
        this.aiClient = aiClient;
        this.baseUrl = process.env.MOLTBOOK_API_URL || 'https://www.moltbook.com/api/v1';
    }

    private getHeaders() {
        return {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };
    }

    private redact(key: string): string {
        if (!key) return 'NONE';
        return `${key.substring(0, 10)}...[REDACTED]`;
    }

    /**
     * Executes an API call with automatic retries (max 3)
     */
    private async requestWithRetry(fn: () => Promise<any>, retries = 3): Promise<any> {
        let attempt = 0;
        while (attempt < retries) {
            try {
                return await fn();
            } catch (error: any) {
                attempt++;
                if (attempt >= retries) throw error;
                const delay = Math.pow(2, attempt) * 1000;
                console.log(`⚠️ Request failed. Retrying in ${delay}ms... (Attempt ${attempt}/${retries})`);
                await new Promise(r => setTimeout(r, delay));
            }
        }
    }

    /**
     * Solve AI Verification Challenge
     */
    private async solveChallenge(challenge: string): Promise<string> {
        if (!this.aiClient) return "0.00";

        console.log("🧠 Solving AI Verification Challenge...");
        const prompt = `Solve this obfuscated math problem. Respond ONLY with the numeric answer (e.g., '15.00'). 
        The problem contains two numbers and an operation (+, -, *, /) hidden in symbols and alternating caps.
        
        Challenge: "${challenge}"`;

        const answer = await this.aiClient.chat([{ role: 'user', content: prompt }], "You are a math solver for AI verification challenges.");
        return answer.trim().replace(/[^0-9.-]/g, '') || "0.00";
    }

    /**
     * Verify solution
     */
    private async verify(code: string, answer: string): Promise<void> {
        await this.requestWithRetry(() => axios.post(`${this.baseUrl}/verify`, {
            verification_code: code,
            answer: parseFloat(answer).toFixed(2)
        }, {
            headers: this.getHeaders()
        }));
        console.log(`✅ Verification successful.`);
    }

    /**
     * Post to a submolt
     */
    async post(submoltName: string, title: string, body: string): Promise<any> {
        console.log(`📝 Posting to m/${submoltName}: "${title}"`);
        try {
            const response = await this.requestWithRetry(() => axios.post(`${this.baseUrl}/posts`, {
                submolt_name: submoltName,
                title: title,
                content: body
            }, {
                headers: this.getHeaders()
            }));

            if (response.data.verification_required) {
                const answer = await this.solveChallenge(response.data.post.verification.challenge_text);
                await this.verify(response.data.post.verification.verification_code, answer);
            }

            console.log(`✅ Post published successfully.`);
            return response.data;
        } catch (error: any) {
            console.error('❌ Moltbook Posting Failed:', error.response?.data?.message || error.message);
            return null;
        }
    }

    /**
     * Heartbeat check
     */
    async heartbeat(): Promise<any> {
        console.log("💓 Executing Moltbook Heartbeat...");
        try {
            const response = await this.requestWithRetry(() => axios.get(`${this.baseUrl}/home`, {
                headers: this.getHeaders()
            }));

            const notifications = response.data.notifications?.filter((n: any) => !n.is_read) || [];
            console.log(`📊 Heartbeat complete. ${notifications.length} new notifications.`);
            return response.data;
        } catch (error: any) {
            console.error('❌ Heartbeat failed:', error.message);
            return null;
        }
    }

    /**
     * Register a new agent
     */
    static async register(name: string, description: string): Promise<any> {
        const baseUrl = process.env.MOLTBOOK_API_URL || 'https://www.moltbook.com/api/v1';
        console.log(`🚀 Registering agent: ${name}`);
        try {
            const response = await axios.post(`${baseUrl}/agents/register`, {
                name,
                description
            });

            return {
                apiKey: response.data.agent.api_key,
                claimUrl: response.data.agent.claim_url,
                verificationCode: response.data.agent.verification_code
            };
        } catch (error: any) {
            console.error('❌ Registration Failed:', error.response?.data?.message || error.message);
            return null;
        }
    }
}
