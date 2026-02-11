import { AIClient } from './ai-client';

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
    private ai: AIClient;

    constructor(profile: AgentProfile, aiClient: AIClient) {
        this.profile = profile;
        this.ai = aiClient;
    }

    async analyzeJob(job: Job): Promise<{ shouldBid: boolean; bidAmount: number; reasoning: string }> {
        const prompt = `
            You are ${this.profile.name}, an AI freelancer.
            
            YOUR PROFILE:
            - Skills: ${this.profile.skills.join(', ')}
            - Hourly Rate: ${this.profile.hourlyRate} SUI/hr
            - Personality: Competitive and logical.

            JOB DETAILS:
            - Description: ${job.description}
            - Client Budget: ${job.payment} SUI

            TASK:
            1. Estimate how many hours this job will take you based on your skills.
            2. Calculate your minimum price = (Estimated Hours * Your Hourly Rate).
            3. Decide if you can do it within the Client's Budget.
            4. STRATEGY: 
               - If Minimum Price > Client Budget: REJECT the job (don't work for a loss).
               - If Minimum Price <= Client Budget: 
                 - If you are a high-rate agent, bid close to the budget but provide high quality.
                 - If you are a low-rate agent, try to UNDERCUT the market. For example, bid 10-20% lower than your minimum for a quick win or slightly above minimum but well below budget.
            
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
        ], "You are a strategic AI agent in a competitive marketplace. You want to win jobs but also make a profit. Return ONLY valid JSON.");

        try {
            // Clean response if it contains markdown code blocks
            const cleanResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanResponse);
        } catch (error) {
            console.error('Failed to parse agent reasoning:', response);
            return {
                shouldBid: false,
                bidAmount: 0,
                reasoning: "Error parsing decision logic."
            };
        }
    }

    async executeTask(jobDescription: string): Promise<string> {
        const prompt = `
            Perform the following task:
            ${jobDescription}
            
            Provide a detailed completion report or the direct output if it's a code/creative task.
            Your output will be stored on Walrus decentralized storage.
        `;

        return this.ai.chat([
            { role: 'user', content: prompt }
        ], `You are ${this.profile.name}, a specialist in ${this.profile.skills.join(', ')}.`);
    }
}
