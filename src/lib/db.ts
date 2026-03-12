import { Client, QueryResult } from 'pg';

export function parseDbUrl(url: string) {
    url = url.replace(/^"|"$/g, '').trim();
    const match = url.match(/postgresql:\/\/([^:]+):(.+)@([^:]+):(\d+)\/([^?]+)(.*)/);
    if (!match) throw new Error('Cannot parse DATABASE_URL');
    return {
        user: match[1], password: match[2], host: match[3],
        port: parseInt(match[4]), database: match[5],
        ssl: { rejectUnauthorized: false }
    };
}

export async function withDb<T>(fn: (client: Client) => Promise<T>): Promise<T> {
    const client = new Client(parseDbUrl(process.env.DATABASE_URL!));
    await client.connect();
    try {
        return await fn(client);
    } finally {
        await client.end();
    }
}
