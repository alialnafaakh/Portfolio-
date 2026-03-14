import { NextResponse } from 'next/server';
import { withDb } from '@/lib/db';
import type { QueryResult } from 'pg';

export async function POST(req: Request) {
    try {
        const { id, title, description, tags, link, image_url } = await req.json();
        
        if (id) {
            await withDb(db => db.query(
                'UPDATE projects SET title=$1, description=$2, tags=$3, link=$4, image_url=$5 WHERE id=$6', 
                [title, description, tags || [], link || null, image_url || null, id]
            ));
        } else {
            await withDb(async db => {
                const r = await db.query('SELECT COALESCE(MAX(sort_order),0)+1 AS next FROM projects');
                const maxOrder = Math.floor(r.rows[0].next);
                await db.query(
                    'INSERT INTO projects (title, description, tags, link, image_url, sort_order) VALUES ($1,$2,$3,$4,$5,$6)', 
                    [title, description, tags || [], link || null, image_url || null, maxOrder]
                );
            });
        }
        
        return NextResponse.json({ ok: true });
    } catch (e: any) {
        return new NextResponse(e.message, { status: 500 });
    }
}
