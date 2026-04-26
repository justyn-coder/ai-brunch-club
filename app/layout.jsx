import './globals.css';

export const metadata = {
  title: 'AI Brunch Club',
  description: 'Residency at Pinky Swear, New Toronto. Members only. Two guests per table.',
  metadataBase: new URL('https://ai-brunch-club.vercel.app'),
  openGraph: {
    title: 'AI Brunch Club',
    description: 'Residency at Pinky Swear, New Toronto. Members only. Two guests per table.',
    type: 'website',
    locale: 'en_CA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Brunch Club',
    description: 'Residency at Pinky Swear, New Toronto.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,200..700;1,9..144,200..600&family=Instrument+Sans:wght@400;500;600&display=swap"
        />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
