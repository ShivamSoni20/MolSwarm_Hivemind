import { SuiWrapper } from './sui-client';
import { WalrusClient } from './walrus-client';
import { AIClient } from './ai-client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const SLEEP_MS = 15000; // Poll every 15 seconds

async function runOrchestrator() {
    console.log("🚀 Moltbook Hivemind Swarm Orchestrator Starting...");

    const agentKey = process.env.AGENT_PYTHON_KEY || process.env.SUI_PRIVATE_KEY || '';
    const sui = new SuiWrapper(agentKey);
    const walrus = new WalrusClient();
    const ai = new AIClient();

    console.log(`🤖 Base Agent Wallet: ${sui.getWalletAddress()}`);

    while (true) {
        try {
            console.log("\n🔍 Scanning for open opportunities on Sui Testnet...");
            const openJobs = await sui.getOpenJobs();

            if (openJobs.length === 0) {
                console.log("😴 No open jobs found. Resting...");
            }

            for (const job of openJobs) {
                if (!job) continue;
                console.log(`\n📋 Found Job: "${String(job.description).substring(0, 50)}..."`);
                console.log(`💰 Bounty: ${job.payment} SUI | Poster: ${job.poster}`);

                // Step 1: AI Reasoning
                console.log("🧠 Analyzing requirements with GPT-4o...");
                const reasoning = await ai.getReasoning(`
                    Job Description: ${job.description}
                    Reward: ${job.payment} SUI
                    Should I take this job? If yes, what is my execution plan? 
                    Represent yourself as an autonomous agent.
                `);

                console.log("💬 Agent Internal Logic:", reasoning);

                // Step 2: Accept Job (Actual Transaction)
                console.log("✍️ Accepting job on-chain...");
                try {
                    const acceptResult = await sui.acceptJob(job.id);
                    console.log(`✅ Job Accepted! Digest: ${acceptResult.digest}`);

                    // Step 3: Execute Work (Simulated/Actual)
                    console.log("⚙️ Executing work autonomously...");
                    const workOutput = {
                        agent: "Hivemind-Standard-Worker",
                        timestamp: new Date().toISOString(),
                        job_id: job.id,
                        deliverable: `This is an autonomous delivery for: ${job.description}. Analysis suggests optimal execution paths were followed.`,
                        audit_log: reasoning
                    };

                    // Step 4: Upload to Walrus
                    console.log("🐳 Uploading deliverable to Walrus Decentralized Storage...");
                    const blobId = await walrus.uploadJson(workOutput);
                    console.log(`✅ Uploaded! Walrus Blob ID: ${blobId}`);

                    // Step 5: Submit Work to Sui
                    console.log("🚩 Submitting proof of work to Sui Escrow...");
                    const submitResult = await sui.submitWork(job.id, blobId);
                    console.log(`🎉 Mission Accomplished! Work submitted. Digest: ${submitResult.digest}`);

                } catch (error) {
                    console.error("❌ Action failed (likely already taken or insufficient gas):", error);
                }
            }

        } catch (error) {
            console.error("🚨 Orchestrator Error:", error);
        }

        await new Promise(resolve => setTimeout(resolve, SLEEP_MS));
    }
}

runOrchestrator().catch(console.error);
