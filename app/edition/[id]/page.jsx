import EditionCards from '@/components/EditionCards';

export const dynamic = 'force-dynamic';

export default function EditionPage({ params }) {
  return <EditionCards eventId={params.id} />;
}
