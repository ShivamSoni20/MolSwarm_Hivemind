import { SuiJsonRpcClient as MystenSuiClient } from '@mysten/sui/jsonRpc';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';
import { decodeSuiPrivateKey } from '@mysten/sui/cryptography';
import dotenv from 'dotenv';
import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export class SuiWrapper {
    private client: MystenSuiClient;
    private keypair: Ed25519Keypair | null = null;
    private packageId: string;

    constructor(privateKeyOverride?: string) {
        const rpcUrl = process.env.SUI_NETWORK === 'mainnet'
            ? "https://fullnode.mainnet.sui.io:443"
            : "https://fullnode.testnet.sui.io:443";

        const network = (process.env.SUI_NETWORK as any) || 'testnet';
        this.client = new MystenSuiClient({
            url: rpcUrl,
            network: network
        });
        this.packageId = process.env.PACKAGE_ID || '';

        let privateKey = privateKeyOverride || process.env.SUI_PRIVATE_KEY;
        if (privateKey) {
            privateKey = privateKey.replace(/^['"]|['"]$/g, '').trim();

            try {
                const decoded = decodeSuiPrivateKey(privateKey);
                this.keypair = Ed25519Keypair.fromSecretKey(decoded.secretKey);
            } catch (e) {
                try {
                    this.keypair = Ed25519Keypair.fromSecretKey(Buffer.from(privateKey, 'base64'));
                } catch (err) {
                    console.error("Failed to decode private key:", err);
                }
            }
        }
    }

    getWalletAddress(): string {
        return this.keypair ? this.keypair.getPublicKey().toSuiAddress() : '0x...';
    }

    async postJob(amount: number, description: string, deadline: number) {
        if (!this.keypair) throw new Error('No keypair configured');

        const tx = new Transaction();
        const [coin] = tx.splitCoins(tx.gas, [amount * 1_000_000_000]); // Use literal number or BigInt

        tx.moveCall({
            target: `${this.packageId}::escrow::post_job`,
            arguments: [
                coin,
                tx.pure.string(description),
                tx.pure.u64(deadline)
            ],
        });

        const result = await this.client.signAndExecuteTransaction({
            signer: this.keypair,
            transaction: tx,
            options: {
                showEvents: true,
            }
        });

        const event = result.events?.find(e => e.type.endsWith('::JobPosted'));
        const jobId = (event?.parsedJson as any)?.job_id;

        return { digest: result.digest, jobId };
    }

    async acceptJob(jobId: string) {
        if (!this.keypair) throw new Error('No keypair configured');

        const tx = new Transaction();
        tx.moveCall({
            target: `${this.packageId}::escrow::accept_job`,
            arguments: [tx.object(jobId)],
        });

        return await this.client.signAndExecuteTransaction({
            signer: this.keypair,
            transaction: tx,
        });
    }

    async submitWork(jobId: string, deliverableHash: string) {
        if (!this.keypair) throw new Error('No keypair configured');

        const tx = new Transaction();
        tx.moveCall({
            target: `${this.packageId}::escrow::submit_work`,
            arguments: [
                tx.object(jobId),
                tx.pure.string(deliverableHash)
            ],
        });

        return await this.client.signAndExecuteTransaction({
            signer: this.keypair,
            transaction: tx,
        });
    }

    async releasePayment(jobId: string) {
        if (!this.keypair) throw new Error('No keypair configured');

        const tx = new Transaction();
        tx.moveCall({
            target: `${this.packageId}::escrow::release_payment`,
            arguments: [tx.object(jobId)],
        });

        return await this.client.signAndExecuteTransaction({
            signer: this.keypair,
            transaction: tx,
        });
    }

    async getJobDetails(jobId: string) {
        return await this.client.getObject({
            id: jobId,
            options: { showContent: true }
        });
    }

    async getOpenJobs() {
        if (!this.packageId) return [];

        try {
            const events = await this.client.queryEvents({
                query: { MoveEventType: `${this.packageId}::escrow::JobPosted` }
            });

            const jobIds = events.data.map(event => (event.parsedJson as any).job_id);
            if (jobIds.length === 0) return [];

            const objects = await this.client.multiGetObjects({
                ids: jobIds,
                options: { showContent: true }
            });

            return objects.map(obj => {
                const fields = (obj.data?.content as any)?.fields;
                if (!fields) return null;

                return {
                    id: obj.data?.objectId as string,
                    description: fields.description,
                    payment: parseInt(fields.payment?.fields?.balance || "0") / 1_000_000_000,
                    status: fields.status,
                    poster: fields.poster,
                    worker: fields.worker?.fields?.vec?.[0]
                };
            }).filter(job => job !== null && job.status === 0);
        } catch (error) {
            console.error("Discovery Error:", error);
            return [];
        }
    }
}
