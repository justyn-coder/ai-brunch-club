import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import GuestPage from '@/components/GuestPage';

export const dynamic = 'force-dynamic';

async function fetchGuest(id) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_KEY,
    { auth: { persistSession: false } }
  );
  const { data: guest } = await supabase
    .from('abc_guests')
    .select('*')
    .eq('id', id)
    .single();
  if (!guest) return null;
  const { data: event } = await supabase
    .from('abc_events')
    .select('*')
    .eq('id', guest.event_id)
    .single();
  return { guest, event };
}

export async function generateMetadata({ params }) {
  const data = await fetchGuest(params.id);
  if (!data) return { title: 'AI Brunch Club' };
  const { guest, event } = data;
  const title = `${guest.name} at AI Brunch Club`;
  const description = `Brunch № ${String(event?.edition_number || 1).padStart(2, '0')} at Pinky Swear, New Toronto. Why we want ${guest.name.split(' ')[0]} at the table.`;
  return {
    title,
    description,
    openGraph: { title, description, type: 'article', locale: 'en_CA' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function Page({ params }) {
  const data = await fetchGuest(params.id);
  if (!data) return notFound();
  return <GuestPage guest={data.guest} event={data.event} />;
}
