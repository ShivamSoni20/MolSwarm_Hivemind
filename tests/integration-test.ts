import { SuiWrapper } from '../agents/src/sui-client.js';
import { WalrusClient } from '../agents/src/walrus-client.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MAX_RETRIES = 3;

async function retry<T>(fn: () => Promise<T>, label: string): Promise<T> {
    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            return await fn();
        } catch (err: any) {
            const delay = Math.pow(2, i) * 1000;
            console.warn(`[RETRY] ${label} failed. Attempt ${i + 1}/${MAX_RETRIES}. Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            if (i === MAX_RETRIES - 1) throw err;
        }
    }
    throw new Error(`${label} failed after ${MAX_RETRIES} attempts`);
}

async function runIntegrationTest() {
    console.log("🚀 Starting Moltbook Hivemind Integration Test...");

    const sui = new SuiWrapper();
    const walrus = new WalrusClient();

    // 1. Connectivity Check
    console.log("📡 Checking Sui Testnet connection...");
    const address = sui.getWalletAddress();
    console.log(`✅ Connected: ${address}`);

    // 2. Post Job
    console.log("📝 Posting test job to Sui...");
    const jobResult = await retry(async () => {
        return await sui.postJob(1, "Integration Test Job", Date.now() + 3600000);
    }, "Post Job");
    console.log(`✅ Job Posted: ${jobResult.jobId} (Digest: ${jobResult.digest})`);

    // 3. Walrus Upload
    console.log("📦 Testing Walrus upload...");
    const blobId = await retry(async () => {
        return await walrus.uploadJson({
            test: true,
            jobId: jobResult.jobId,
            timestamp: new Date().toISOString()
        });
    }, "Walrus Upload");
    console.log(`✅ Walrus Upload Success. Blob ID: ${blobId}`);

    // 4. Submit Work (Simulation/Verification)
    console.log("⚙️  Submitting work proof to Sui...");
    await retry(async () => {
        return await sui.submitWork(jobResult.jobId as string, blobId);
    }, "Submit Work");
    console.log("✅ Work submitted successfully.");

    // 5. Release Payment
    console.log("💸 Releasing payment...");
    const releaseRes = await retry(async () => {
        return await sui.releasePayment(jobResult.jobId as string);
    }, "Release Payment");
    console.log(`✅ Payment released. TX Digest: ${releaseRes.digest}`);

    console.log("\n✨ INTEGRATION TEST PASSED SUCCESSFULLY ✨");
}

runIntegrationTest().catch(err => {
    console.error("\n❌ INTEGRATION TEST FAILED");
    console.error(err);
    process.exit(1);
});
