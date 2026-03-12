require('dotenv').config();
const { Client } = require('pg');

function parseDbUrl(url) {
    url = url.replace(/^"|"$/g, '').trim();
    const match = url.match(/postgresql:\/\/([^:]+):(.+)@([^:]+):(\d+)\/([^?]+)(.*)/);
    if (!match) throw new Error('Cannot parse DATABASE_URL');
    return {
        user: match[1], password: match[2], host: match[3],
        port: parseInt(match[4]), database: match[5],
        ssl: { rejectUnauthorized: false }
    };
}

const sql = `
CREATE TABLE IF NOT EXISTS messages (
    id         SERIAL PRIMARY KEY,
    name       TEXT        NOT NULL,
    email      TEXT        NOT NULL,
    message    TEXT        NOT NULL,
    is_read    BOOLEAN     NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

async function migrate() {
    const client = new Client(parseDbUrl(process.env.DATABASE_URL));
    try {
        await client.connect();
        await client.query(sql);
        console.log('✅ messages table created');
    } catch (err) {
        console.error('❌', err.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}
migrate();
