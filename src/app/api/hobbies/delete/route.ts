import { NextResponse } from 'next/server';
import { withDb } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const { id } = await req.json();
        await withDb(db => db.query('DELETE FROM hobbies_and_interests WHERE id=$1', [id]));
        return NextResponse.json({ ok: true });
    } catch (e: any) { return new NextResponse(e.message, { status: 500 }); }
}
