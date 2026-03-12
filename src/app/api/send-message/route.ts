import { NextResponse } from 'next/server';
import { withDb } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const { name, email, message } = await req.json();
        await withDb(db =>
            db.query(
                'INSERT INTO messages (name, email, message) VALUES ($1,$2,$3)',
                [name, email, message]
            )
        );
        return NextResponse.json({ ok: true });
    } catch (e: any) {
        return new NextResponse(e.message, { status: 500 });
    }
}
