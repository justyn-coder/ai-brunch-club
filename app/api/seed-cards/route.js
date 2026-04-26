import { NextResponse } from 'next/server';
import { getClient, MODEL, VOICE_SYSTEM } from '@/lib/anthropic';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req) {
  const client = getClient();
  if (!client) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY not configured on the server.' },
      { status: 503 }
    );
  }

  let body;
  try { body = await req.json(); } catch { body = {}; }
  const name = (body.name || '').trim();
  const linkedinUrl = (body.linkedin_url || '').trim();
  const dossier = (body.dossier || '').trim();
  const notes = (body.notes || '').trim();

  if (!name) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }

  const userPrompt = [
    `Generate exactly three conversation seed questions to print on a small menu card for a brunch with this guest. Each question is a short, sharp opener that two founders could lob across the table. Six to fourteen words each.`,
    ``,
    `Guest: ${name}`,
    linkedinUrl ? `LinkedIn: ${linkedinUrl}` : null,
    dossier ? `Dossier: ${dossier}` : null,
    notes ? `Host notes: ${notes}` : null,
    ``,
    `Constraints:`,
    `- One question that gets at the WORK they do, asked sideways. Not "tell us about your role".`,
    `- One question that gets at TENSION or a contrarian take they would have.`,
    `- One question that is small, human, and slightly playful. Brunch energy, not interview energy.`,
    `- No "what do you think about AI" or "where is the field going". Specific beats general.`,
    `- No question marks at the start. Questions should be statements that invite a response, or genuine questions, but never trite.`,
    `- Output ONLY a JSON array of three strings. No preamble. Example: ["...", "...", "..."]`,
  ].filter(Boolean).join('\n');

  try {
    const resp = await client.messages.create({
      model: MODEL,
      max_tokens: 400,
      system: [
        { type: 'text', text: VOICE_SYSTEM, cache_control: { type: 'ephemeral' } },
      ],
      messages: [{ role: 'user', content: userPrompt }],
    });

    const text = resp.content
      ?.filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();

    let questions;
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      questions = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch {
      return NextResponse.json(
        { error: 'Model did not return valid JSON.', raw: text },
        { status: 502 }
      );
    }

    if (!Array.isArray(questions) || questions.length !== 3) {
      return NextResponse.json(
        { error: 'Expected an array of exactly 3 questions.', raw: text },
        { status: 502 }
      );
    }

    return NextResponse.json({ questions: questions.map((q) => String(q).trim()) });
  } catch (err) {
    return NextResponse.json(
      { error: err?.message || 'Model request failed.' },
      { status: 500 }
    );
  }
}
