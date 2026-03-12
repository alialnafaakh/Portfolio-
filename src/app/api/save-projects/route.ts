import { NextResponse } from 'next/server';
import { withDb } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const projects = await req.json();
        await withDb(async db => {
            await db.query('DELETE FROM projects');
            for (let i = 0; i < projects.length; i++) {
                const p = projects[i];
                await db.query(
                    `INSERT INTO projects (id, title, description, tags, link, image_url, sort_order)
                     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
                    [p.id || null, p.title, p.description, p.tags || [], p.link || null, p.image_url || null, i]
                );
            }
        });
        return NextResponse.json({ ok: true });
    } catch (e: any) {
        return new NextResponse(e.message, { status: 500 });
    }
}
