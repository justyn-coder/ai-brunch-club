import DatePoll from '@/components/DatePoll';

export const dynamic = 'force-dynamic';

export default function PollPage({ params }) {
  return <DatePoll eventId={params.id} />;
}
