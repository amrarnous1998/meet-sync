'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getCalendarById, getAvailabilitiesByCalendarId, deleteCalendar } from '@/lib/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Calendar, Availability } from '@/lib/supabase';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function CalendarDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [calendar, setCalendar] = useState<Calendar | null>(null);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchCalendarData = async () => {
      if (!user) return;
      
      try {
        // Fetch calendar details
        const { data: calendarData, error: calendarError } = await getCalendarById(params.id);
        
        if (calendarError) {
          throw calendarError;
        }
        
        if (!calendarData) {
          setError('Calendar not found.');
          return;
        }
        
        // Check if the user is the owner of the calendar
        if (calendarData.user_id !== user.id) {
          setError('You do not have permission to view this calendar.');
          return;
        }
        
        setCalendar(calendarData);
        
        // Fetch availabilities
        const { data: availabilityData, error: availabilityError } = await getAvailabilitiesByCalendarId(params.id);
        
        if (availabilityError) {
          throw availabilityError;
        }
        
        setAvailabilities(availabilityData || []);
      } catch (err) {
        console.error('Error fetching calendar data:', err);
        setError('Failed to fetch calendar data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalendarData();
  }, [user, params.id]);

  const handleDeleteCalendar = async () => {
    setIsDeleting(true);
    
    try {
      const { error } = await deleteCalendar(params.id);
      
      if (error) {
        throw error;
      }
      
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      console.error('Error deleting calendar:', err);
      setError('Failed to delete calendar. Please try again.');
      setIsDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const meridiem = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${meridiem}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-md bg-destructive/10 text-destructive">
        <h2 className="text-lg font-semibold mb-2">Error</h2>
        <p>{error}</p>
        <Button 
          className="mt-4" 
          variant="outline" 
          onClick={() => router.push('/dashboard')}
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }

  if (!calendar) {
    return (
      <div className="p-6 rounded-md bg-muted">
        <h2 className="text-lg font-semibold mb-2">Calendar Not Found</h2>
        <p>The calendar you're looking for does not exist or has been deleted.</p>
        <Button 
          className="mt-4" 
          variant="outline" 
          onClick={() => router.push('/dashboard')}
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{calendar.title}</h1>
          <p className="text-muted-foreground">
            {calendar.description || 'No description provided'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/dashboard/calendars/${params.id}/availability`}>
            <Button>Manage Availability</Button>
          </Link>
          <Link href={`/dashboard/calendars/${params.id}/edit`}>
            <Button variant="outline">Edit Calendar</Button>
          </Link>
          <Button 
            variant="outline" 
            className="text-destructive border-destructive hover:bg-destructive/10"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Calendar Details</CardTitle>
            <CardDescription>Basic information about this calendar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium">Status:</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`h-2 w-2 rounded-full ${calendar.is_public ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                <span>{calendar.is_public ? 'Public' : 'Private'}</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Created on:</p>
              <p className="text-muted-foreground">
                {new Date(calendar.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Last updated:</p>
              <p className="text-muted-foreground">
                {new Date(calendar.updated_at).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full" onClick={() => {}}>
              Copy Calendar Link
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Availability</CardTitle>
            <CardDescription>When you're available for meetings</CardDescription>
          </CardHeader>
          <CardContent>
            {availabilities.length > 0 ? (
              <div className="space-y-3">
                {availabilities.map((availability) => (
                  <div key={availability.id} className="p-3 rounded-md bg-muted">
                    <div className="font-medium">
                      {availability.recurring 
                        ? `Every ${getDayName(availability.day_of_week)}` 
                        : new Date(availability.date!).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatTime(availability.start_time)} - {formatTime(availability.end_time)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-3">
                  No availability set up yet
                </p>
                <Link href={`/dashboard/calendars/${params.id}/availability`}>
                  <Button size="sm">Set Availability</Button>
                </Link>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Link href={`/dashboard/calendars/${params.id}/availability`} className="w-full">
              <Button variant="outline" size="sm" className="w-full">
                {availabilities.length > 0 ? 'Manage Availability' : 'Add Availability'}
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Upcoming Meetings</CardTitle>
          <CardDescription>Meetings scheduled for this calendar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-3">
              No meetings scheduled yet
            </p>
            <p className="text-sm text-muted-foreground">
              Share your calendar link with others to allow them to book meetings with you
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Calendar</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this calendar? This action cannot be undone and will cancel all associated meetings.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteCalendar}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Calendar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
