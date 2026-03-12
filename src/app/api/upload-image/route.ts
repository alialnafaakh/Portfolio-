import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
    try {
        const url = new URL(req.url);
        const filename = url.searchParams.get('filename');
        if (!filename) return new NextResponse('Filename required', { status: 400 });

        const safeFilename = path.basename(filename).replace(/[^a-zA-Z0-9.-]/g, '_');
        const uploadDir = path.resolve(process.cwd(), 'public/uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

        const data = await req.arrayBuffer();
        fs.writeFileSync(path.join(uploadDir, safeFilename), Buffer.from(data));

        return NextResponse.json({ path: `/uploads/${safeFilename}` });
    } catch (e: any) {
        return new NextResponse(e.message, { status: 500 });
    }
}
