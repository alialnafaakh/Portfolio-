import { NextResponse } from 'next/server';
import { withDb } from '@/lib/db';
import type { QueryResult } from 'pg';

export async function GET() {
    try {
        const rows: any[] = await withDb(db =>
            db.query('SELECT * FROM messages ORDER BY created_at DESC').then((r: QueryResult) => r.rows)
        );
        return NextResponse.json(rows.map((m: any) => ({
            id: m.id,
            name: m.name,
            email: m.email,
            message: m.message,
            date: new Date(m.created_at).toLocaleString()
        })));
    } catch (e: any) {
        return new NextResponse(e.message, { status: 500 });
    }
}
