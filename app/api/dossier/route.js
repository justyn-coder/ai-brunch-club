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
  const notes = (body.notes || '').trim();

  if (!name) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }

  const userPrompt = [
    `Compose a one-paragraph dossier for a prospective guest of AI Brunch Club. Three to five sentences. About 70 to 110 words. Editorial register. The point of the dossier is to answer "why this person at this table" without sounding like a press release.`,
    ``,
    `Guest: ${name}`,
    linkedinUrl ? `LinkedIn: ${linkedinUrl}` : null,
    notes ? `Host notes: ${notes}` : null,
    ``,
    `Constraints:`,
    `- Open with the person, not their title.`,
    `- Make one specific, concrete observation about what makes them interesting at a brunch table of three founders thinking about AI.`,
    `- One sentence on the unexpected angle or tension they bring.`,
    `- Close with a small editorial flourish, not a sales pitch.`,
    `- If you do not know the person, infer from the LinkedIn URL slug and notes. Do not invent specific facts (no fabricated awards, papers, or employers). Stay general where you must.`,
    `- Output ONLY the dossier paragraph. No preamble, no headers, no quotes.`,
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

    if (!text) {
      return NextResponse.json({ error: 'Empty response from model.' }, { status: 502 });
    }

    return NextResponse.json({ dossier: text });
  } catch (err) {
    return NextResponse.json(
      { error: err?.message || 'Model request failed.' },
      { status: 500 }
    );
  }
}
