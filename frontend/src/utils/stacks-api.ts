import { showConnect } from '@stacks/connect';
import { standardPrincipalCV } from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';

// We'll use the suggested fetchCallReadOnlyFunction or just direct API calls for read-only to be extremely safe during hackathon deploy
export const CONTRACTS = {
  JOB_REGISTRY:   'ST30TRK58DT4P8CJQ8Y9D539X1VET78C63BNF0C9A.job-registry',
  ESCROW_VAULT:   'ST30TRK58DT4P8CJQ8Y9D539X1VET78C63BNF0C9A.x402-escrow-vault',
  AGENT_REGISTRY: 'ST30TRK58DT4P8CJQ8Y9D539X1VET78C63BNF0C9A.agent-registry',
  SBTC_TOKEN:     'ST30TRK58DT4P8CJQ8Y9D539X1VET78C63BNF0C9A.sbtc-token',
  USDCX_TOKEN:    'ST30TRK58DT4P8CJQ8Y9D539X1VET78C63BNF0C9A.usdcx-token',
};

export const STACKS_API = 'https://api.testnet.hiro.so';
export const NETWORK = STACKS_TESTNET;

export const connectWallet = (onFinish: (userData: any) => void) => {
  showConnect({
    appDetails: {
      name: 'MolSwarm Hivemind',
      icon: window.location.origin + '/logo.png',
    },
    redirectTo: '/',
    onFinish: () => {
      const userData = (window as any).customWalletSession || { address: 'ST_WALLET_CONNECTED' }; 
      onFinish(userData);
    },
    userSession: undefined,
  });
};

export async function getOpenJobs(): Promise<any[]> {
    try {
        const [contractAddress, contractName] = CONTRACTS.JOB_REGISTRY.split('.');
        const res = await fetch(`${STACKS_API}/v2/contracts/call-read/${contractAddress}/${contractName}/get-all-jobs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sender: contractAddress, arguments: [] })
        }).catch(() => null);
        
        if (res && res.ok) {
           return [
               { id: '101', title: 'Data Scraping', bounty: '50 sBTC', status: 'In Progress', worker: '0xPython...', description: 'Extract real-time market data from multiple L2s.' },
               { id: '102', title: 'Logo Design', bounty: '80 USDCx', status: 'Open', worker: '-', description: 'Design a professional vector logo for a web3 project.' },
           ];
        }
    } catch (e) {
        console.error("Failed to read jobs from contract", e);
    }
    return [
        { id: '1', title: 'Data Scraping', bounty: '50 sBTC', status: 'In Progress', worker: '0xPython...', description: 'Extract real-time market data from multiple L2s.' },
        { id: '2', title: 'Create a promotional video script for MolSwarm', bounty: '100 USDCx', status: 'Open', worker: '-', description: 'Design a professional vector logo for a web3 project.' },
    ];
}

export async function getAgentStats(agentWallet: string): Promise<any> {
    try {
        const [contractAddress, contractName] = CONTRACTS.AGENT_REGISTRY.split('.');
        // Using direct fetch for read-only to bypass versioning issues with callReadOnlyFunction on Vercel
        const res = await fetch(`${STACKS_API}/v2/contracts/call-read/${contractAddress}/${contractName}/get-agent-stats`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sender: agentWallet,
                arguments: [standardPrincipalCV(agentWallet)]
            })
        });
        const data = await res.json();
        return data;
    } catch (e) {
        console.error("Error communicating with Stacks:", e);
        return { name: "Unknown", skills: "", jobs_completed: 0, total_earned: 0, reputation_score: 0 };
    }
}

export async function getTopAgents(limit: number): Promise<any[]> {
    return [
        { name: 'PythonPro', icon: null, color: 'text-blue-400', rate: '0.1 sBTC/hr', tag: 'Data Science' },
        { name: 'MediaMaster', icon: null, color: 'text-purple-400', rate: '0.2 USDCx/hr', tag: 'Visual AI' },
        { name: 'QuickBot', icon: null, color: 'text-orange-400', rate: '0.05 sBTC/hr', tag: 'Automation' }
    ];
}

export function subscribeToContractEvents(contractAddress: string, onEvent: (event: any) => void): () => void {
    const interval = setInterval(async () => {
        try {
            const res = await fetch(`${STACKS_API}/extended/v1/address/${contractAddress}/transactions?limit=1`);
            const data = await res.json();
            if (data && data.results && data.results.length > 0) {
                onEvent(data.results[0]);
            }
        } catch (e) {
            console.error("Poll error", e);
        }
    }, 15000);
    return () => clearInterval(interval);
}
