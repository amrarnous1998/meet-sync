'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/auth';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/sign-in');
    }
  }, [user, isLoading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/sign-in');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="text-xl font-bold">
              MeetSync
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/dashboard" 
              className={`text-sm font-medium ${pathname === '/dashboard' ? 'text-primary' : 'text-muted-foreground'}`}
            >
              Dashboard
            </Link>
            <Link 
              href="/dashboard/calendars" 
              className={`text-sm font-medium ${pathname.includes('/calendars') ? 'text-primary' : 'text-muted-foreground'}`}
            >
              Calendars
            </Link>
            <Link 
              href="/dashboard/meetings" 
              className={`text-sm font-medium ${pathname.includes('/meetings') ? 'text-primary' : 'text-muted-foreground'}`}
            >
              Meetings
            </Link>
            <Link 
              href="/dashboard/settings" 
              className={`text-sm font-medium ${pathname.includes('/settings') ? 'text-primary' : 'text-muted-foreground'}`}
            >
              Settings
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button onClick={handleSignOut} variant="outline" size="sm">
              Sign Out
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-6 px-4">{children}</div>
      </main>
      <footer className="border-t py-4">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 px-4 text-center md:text-left">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} MeetSync. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}