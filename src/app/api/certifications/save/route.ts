import { NextResponse } from 'next/server';
import { withDb } from '@/lib/db';
import type { QueryResult } from 'pg';

export async function POST(req: Request) {
    try {
        const { id, title, issuer, date_year, certificate_link } = await req.json();
        if (id) {
            await withDb(db => db.query('UPDATE certifications SET title=$1, issuer=$2, date_year=$3, certificate_link=$4 WHERE id=$5', [title, issuer, date_year, certificate_link || null, id]));
        } else {
            const maxOrder = await withDb(db => db.query('SELECT COALESCE(MAX(sort_order),0)+1 AS next FROM certifications').then((r: QueryResult) => r.rows[0].next));
            await withDb(db => db.query('INSERT INTO certifications (title, issuer, date_year, certificate_link, sort_order) VALUES ($1,$2,$3,$4,$5)', [title, issuer, date_year, certificate_link || null, maxOrder]));
        }
        return NextResponse.json({ ok: true });
    } catch (e: any) { return new NextResponse(e.message, { status: 500 }); }
}
