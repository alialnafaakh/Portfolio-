require('dotenv').config();
const { Client } = require('pg');

// Parse the DATABASE_URL manually to handle special chars in password
function parseDbUrl(url) {
    // Remove quotes if present
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
-- =============================================
--  Portfolio Database Migration
--  Tables: about_me, my_market_value,
--          technical_skills, certifications,
--          hobbies_and_interests
-- =============================================

-- 1. About Me
CREATE TABLE IF NOT EXISTS about_me (
    id        SERIAL PRIMARY KEY,
    title     TEXT NOT NULL DEFAULT 'About Me',
    description TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. My Market Value
CREATE TABLE IF NOT EXISTS my_market_value (
    id          SERIAL PRIMARY KEY,
    title       TEXT NOT NULL,
    description TEXT NOT NULL,
    sort_order  INT  NOT NULL DEFAULT 0
);

-- 3. Technical Skills
CREATE TABLE IF NOT EXISTS technical_skills (
    id         SERIAL PRIMARY KEY,
    category   TEXT NOT NULL,
    skill      TEXT NOT NULL,
    sort_order INT  NOT NULL DEFAULT 0
);

-- 4. Certifications
CREATE TABLE IF NOT EXISTS certifications (
    id         SERIAL PRIMARY KEY,
    title      TEXT NOT NULL,
    issuer     TEXT NOT NULL,
    date_year  TEXT NOT NULL,
    sort_order INT  NOT NULL DEFAULT 0
);

-- 5. Hobbies & Interests
CREATE TABLE IF NOT EXISTS hobbies_and_interests (
    id          SERIAL PRIMARY KEY,
    title       TEXT NOT NULL,
    description TEXT NOT NULL,
    sort_order  INT  NOT NULL DEFAULT 0
);
`;

async function migrate() {
    const config = parseDbUrl(process.env.DATABASE_URL);
    const client = new Client(config);

    try {
        console.log('🔌 Connecting to Supabase...');
        await client.connect();
        console.log('✅ Connected!\n');

        console.log('🚀 Running migration...');
        await client.query(sql);

        console.log('✅ All tables created successfully:\n');
        console.log('   📋  about_me');
        console.log('   📋  my_market_value');
        console.log('   📋  technical_skills');
        console.log('   📋  certifications');
        console.log('   📋  hobbies_and_interests');
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

migrate();
