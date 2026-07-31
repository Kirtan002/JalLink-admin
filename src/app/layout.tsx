import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'JalLink Admin',
  description: 'Internal admin panel for JalLink subscriptions and delivery partners.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
