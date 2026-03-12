import { NextResponse } from 'next/server';
import { withDb } from '@/lib/db';
import type { QueryResult } from 'pg';

export async function POST(req: Request) {
    try {
        const { id, category, skill } = await req.json();
        if (id) {
            await withDb(db => db.query('UPDATE technical_skills SET category=$1, skill=$2 WHERE id=$3', [category, skill, id]));
        } else {
            const maxOrder = await withDb(db => db.query('SELECT COALESCE(MAX(sort_order),0)+1 AS next FROM technical_skills').then((r: QueryResult) => r.rows[0].next));
            await withDb(db => db.query('INSERT INTO technical_skills (category, skill, sort_order) VALUES ($1,$2,$3)', [category, skill, maxOrder]));
        }
        return NextResponse.json({ ok: true });
    } catch (e: any) { return new NextResponse(e.message, { status: 500 }); }
}
