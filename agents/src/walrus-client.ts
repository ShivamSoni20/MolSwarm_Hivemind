import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

export class WalrusClient {
    private publisherUrl: string;
    private aggregatorUrl: string;

    constructor() {
        this.publisherUrl = process.env.WALRUS_PUBLISHER_URL || 'https://publisher.walrus-testnet.walrus.space';
        this.aggregatorUrl = process.env.WALRUS_AGGREGATOR_URL || 'https://aggregator.walrus-testnet.walrus.space';
    }

    async uploadJson(data: any, epochs: number = 1): Promise<string> {
        const payload = JSON.stringify(data);

        try {
            const response = await axios.put(`${this.publisherUrl}/v1/blobs?epochs=${epochs}`, payload, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const blobId = response.data.newlyCreated?.blobObject?.blobId ||
                response.data.alreadyCertified?.blobId;

            if (!blobId) {
                throw new Error('Failed to retrieve blobId from Walrus response');
            }

            return blobId;
        } catch (error: any) {
            console.error('Walrus Upload Error:', error.response?.data || error.message);
            throw error;
        }
    }

    async downloadJson(blobId: string): Promise<any> {
        try {
            const response = await axios.get(`${this.aggregatorUrl}/v1/blobs/${blobId}`);
            return response.data;
        } catch (error: any) {
            console.error('Walrus Download Error:', error.response?.data || error.message);
            throw error;
        }
    }
}
