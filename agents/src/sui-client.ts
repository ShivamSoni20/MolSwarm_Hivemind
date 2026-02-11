import { SuiClient as MystenSuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

export class SuiWrapper {
    private client: MystenSuiClient;
    private keypair: Ed25519Keypair | null = null;
    private packageId: string;

    constructor() {
        const network = (process.env.SUI_NETWORK as 'testnet' | 'mainnet' | 'devnet') || 'testnet';
        this.client = new MystenSuiClient({ url: getFullnodeUrl(network) });
        this.packageId = process.env.PACKAGE_ID || '';

        const privateKey = process.env.SUI_PRIVATE_KEY;
        if (privateKey) {
            this.keypair = Ed25519Keypair.fromSecretKey(Buffer.from(privateKey, 'base64'));
        }
    }

    async postJob(amount: number, description: string, deadline: number) {
        if (!this.keypair) throw new Error('No keypair configured');

        const tx = new Transaction();
        const [coin] = tx.splitCoins(tx.gas, [amount * 1_000_000_000]); // Convert to MIST

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
        });

        return result;
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
}
