function digits(p) {
  return (p || '').replace(/[^\d]/g, '');
}

function pad(n) {
  return String(n || 0).padStart(2, '0');
}

function formatLong(d) {
  if (!d) return null;
  return new Date(d + 'T12:00:00').toLocaleDateString('en-CA', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function siteOrigin() {
  if (typeof window !== 'undefined') return window.location.origin;
  return 'https://ai-brunch-club.vercel.app';
}

// Pre-filled WhatsApp invite to a specific guest (their phone in URL).
// Opens the founder's WhatsApp with a draft message ready to send.
export function waGuestInvite({ guest, event }) {
  const phone = digits(guest.phone);
  const editionLabel = `№ ${pad(event?.edition_number)}`;
  const dateLine = event?.event_date ? formatLong(event.event_date) : 'Date being sworn';
  const guestUrl = `${siteOrigin()}/guest/${guest.id}`;
  const groupLine = event?.whatsapp_invite_url
    ? `\n\nWhen you're ready, join the group: ${event.whatsapp_invite_url}`
    : '';
  const lines = [
    `Hi ${guest.name.split(' ')[0]}, this is the AI Brunch Club.`,
    ``,
    `We meet at Pinky Swear in New Toronto. Brunch ${editionLabel}, ${dateLine}.`,
    ``,
    `Why we want you at the table: ${guestUrl}`,
    groupLine,
  ];
  const message = lines.join('\n').trim();
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

// Share a link into a group (or any chat). WhatsApp opens with a chat picker.
export function waShareToGroup({ event, kind }) {
  const editionLabel = `№ ${pad(event?.edition_number)}`;
  const base = siteOrigin();
  let lead = '';
  let url = base;
  if (kind === 'poll') {
    lead = `Help us pick the date for Brunch ${editionLabel}.`;
    url = `${base}/edition/${event.id}/poll`;
  } else if (kind === 'cards') {
    lead = `Seed cards for Brunch ${editionLabel}.`;
    url = `${base}/edition/${event.id}`;
  } else {
    lead = `AI Brunch Club, ${editionLabel}.`;
  }
  const message = `${lead}\n\n${url}`;
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

// RSVP shortcut: opens chat with founder's number, pre-filled "Pinky sworn for..." text.
export function waRsvp({ founderPhone, guest, event, kind = 'sworn' }) {
  const phone = digits(founderPhone);
  const editionLabel = `№ ${pad(event?.edition_number)}`;
  const verb = {
    sworn: 'Pinky sworn',
    maybe: 'Maybe',
    declined: 'Regrets',
  }[kind] || 'Pinky sworn';
  const message = `${verb} for Brunch ${editionLabel}. - ${guest.name}`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
