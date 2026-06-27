import './globals.css';
import type { Metadata } from 'next';
import { LangProvider } from '@/lib/i18n';
import { ToastProvider } from '@/components/ui';

export const metadata: Metadata = {
  title: 'ระบบจัดการโรงเรียน · School Manager',
  description: 'School management system',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <LangProvider>
          <ToastProvider>{children}</ToastProvider>
        </LangProvider>
      </body>
    </html>
  );
}
