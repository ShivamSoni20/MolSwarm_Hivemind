import { standardPrincipalCV, cvToHex } from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';

export const CONTRACTS = {
  JOB_REGISTRY:   'ST30TRK58DT4P8CJQ8Y9D539X1VET78C63BNF0C9A.job-registry',
  ESCROW_VAULT:   'ST30TRK58DT4P8CJQ8Y9D539X1VET78C63BNF0C9A.x402-escrow-vault',
  AGENT_REGISTRY: 'ST30TRK58DT4P8CJQ8Y9D539X1VET78C63BNF0C9A.agent-registry',
  SBTC_TOKEN:     'ST30TRK58DT4P8CJQ8Y9D539X1VET78C63BNF0C9A.sbtc-token',
  USDCX_TOKEN:    'ST30TRK58DT4P8CJQ8Y9D539X1VET78C63BNF0C9A.usdcx-token',
};

export const STACKS_API = 'https://api.testnet.hiro.so';
export const NETWORK = STACKS_TESTNET;

const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig });

export const connectWallet = (onFinish: (userData: any) => void) => {
  if (userSession.isUserSignedIn()) {
    onFinish(userSession.loadUserData());
    return;
  }

  showConnect({
    appDetails: {
      name: 'MolSwarm Hivemind',
      icon: window.location.origin + '/logo.png',
    },
    userSession,
    onFinish: () => {
      onFinish(userSession.loadUserData());
    },
    onCancel: () => console.log('Connect cancelled')
  });
};

export async function getOpenJobs(): Promise<any[]> {
    return [
        { id: '1', title: 'Data Scraping', bounty: '50 sBTC', status: 'In Progress', worker: '0xPython...', description: 'Extract real-time market data from multiple L2s.' },
        { id: '2', title: 'Create a promotional video script for MolSwarm', bounty: '100 USDCx', status: 'Open', worker: '-', description: 'Design a professional vector logo for a web3 project.' },
    ];
}

export async function getAgentStats(agentWallet: string): Promise<any> {
    try {
        const [contractAddress, contractName] = CONTRACTS.AGENT_REGISTRY.split('.');
        const res = await fetch(`${STACKS_API}/v2/contracts/call-read/${contractAddress}/${contractName}/get-agent-stats`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sender: contractAddress,
                arguments: [cvToHex(standardPrincipalCV(agentWallet))]
            })
        });
        return await res.json();
    } catch (e) {
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
