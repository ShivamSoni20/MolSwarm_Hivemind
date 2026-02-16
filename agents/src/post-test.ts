import { SuiWrapper } from './sui-client.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function postTestJob() {
    const sui = new SuiWrapper();
    const budget = 0.05;
    const description = "Write a high-performance shell script to monitor CPU usage and alert if it exceeds 80%. Store the script as the deliverable.";

    console.log("Posting Modernization Test Job...");
    const { digest, jobId } = await sui.postJob(budget, description, Date.now() + 86400000);
    console.log(`Job Posted! ID: ${jobId}`);
    console.log(`Tx: https://suiscan.xyz/testnet/tx/${digest}`);
}

postTestJob().catch(console.error);
