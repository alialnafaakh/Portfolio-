import { NextResponse } from 'next/server';
import { withDb } from '@/lib/db';
import type { QueryResult } from 'pg';

export async function POST(req: Request) {
    try {
        const { id, title, description, emoji } = await req.json();
        if (id) {
            await withDb(db => db.query('UPDATE hobbies_and_interests SET title=$1, description=$2, emoji=$3 WHERE id=$4', [title, description, emoji || null, id]));
        } else {
            const maxOrder = await withDb(db => db.query('SELECT COALESCE(MAX(sort_order),0)+1 AS next FROM hobbies_and_interests').then((r: QueryResult) => r.rows[0].next));
            await withDb(db => db.query('INSERT INTO hobbies_and_interests (title, description, emoji, sort_order) VALUES ($1,$2,$3,$4)', [title, description, emoji || null, maxOrder]));
        }
        return NextResponse.json({ ok: true });
    } catch (e: any) { return new NextResponse(e.message, { status: 500 }); }
}
