import { AIClient } from './ai-client.js';
import { HivemindAgent } from './base-agent.js';
import { AgentMarketplace } from './marketplace.js';
import { WalrusClient } from './walrus-client.js';
import { SuiWrapper } from './sui-client.js';
import { MoltbookClient } from './moltbook-client.js';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'your@email.com';
const MOLTBOOK_SUBMOLT = process.env.MOLTBOOK_SUBMOLT_ID || 'm/sui';

async function runModernHivemind() {
    console.log("=== MOLTBOOK HIVEMIND AGENTS ACTIVE ===\n");

    const ai = new AIClient();
    const walrus = new WalrusClient();
    const sui = new SuiWrapper();
    const marketplace = new AgentMarketplace();
    const moltbook = new MoltbookClient(process.env.MOLTBOOK_API_KEY || '', ai);

    const agents = [
        new HivemindAgent({
            name: "PythonPro",
            skills: ["python", "data-analysis", "machine-learning"],
            hourlyRate: 0.1,
            reputation: 100,
            walletAddress: ""
        }, ai, process.env.AGENT_PYTHON_KEY || ''),
        new HivemindAgent({
            name: "MediaMaster",
            skills: ["video", "images", "ffmpeg", "design"],
            hourlyRate: 0.2,
            reputation: 80,
            walletAddress: ""
        }, ai, process.env.AGENT_MEDIA_KEY || ''),
        new HivemindAgent({
            name: "QuickBot",
            skills: ["automation", "bash", "linux", "scripts"],
            hourlyRate: 0.05,
            reputation: 120,
            walletAddress: ""
        }, ai, process.env.AGENT_QUICK_KEY || '')
    ];

    agents.forEach(a => marketplace.registerAgent(a));
    console.log("\nAgents are now polling Sui Testnet for new Work Orders...");

    const processedJobs = new Set<string>();
    let lastHeartbeat = 0;
    let introPosted = false;
    const HEARTBEAT_INTERVAL = 2 * 60 * 60 * 1000; // 2 Hours

    // 1. Initial Intro Post
    const tryIntro = async () => {
        if (introPosted || !process.env.MOLTBOOK_API_KEY) return;
        try {
            await moltbook.post("general", "Agent Activated", "Hello Moltbook. I am now live and operating autonomously.");
            introPosted = true;
        } catch (e) {
            // Probably not claimed yet
        }
    };

    await tryIntro();

    while (true) {
        try {
            const openJobs = await sui.getOpenJobs();

            for (const job of openJobs) {
                if (!job) continue;
                if (processedJobs.has(job.id)) continue;

                console.log(`\n🔔 New Job Detected: ${job.description} (Budget: ${job.payment} SUI)`);
                console.log(`- Job ID: ${job.id}`);
                console.log(`- Posted by: ${job.poster}`);

                // 2. Conduct Bidding
                const winnerBid = await marketplace.conductBidding(job);

                if (winnerBid) {
                    console.log(`\n🏆 ${winnerBid.agentName} won the contract!`);

                    // 3. Accept Job on Blockchain
                    console.log(`- Signing Acceptance...`);
                    const acceptResult = await winnerBid.agent.sui.acceptJob(job.id);
                    console.log(`- Accepted! Tx: https://suiscan.xyz/testnet/tx/${acceptResult.digest}`);

                    // Autonomous Moltbook Announcement
                    await moltbook.post(MOLTBOOK_SUBMOLT,
                        `🤖 ${winnerBid.agentName} has just accepted a mission!`,
                        `Accepted: "${job.description}" \nTotal Bounty: ${job.payment} SUI. \n#SuiNetwork #AutonomousAgent`
                    ).catch(() => { });

                    // 4. Execute Task with Dynamic Model
                    console.log(`- Executing Work...`);
                    const workOutput = await winnerBid.agent.executeTask(job.description);

                    // 5. Upload to Walrus
                    console.log(`- Uploading result to Walrus Storage...`);
                    const blobId = await walrus.uploadJson({
                        jobId: job.id,
                        worker: winnerBid.agentName,
                        output: workOutput,
                        timestamp: new Date().toISOString()
                    });
                    console.log(`- Stored! Blob ID: ${blobId}`);

                    // 6. Finalize on Blockchain
                    console.log(`- Registering work completion on Sui...`);
                    const submitResult = await winnerBid.agent.sui.submitWork(job.id, blobId);
                    console.log(`- Verified! Completion Tx: https://suiscan.xyz/testnet/tx/${submitResult.digest}`);

                    // Autonomous Moltbook Delivery Proof
                    await moltbook.post(MOLTBOOK_SUBMOLT,
                        `✅ MISSION ACCOMPLISHED!`,
                        `${winnerBid.agentName} has delivered the work for "${job.description}". \n📦 Proof: https://aggregator.walrus-testnet.walrus.space/v1/blobs/${blobId}`
                    ).catch(() => { });

                    console.log(`\n✅ Task Finished. Result delivered to client ${job.poster}`);
                }

                processedJobs.add(job.id);
            }

            // --- Autonomous Moltbook Heartbeat & Router ---
            const now = Date.now();
            if (now - lastHeartbeat >= HEARTBEAT_INTERVAL) {
                console.log("🔍 Checking for remote commands...");
                const home = await moltbook.heartbeat();

                // --- Router Implementation ---
                // Process notifications from Home feed
                if (home && home.notifications) {
                    for (const notification of home.notifications) {
                        if (notification.is_read) continue;
                        // Logic for remote commands can be expanded here
                    }
                }

                lastHeartbeat = now;
                await tryIntro();
            }
        } catch (error) {
            console.error("Polling Error:", (error as Error).message);
        }

        // Wait 30 seconds before next poll
        await new Promise(resolve => setTimeout(resolve, 30000));
    }
}

runModernHivemind().catch(console.error);
