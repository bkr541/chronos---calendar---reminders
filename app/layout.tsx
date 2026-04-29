import type {Metadata} from 'next';
import './globals.css';
import { Providers } from './providers';
import { BottomNav } from '@/components/bottom-nav';
import { AuthGuard } from '@/components/auth-guard';

export const metadata: Metadata = {
  title: 'Chronos - Calendar & Reminders',
  description: 'Clean, fast mobile calendar MVP',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[#e4e4e7] text-foreground antialiased h-[100dvh] flex justify-center w-full" suppressHydrationWarning>
        <div className="w-full max-w-md bg-[#f4f4f7] border-x border-[#18181b]/10 shadow-2xl relative h-full flex flex-col mx-auto overflow-hidden">
          <Providers>
            <main className="flex-1 overflow-y-auto">
              <AuthGuard>
                {children}
              </AuthGuard>
            </main>
            <BottomNav />
          </Providers>
        </div>
      </body>
    </html>
  );
}
