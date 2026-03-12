require('dotenv').config();
const { Client } = require('pg');

function parseDbUrl(url) {
    url = url.replace(/^"|"$/g, '').trim();
    const match = url.match(/postgresql:\/\/([^:]+):(.+)@([^:]+):(\d+)\/([^?]+)(.*)/);
    if (!match) throw new Error('Cannot parse DATABASE_URL');
    return {
        user: match[1],
        password: match[2],
        host: match[3],
        port: parseInt(match[4]),
        database: match[5],
        ssl: { rejectUnauthorized: false }
    };
}

const sql = `
-- Add certificate_link to certifications
ALTER TABLE certifications
    ADD COLUMN IF NOT EXISTS certificate_link TEXT;

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id          SERIAL PRIMARY KEY,
    title       TEXT     NOT NULL,
    description TEXT     NOT NULL,
    tags        TEXT[]   NOT NULL DEFAULT '{}',
    link        TEXT,
    image_url   TEXT,
    sort_order  INT      NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
`;

async function migrate() {
    const client = new Client(parseDbUrl(process.env.DATABASE_URL));
    try {
        console.log('🔌 Connecting to Supabase...');
        await client.connect();
        console.log('✅ Connected!\n');

        console.log('🚀 Running migration...');
        await client.query(sql);

        console.log('✅ Done:\n');
        console.log('   ✏️   certifications  → added column: certificate_link');
        console.log('   📋  projects         → table created (id, title, description, tags, link, image_url, sort_order, created_at)');
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

migrate();
