import { AIClient } from './ai-client.js';
import { BlockchainClient } from '../utils/blockchain.js';

export interface AgentProfile {
    name: string;
    skills: string[];
    hourlyRate: number;
    reputation: number;
    walletAddress: string;
}

export interface Job {
    id: string;
    description: string;
    payment: number;
    poster: string;
}

export class HivemindAgent {
    public profile: AgentProfile;
    public blockchain: BlockchainClient;
    private ai: AIClient;

    constructor(profile: AgentProfile, aiClient: AIClient, privateKey: string) {
        this.profile = profile;
        this.ai = aiClient;
        this.blockchain = new BlockchainClient(privateKey);
        // Address is ST30TRK58DT4P8CJQ8Y9D539X1VET78C63BNF0C9A for demo
        this.profile.walletAddress = 'ST30TRK58DT4P8CJQ8Y9D539X1VET78C63BNF0C9A';
    }

    async analyzeJob(job: Job): Promise<{ shouldBid: boolean; bidAmount: number; reasoning: string }> {
        const prompt = `
            You are ${this.profile.name}, an AI freelancer on Stacks Bitcoin L2.
            
            YOUR PROFILE:
            - Skills: ${this.profile.skills.join(', ')}
            - Hourly Rate: ${this.profile.hourlyRate} sBTC/hr
            - Personality: Competitive and logical.

            JOB DETAILS:
            - Description: ${job.description}
            - Client Budget: ${job.payment} sBTC

            TASK:
            1. Estimate how many hours this job will take you based on your skills.
            2. Calculate your minimum price = (Estimated Hours * Your Hourly Rate).
            3. Decide if you can do it within the Client's Budget.
            4. STRATEGY: 
               - If Minimum Price > Client Budget: REJECT the job (don't work for a loss).
               - If Minimum Price <= Client Budget: 
                 - If you are a high-rate agent, bid close to the budget but provide high quality.
                 - If you are a low-rate agent, try to UNDERCUT the market.
            
            RESPONSE FORMAT (JSON ONLY):
            {
                "shouldBid": boolean,
                "estimatedHours": number,
                "bidAmount": number,
                "reasoning": "I estimated X hours. My rate is Y. I bid Z to be competitive."
            }
        `;

        const response = await this.ai.chat([
            { role: 'user', content: prompt }
        ], "You are a strategic AI agent in a competitive marketplace. Return ONLY valid JSON.");

        try {
            const cleanResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanResponse);
        } catch (error) {
            return {
                shouldBid: false,
                bidAmount: 0,
                reasoning: "Error parsing decision logic."
            };
        }
    }

    async chooseModel(task: string): Promise<string> {
        const availableModels = [ "gpt-4o", "claude-3-5-sonnet", "meta-llama/llama-3.1-70b-instruct" ];
        const prompt = `Select the best AI model for this task: ${task}. List: ${availableModels.join(', ')}`;
        const response = await this.ai.chat([{ role: 'user', content: prompt }], "Return JSON: { \"selectedModel\": \"name\" }");
        try {
            const data = JSON.parse(response.replace(/```json/g, '').replace(/```/g, '').trim());
            return data.selectedModel;
        } catch (e) { return "gpt-4o"; }
    }

    async executeTask(jobDescription: string): Promise<string> {
        const bestModel = await this.chooseModel(jobDescription);
        const prompt = `Perform the following task: ${jobDescription}. Provide a detailed completion report. Output settled on Stacks via x402.`;
        return this.ai.chat([{ role: 'user', content: prompt }], `You are ${this.profile.name}, a specialist in ${this.profile.skills.join(', ')}.`, bestModel);
    }
}
