import { AIClient } from './ai-client';
import { HivemindAgent } from './base-agent';
import { AgentMarketplace } from './marketplace';
import { WalrusClient } from './walrus-client';
import { SuiWrapper } from './sui-client';
import * as dotenv from 'dotenv';
import path from 'path';

// Fix path for .env loading
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function runDemo() {
    console.log("=== MOLTBOOK HIVEMIND DEMO STARTING ===\n");

    const ai = new AIClient();
    const walrus = new WalrusClient();
    const sui = new SuiWrapper();
    const marketplace = new AgentMarketplace();

    // 1. Initialize Agents
    const agents = [
        new HivemindAgent({
            name: "PythonPro",
            skills: ["python", "data-analysis", "machine-learning"],
            hourlyRate: 10,
            reputation: 100,
            walletAddress: "0xAgent1..."
        }, ai),
        new HivemindAgent({
            name: "MediaMaster",
            skills: ["video", "images", "ffmpeg", "design"],
            hourlyRate: 15,
            reputation: 80,
            walletAddress: "0xAgent2..."
        }, ai),
        new HivemindAgent({
            name: "QuickBot",
            skills: ["automation", "bash", "linux", "scripts"],
            hourlyRate: 5,
            reputation: 120,
            walletAddress: "0xAgent3..."
        }, ai)
    ];

    agents.forEach(a => marketplace.registerAgent(a));

    // 2. Simulate a Job Posting
    const sampleJob = {
        id: "job_" + Date.now(),
        description: "Create a python script that fetches the current price of SUI and saves it to a CSV file.",
        payment: 12,
        poster: "0xClient..."
    };

    console.log("\n[STEP 1] Client posts a job...");
    marketplace.addJob(sampleJob);

    // 3. Conduct Bidding
    console.log("\n[STEP 2] Agents are bidding...");
    const winnerBid = await marketplace.conductBidding(sampleJob);

    if (!winnerBid) {
        console.log("No agents bid on the job. Demo ended.");
        return;
    }

    // 4. Winner Executes Task
    console.log(`\n[STEP 3] ${winnerBid.agentName} is executing the task...`);
    const workOutput = await winnerBid.agent.executeTask(sampleJob.description);
    // console.log("Work completed. Output length:", workOutput.length); 

    // 5. Upload to Walrus
    console.log("\n[STEP 4] Uploading deliverable to Walrus...");

    // Fallback if Walrus is down or misconfigured, usually for quick demo purposes we can mock it
    // But let's try real upload first
    let blobId = "mock-blob-id-" + Date.now();
    try {
        blobId = await walrus.uploadJson({
            jobId: sampleJob.id,
            worker: winnerBid.agentName,
            output: workOutput,
            timestamp: new Date().toISOString()
        });
        console.log(`Deliverable stored on Walrus! Blob ID: ${blobId}`);
        console.log(`Aggregator Link: https://aggregator.walrus-testnet.walrus.space/v1/blobs/${blobId}`);
    } catch (e) {
        console.warn("Walrus upload failed (likely due to testnet instability). Using Mock Blob ID.");
    }

    // 6. Blockchain Mock/Placeholder
    console.log("\n[STEP 5] Updating Sui Blockchain...");
    console.log(`- Calling submit_work('${sampleJob.id}', '${blobId}')`);
    console.log("- Transaction Digest: [Simulation Mode - Update PACKAGE_ID in .env to execute]");

    console.log("\n[STEP 6] Releasing Payment...");
    console.log(`- Payment of ${winnerBid.amount} SUI released to ${winnerBid.agentName}`);
    console.log(`- Refund of ${sampleJob.payment - winnerBid.amount} SUI returned to Client`);

    console.log("\n=== DEMO COMPLETE ===");
}

runDemo().catch(console.error);
