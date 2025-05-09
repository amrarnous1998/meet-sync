'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCalendarById, getAvailabilitiesByCalendarId } from '@/lib/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { Calendar, Availability } from '@/lib/supabase';

// Define the booking form schema
const bookingFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  date: z.string().min(1, {
    message: 'Please select a date.',
  }),
  time: z.string().min(1, {
    message: 'Please select a time slot.',
  }),
  title: z.string().min(3, {
    message: 'Meeting title must be at least 3 characters.',
  }),
  description: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

export default function PublicCalendarPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [calendar, setCalendar] = useState<Calendar | null>(null);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableTimes, setAvailableTimes] = useState<{start: string, end: string}[]>([]);

  // Initialize the booking form
  const bookingForm = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      name: '',
      email: '',
      date: '',
      time: '',
      title: '',
      description: '',
    },
  });

  useEffect(() => {
    const fetchCalendarData = async () => {
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
        
        // Check if the calendar is public
        if (!calendarData.is_public) {
          setError('This calendar is private and cannot be viewed.');
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
  }, [params.id]);

  // Effect to update available times when a date is selected
  useEffect(() => {
    if (!selectedDate || !availabilities.length) return;

    const selectedDay = new Date(selectedDate).getDay(); // 0-6 (Sunday-Saturday)
    
    // Filter availabilities for the selected day
    const matchingAvailabilities = availabilities.filter(availability => {
      if (availability.recurring) {
        return availability.day_of_week === selectedDay;
      } else if (availability.date) {
        // Format both dates to YYYY-MM-DD for comparison
        const availabilityDate = new Date(availability.date).toISOString().split('T')[0];
        return availabilityDate === selectedDate;
      }
      return false;
    });

    // Extract start and end times
    const times = matchingAvailabilities.map(availability => ({
      start: availability.start_time,
      end: availability.end_time,
    }));

    setAvailableTimes(times);
  }, [selectedDate, availabilities]);

  // Dummy function for booking (will be implemented with Google Meet integration)
  const handleBookMeeting = async (values: BookingFormValues) => {
    setIsSubmitting(true);
    
    try {
      // This is where we would create a meeting in the database
      // and generate a Google Meet link
      console.log('Booking meeting with values:', values);
      
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Close dialog and show success message
      setIsBookingDialogOpen(false);
      alert('Meeting booked successfully! This is a placeholder - the actual booking feature will be implemented in the next iteration.');
    } catch (err) {
      console.error('Error booking meeting:', err);
      setError('Failed to book meeting. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDaysWithAvailability = () => {
    const days = new Set<number>();
    
    // Collect all days that have recurring availability
    availabilities.forEach(availability => {
      if (availability.recurring) {
        days.add(availability.day_of_week);
      }
    });
    
    return Array.from(days);
  };

  const isDateAvailable = (date: Date) => {
    const dayOfWeek = date.getDay();
    const dateString = date.toISOString().split('T')[0];
    
    // Check if there's recurring availability for this day of the week
    const hasRecurringAvailability = availabilities.some(
      availability => availability.recurring && availability.day_of_week === dayOfWeek
    );
    
    // Check if there's specific availability for this date
    const hasSpecificAvailability = availabilities.some(
      availability => !availability.recurring && availability.date === dateString
    );
    
    return hasRecurringAvailability || hasSpecificAvailability;
  };

  const getNextAvailableDates = () => {
    const dates = [];
    const today = new Date();
    const daysWithAvailability = getDaysWithAvailability();
    
    // Look ahead 30 days maximum
    for (let i = 0; i < 30 && dates.length < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      if (isDateAvailable(date)) {
        dates.push(date.toISOString().split('T')[0]);
      }
    }
    
    return dates;
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
      <div className="flex justify-center items-center min-h-screen p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full p-6 rounded-lg bg-destructive/10 text-destructive">
          <h2 className="text-xl font-semibold mb-3">Error</h2>
          <p className="mb-4">{error}</p>
          <Button 
            variant="outline" 
            onClick={() => router.push('/')}
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  if (!calendar) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full p-6 rounded-lg bg-muted">
          <h2 className="text-xl font-semibold mb-3">Calendar Not Found</h2>
          <p className="mb-4">The calendar you're looking for does not exist or has been deleted.</p>
          <Button 
            variant="outline" 
            onClick={() => router.push('/')}
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const availableDates = getNextAvailableDates();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-background border-b">
        <div className="container flex justify-between items-center h-16 px-4">
          <Link href="/" className="font-bold text-xl">MeetSync</Link>
          <div className="flex gap-4">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow container py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">{calendar.title}</h1>
            <p className="text-muted-foreground mt-1">
              {calendar.description || 'No description provided'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Book a Meeting</CardTitle>
                <CardDescription>
                  Select a date and time to schedule a meeting
                </CardDescription>
              </CardHeader>
              <CardContent>
                {availableDates.length > 0 ? (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label>Select a date</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {availableDates.map((date) => (
                          <Button
                            key={date}
                            variant={selectedDate === date ? "default" : "outline"}
                            className="h-auto py-2 justify-start"
                            onClick={() => {
                              setSelectedDate(date);
                              bookingForm.setValue('date', date);
                            }}
                          >
                            <div className="text-left">
                              <div>{new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                              <div className="text-xs">{new Date(date).toLocaleDateString()}</div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {selectedDate && (
                      <div className="space-y-2">
                        <Label>Select a time</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {availableTimes.length > 0 ? (
                            availableTimes.map((time, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                className="h-auto py-2"
                                onClick={() => {
                                  bookingForm.setValue('time', `${time.start}-${time.end}`);
                                  setIsBookingDialogOpen(true);
                                }}
                              >
                                {formatTime(time.start)} - {formatTime(time.end)}
                              </Button>
                            ))
                          ) : (
                            <p className="text-muted-foreground col-span-full">
                              No available time slots for this date.
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-3">
                      No available time slots found
                    </p>
                    <p className="text-sm text-muted-foreground">
                      The owner of this calendar hasn't set up any availability yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>About This Calendar</CardTitle>
                <CardDescription>
                  Calendar details and information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium">Calendar Name</h3>
                  <p className="text-muted-foreground">{calendar.title}</p>
                </div>
                {calendar.description && (
                  <div>
                    <h3 className="font-medium">Description</h3>
                    <p className="text-muted-foreground">{calendar.description}</p>
                  </div>
                )}
                <div>
                  <h3 className="font-medium">Created by</h3>
                  <p className="text-muted-foreground">
                    {/* In a future iteration, we'll fetch and display the user's name */}
                    Calendar Owner
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="bg-muted py-6">
        <div className="container px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} MeetSync. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Book a Meeting</DialogTitle>
            <DialogDescription>
              Enter your details to book a meeting on {selectedDate && new Date(selectedDate).toLocaleDateString()} at {
                bookingForm.getValues().time && bookingForm.getValues().time.split('-').map(t => formatTime(t)).join(' - ')
              }
            </DialogDescription>
          </DialogHeader>
          <Form {...bookingForm}>
            <form onSubmit={bookingForm.handleSubmit(handleBookMeeting)} className="space-y-4">
              <FormField
                control={bookingForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={bookingForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="john@example.com" type="email" {...field} />
                    </FormControl>
                    <FormDescription>
                      You'll receive the meeting link and confirmation via email
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={bookingForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meeting Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Quick Chat, Project Discussion, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={bookingForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="What would you like to discuss in this meeting?" 
                        className="resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsBookingDialogOpen(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Booking...' : 'Book Meeting'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
