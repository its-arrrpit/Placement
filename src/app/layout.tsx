import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Placement Tracker 2026',
  description:
    'Live placement tracking portal. Real-time updates for recruitment drives, registration deadlines, online assessments, and interview schedules.',
  keywords: ['Placements 2026', 'Superset', 'Engineering Placements', 'Placement Schedule'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        {children}
      </body>
    </html>
  );
}
