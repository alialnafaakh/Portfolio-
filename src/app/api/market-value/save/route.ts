import { NextResponse } from 'next/server';
import { withDb } from '@/lib/db';
import type { QueryResult } from 'pg';

export async function POST(req: Request) {
    try {
        const { id, title, description } = await req.json();
        if (id) {
            await withDb(db => db.query('UPDATE my_market_value SET title=$1, description=$2 WHERE id=$3', [title, description, id]));
        } else {
            const maxOrder = await withDb(db => db.query('SELECT COALESCE(MAX(sort_order),0)+1 AS next FROM my_market_value').then((r: QueryResult) => r.rows[0].next));
            await withDb(db => db.query('INSERT INTO my_market_value (title, description, sort_order) VALUES ($1,$2,$3)', [title, description, maxOrder]));
        }
        return NextResponse.json({ ok: true });
    } catch (e: any) { return new NextResponse(e.message, { status: 500 }); }
}
