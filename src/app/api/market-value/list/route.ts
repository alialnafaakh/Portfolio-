import { NextResponse } from 'next/server';
import { withDb } from '@/lib/db';
import type { QueryResult } from 'pg';

export async function GET() {
    try {
        const rows = await withDb(db => db.query('SELECT * FROM my_market_value ORDER BY sort_order ASC, id ASC').then((r: QueryResult) => r.rows));
        return NextResponse.json(rows);
    } catch (e: any) { return new NextResponse(e.message, { status: 500 }); }
}
