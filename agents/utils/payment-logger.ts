import sqlite3 from 'sqlite3';
import { WebSocketServer, WebSocket } from 'ws';

const db = new sqlite3.Database('./payments.sqlite');

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS x402_payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            from_agent TEXT,
            to_agent TEXT,
            amount REAL,
            token TEXT,
            job_id TEXT,
            tx_hash TEXT
        )
    `);
});

export class PaymentLogger {
    private wss: WebSocketServer;

    constructor() {
        this.wss = new WebSocketServer({ port: 8080 });
        console.log("📡 WebSocket Server listening for Payment Waterfall on ws://localhost:8080");

        this.wss.on('connection', (ws) => {
            console.log("🟢 Client connected to Payment WebSocket");
        });
    }

    public emitToFrontend(payment: any) {
        console.log("📡 Broadcasting x402 payment:", payment);
        this.wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(payment));
            }
        });
    }

    public logPayment(from: string, to: string, amount: number, token: string, jobId: string, txHash: string) {
        const timestamp = new Date().toISOString();
        const stmt = db.prepare(`
            INSERT INTO x402_payments (timestamp, from_agent, to_agent, amount, token, job_id, tx_hash)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        
        stmt.run(timestamp, from, to, amount, token, jobId, txHash, (err: any) => {
            if (err) console.error("Database log error:", err);
        });
        stmt.finalize();

        this.emitToFrontend({
            type: "payment",
            from: from,
            to: to,
            amount,
            token,
            jobId,
            txHash,
            timestamp: Date.now()
        });
    }

    public getRecentPayments(callback: (rows: any[]) => void) {
        db.all(`SELECT * FROM x402_payments ORDER BY id DESC LIMIT 50`, [], (err, rows) => {
           if (err) {
               console.error("Fetch DB error:", err);
               callback([]);
           } else {
               callback(rows);
           }
        });
    }
}
