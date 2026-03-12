import { NextResponse } from 'next/server';
import { withDb } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const c = await req.json();
        await withDb(async db => {
            // About Me
            await db.query(`
                INSERT INTO about_me (id, title, description)
                VALUES (1, $1, $2)
                ON CONFLICT (id) DO UPDATE SET title=$1, description=$2, updated_at=NOW()
            `, [c.about?.title || 'About Me', c.about?.description || '']);

            // Market Value
            await db.query('DELETE FROM my_market_value');
            for (let i = 0; i < (c.marketValue?.items || []).length; i++) {
                const item = c.marketValue.items[i];
                await db.query(
                    'INSERT INTO my_market_value (title, description, sort_order) VALUES ($1,$2,$3)',
                    [item.title, item.description, i]
                );
            }

            // Technical Skills
            await db.query('DELETE FROM technical_skills');
            let skillOrder = 0;
            for (const cat of (c.skills?.categories || [])) {
                for (const skill of (cat.items || [])) {
                    await db.query(
                        'INSERT INTO technical_skills (category, skill, sort_order) VALUES ($1,$2,$3)',
                        [cat.title, skill, skillOrder++]
                    );
                }
            }

            // Certifications
            await db.query('DELETE FROM certifications');
            for (let i = 0; i < (c.certificates?.items || []).length; i++) {
                const cert = c.certificates.items[i];
                await db.query(
                    'INSERT INTO certifications (title, issuer, date_year, certificate_link, sort_order) VALUES ($1,$2,$3,$4,$5)',
                    [cert.title, cert.issuer, cert.date, cert.link || null, i]
                );
            }

            // Hobbies
            await db.query('DELETE FROM hobbies_and_interests');
            for (let i = 0; i < (c.hobbies?.items || []).length; i++) {
                const h = c.hobbies.items[i];
                await db.query(
                    'INSERT INTO hobbies_and_interests (title, description, sort_order) VALUES ($1,$2,$3)',
                    [h.title, h.description, i]
                );
            }
        });
        return NextResponse.json({ ok: true });
    } catch (e: any) {
        return new NextResponse(e.message, { status: 500 });
    }
}
