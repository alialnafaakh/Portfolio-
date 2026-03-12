import { NextResponse } from 'next/server';
import { withDb } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const { title, description, image_url, github_url, linkedin_url } = await req.json();
        await withDb(db => db.query(`
            INSERT INTO about_me (id, title, description, image_url, github_url, linkedin_url)
            VALUES (1, $1, $2, $3, $4, $5)
            ON CONFLICT (id) DO UPDATE SET title=$1, description=$2, image_url=$3, github_url=$4, linkedin_url=$5, updated_at=NOW()
        `, [title, description, image_url || null, github_url || null, linkedin_url || null]));
        return NextResponse.json({ ok: true });
    } catch (e: any) { return new NextResponse(e.message, { status: 500 }); }
}
