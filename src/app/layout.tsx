import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeContext';

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
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme');
                  var isDark = stored !== 'light';
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased selection:bg-blue-600/20 selection:text-blue-600 dark:selection:bg-blue-600/30 dark:selection:text-blue-200">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
