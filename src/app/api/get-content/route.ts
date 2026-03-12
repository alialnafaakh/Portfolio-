import { NextResponse } from 'next/server';
import { withDb } from '@/lib/db';
import type { QueryResult } from 'pg';

export async function GET() {
    try {
        const [about, market, skills, certs, hobbies] = await withDb(async db => {
            return Promise.all([
                db.query('SELECT * FROM about_me ORDER BY id ASC LIMIT 1').then((r: QueryResult) => r.rows[0] || null),
                db.query('SELECT * FROM my_market_value ORDER BY sort_order ASC').then((r: QueryResult) => r.rows),
                db.query('SELECT * FROM technical_skills ORDER BY sort_order ASC').then((r: QueryResult) => r.rows),
                db.query('SELECT * FROM certifications ORDER BY sort_order ASC').then((r: QueryResult) => r.rows),
                db.query('SELECT * FROM hobbies_and_interests ORDER BY sort_order ASC').then((r: QueryResult) => r.rows),
            ]);
        });

        const skillCategories: Record<string, string[]> = {};
        for (const s of skills) {
            if (!skillCategories[s.category]) skillCategories[s.category] = [];
            skillCategories[s.category].push(s.skill);
        }

        return NextResponse.json({
            about: {
                title: about?.title || 'About Me',
                description: about?.description || '',
                image_url: about?.image_url || null,
                github_url: about?.github_url || null,
                linkedin_url: about?.linkedin_url || null,
            },
            marketValue: {
                title: 'My Market Value',
                items: market.map((m: any) => ({ title: m.title, description: m.description }))
            },
            skills: {
                title: 'Technical Skills',
                categories: Object.entries(skillCategories).map(([title, items]) => ({ title, items }))
            },
            certificates: {
                title: 'Certifications',
                items: certs.map((c: any) => ({
                    title: c.title,
                    issuer: c.issuer,
                    date: c.date_year,
                    link: c.certificate_link || null
                }))
            },
            hobbies: {
                title: 'Hobbies & Interests',
                items: hobbies.map((h: any) => ({ title: h.title, description: h.description }))
            }
        });
    } catch (e: any) {
        return new NextResponse(e.message, { status: 500 });
    }
}
