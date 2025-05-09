'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getMeetingsByUserId } from '@/lib/database';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Meeting } from '@/lib/supabase';

export default function MeetingsPage() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchMeetings = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await getMeetingsByUserId(user.id);
        
        if (error) {
          throw error;
        }
        
        setMeetings(data || []);
      } catch (err) {
        console.error('Error fetching meetings:', err);
        setError('Failed to fetch your meetings. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeetings();
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
          <h1 className="text-3xl font-bold tracking-tight">Your Meetings</h1>
          <p className="text-muted-foreground">Manage all your scheduled meetings</p>
        </div>
        <Link href="/dashboard/calendars">
          <Button>Create New Calendar</Button>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-md bg-destructive/10 text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Meetings</CardTitle>
          <CardDescription>
            Meetings that are scheduled in the future
          </CardDescription>
        </CardHeader>
        <CardContent>
          {meetings.length > 0 ? (
            <div className="divide-y">
              {meetings.map((meeting) => (
                <div key={meeting.id} className="py-4">
                  <div className="flex flex-col md:flex-row justify-between gap-2">
                    <div>
                      <h3 className="font-medium">{meeting.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(meeting.start_time).toLocaleDateString()} at {
                          new Date(meeting.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        }
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      {meeting.google_meet_link && (
                        <Button size="sm">
                          Join Meeting
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                You don't have any upcoming meetings
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Create a calendar and share your availability to start receiving meeting bookings
              </p>
              <Link href="/dashboard/calendars/new">
                <Button>Create a Calendar</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Past Meetings</CardTitle>
          <CardDescription>
            Your meeting history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No past meetings found
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon: Google Meet Integration</CardTitle>
          <CardDescription>
            Automatically generate Google Meet links for your meetings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Connect your Google account to enable automatic Google Meet link generation for all your meetings.
          </p>
        </CardContent>
        <CardFooter>
          <Link href="/dashboard/settings">
            <Button variant="outline">Go to Settings</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
