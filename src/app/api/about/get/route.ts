import { NextResponse } from 'next/server';
import { withDb } from '@/lib/db';
import type { QueryResult } from 'pg';

export async function GET() {
    try {
        const row = await withDb(db => db.query('SELECT * FROM about_me ORDER BY id ASC LIMIT 1').then((r: QueryResult) => r.rows[0] || null));
        return NextResponse.json(row || { title: '', description: '', image_url: null, github_url: null, linkedin_url: null });
    } catch (e: any) { return new NextResponse(e.message, { status: 500 }); }
}
