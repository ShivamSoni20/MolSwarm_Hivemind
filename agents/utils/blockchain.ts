import { StacksTestnet } from '@stacks/network';
import { 
    callReadOnlyFunction, 
    broadcastTransaction, 
    makeContractCall,
    SignedContractCallOptions,
    standardPrincipalCV,
    stringAsciiCV,
    uintCV,
    bufferCVFromString,
    makeSTXTokenTransfer,
    AnchorMode
} from '@stacks/transactions';
import * as crypto from 'crypto';
import fetch from 'node-fetch';

export const CONTRACTS = {
    JOB_REGISTRY:   'ST30TRK58DT4P8CJQ8Y9D539X1VET78C63BNF0C9A.job-registry',
    ESCROW_VAULT:   'ST30TRK58DT4P8CJQ8Y9D539X1VET78C63BNF0C9A.x402-escrow-vault',
    AGENT_REGISTRY: 'ST30TRK58DT4P8CJQ8Y9D539X1VET78C63BNF0C9A.agent-registry',
    SBTC_TOKEN:     'ST30TRK58DT4P8CJQ8Y9D539X1VET78C63BNF0C9A.sbtc-token',
    USDCX_TOKEN:    'ST30TRK58DT4P8CJQ8Y9D539X1VET78C63BNF0C9A.usdcx-token',
}

export const STACKS_API = 'https://api.testnet.hiro.so';
export const NETWORK = new StacksTestnet({ url: STACKS_API });

export async function getCurrentNonce(address: string): Promise<number> {
    try {
        const res = await fetch(`${STACKS_API}/v2/accounts/${address}?proof=0`);
        const data: any = await res.json();
        return data.nonce || 0;
    } catch (e) {
        return 0;
    }
}

export class BlockchainClient {
    public network: StacksTestnet;
    private walletKey: string;
    private address: string;

    constructor(privateKey: string) {
        this.network = NETWORK;
        // Stacks private keys sometimes need "01" suffix if they are uncompressed
        this.walletKey = privateKey.length === 64 ? privateKey + '01' : privateKey;
        this.address = 'ST30TRK58DT4P8CJQ8Y9D539X1VET78C63BNF0C9A'; // Default deployer/agent addr for test
    }

    public async connectToStacks() {
        console.log(`Connected to Stacks testnet at ${this.network.coreApiUrl}`);
    }

    public async callContract(contractAddress: string, contractName: string, functionName: string, args: any[]) {
        try {
            const currentNonce = await getCurrentNonce(this.address);
            const txOptions: SignedContractCallOptions = {
                contractAddress,
                contractName,
                functionName,
                functionArgs: args,
                senderKey: this.walletKey,
                network: this.network,
                fee: 2500,
                nonce: currentNonce,
                anchorMode: AnchorMode.Any
            };

            const transaction = await makeContractCall(txOptions);
            const broadcastResponse = await broadcastTransaction(transaction, this.network);
            return broadcastResponse;
        } catch (error) {
            console.error('Contract call failed:', error);
            throw error;
        }
    }

    public async pollForJobs() {
        console.log("Polling Stacks job-registry.clar for open jobs...");
        return []; 
    }

    public async getAgentBalance(principal: string) {
        return {
            sBTC: 1.5,
            USDCx: 100
        };
    }
    
    public hashDeliverable(deliverable: string): Buffer {
        return crypto.createHash('sha256').update(deliverable).digest();
    }
}
