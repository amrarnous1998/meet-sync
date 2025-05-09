'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getCalendarsByUserId } from '@/lib/database';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Calendar } from '@/lib/supabase';

export default function DashboardPage() {
  const { user } = useAuth();
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCalendars = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await getCalendarsByUserId(user.id);
        
        if (error) {
          throw error;
        }
        
        setCalendars(data || []);
      } catch (err) {
        console.error('Error fetching calendars:', err);
        setError('Failed to fetch your calendars. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalendars();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.user_metadata?.full_name || 'User'}</h1>
          <p className="text-muted-foreground">Manage your meeting calendars and appointments</p>
        </div>
        <Link href="/dashboard/calendars/new">
          <Button>Create New Calendar</Button>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-md bg-destructive/10 text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {calendars.length > 0 ? (
          calendars.map((calendar) => (
            <Card key={calendar.id}>
              <CardHeader>
                <CardTitle>{calendar.title}</CardTitle>
                <CardDescription>{calendar.description || 'No description provided'}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${calendar.is_public ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                  <span className="text-sm">{calendar.is_public ? 'Public' : 'Private'}</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Link href={`/dashboard/calendars/${calendar.id}`}>
                  <Button variant="outline" size="sm">View Details</Button>
                </Link>
                <Link href={`/dashboard/calendars/${calendar.id}/edit`}>
                  <Button variant="outline" size="sm">Edit</Button>
                </Link>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card>
              <CardHeader>
                <CardTitle>No calendars yet</CardTitle>
                <CardDescription>Create your first calendar to start scheduling meetings</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Calendars help you organize your availability and let others book meetings with you.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/dashboard/calendars/new">
                  <Button>Create Calendar</Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-bold tracking-tight mb-4">Upcoming Meetings</h2>
        {/* Will be implemented in future iterations */}
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>Your upcoming meetings will be displayed here</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Connect your Google Calendar to sync and display your upcoming meetings.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/settings">
              <Button variant="outline">Connect Google Calendar</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}