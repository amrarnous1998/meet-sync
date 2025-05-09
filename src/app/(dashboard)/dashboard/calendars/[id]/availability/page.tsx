'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getCalendarById, getAvailabilitiesByCalendarId, createAvailability, deleteAvailability } from '@/lib/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import type { Calendar, Availability } from '@/lib/supabase';

export default function AvailabilityPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [calendar, setCalendar] = useState<Calendar | null>(null);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState<string | null>(null);

  // Form state
  const [dayOfWeek, setDayOfWeek] = useState<string>('1'); // Monday by default
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('17:00');
  const [isRecurring, setIsRecurring] = useState<boolean>(true);
  const [specificDate, setSpecificDate] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
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
          setError('You do not have permission to manage this calendar.');
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
        console.error('Error fetching data:', err);
        setError('Failed to fetch calendar data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, params.id]);

  const handleSubmit = async () => {
    setFormError(null);
    
    // Validate form
    if (!isRecurring && !specificDate) {
      setFormError('Please select a specific date for non-recurring availability.');
      return;
    }
    
    if (startTime >= endTime) {
      setFormError('End time must be after start time.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { data, error } = await createAvailability(
        params.id,
        parseInt(dayOfWeek, 10),
        startTime,
        endTime,
        isRecurring,
        isRecurring ? undefined : specificDate
      );
      
      if (error) {
        throw error;
      }
      
      // Add the new availability to the state
      setAvailabilities([...availabilities, data]);
      
      // Reset form
      setDayOfWeek('1');
      setStartTime('09:00');
      setEndTime('17:00');
      setIsRecurring(true);
      setSpecificDate('');
      
      // Close dialog
      setIsDialogOpen(false);
    } catch (err) {
      console.error('Error creating availability:', err);
      setFormError('Failed to create availability. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAvailability = async (id: string) => {
    setIsDeleteLoading(id);
    
    try {
      const { error } = await deleteAvailability(id);
      
      if (error) {
        throw error;
      }
      
      // Remove the deleted availability from the state
      setAvailabilities(availabilities.filter(availability => availability.id !== id));
    } catch (err) {
      console.error('Error deleting availability:', err);
      setError('Failed to delete availability. Please try again.');
    } finally {
      setIsDeleteLoading(null);
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
          <h1 className="text-3xl font-bold tracking-tight">Manage Availability</h1>
          <p className="text-muted-foreground">
            {calendar.title} - Set when you're available for meetings
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsDialogOpen(true)}
          >
            Add Availability
          </Button>
          <Link href={`/dashboard/calendars/${params.id}`}>
            <Button variant="outline">Back to Calendar</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Availability</CardTitle>
          <CardDescription>
            These are the times when people can book meetings with you
          </CardDescription>
        </CardHeader>
        <CardContent>
          {availabilities.length > 0 ? (
            <div className="space-y-4">
              {availabilities.map((availability) => (
                <div 
                  key={availability.id} 
                  className="flex justify-between items-center p-4 rounded-md border"
                >
                  <div>
                    <div className="font-medium">
                      {availability.recurring 
                        ? `Every ${getDayName(availability.day_of_week)}` 
                        : new Date(availability.date!).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatTime(availability.start_time)} - {formatTime(availability.end_time)}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteAvailability(availability.id)}
                    disabled={isDeleteLoading === availability.id}
                  >
                    {isDeleteLoading === availability.id ? 'Deleting...' : 'Remove'}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-3">
                No availability time slots added yet
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Add when you're available for meetings on this calendar
              </p>
              <Button
                onClick={() => setIsDialogOpen(true)}
              >
                Add Your First Availability
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Availability Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Availability</DialogTitle>
            <DialogDescription>
              Set times when you're available for meetings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {formError && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                {formError}
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="recurring" 
                checked={isRecurring}
                onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
              />
              <Label htmlFor="recurring">Recurring weekly</Label>
            </div>

            {isRecurring ? (
              <div className="space-y-2">
                <Label htmlFor="day">Day of week</Label>
                <Select 
                  value={dayOfWeek} 
                  onValueChange={setDayOfWeek}
                >
                  <SelectTrigger id="day">
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sunday</SelectItem>
                    <SelectItem value="1">Monday</SelectItem>
                    <SelectItem value="2">Tuesday</SelectItem>
                    <SelectItem value="3">Wednesday</SelectItem>
                    <SelectItem value="4">Thursday</SelectItem>
                    <SelectItem value="5">Friday</SelectItem>
                    <SelectItem value="6">Saturday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="date">Specific date</Label>
                <Input 
                  id="date" 
                  type="date" 
                  value={specificDate} 
                  onChange={(e) => setSpecificDate(e.target.value)}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time">Start time</Label>
                <Input 
                  id="start-time" 
                  type="time" 
                  value={startTime} 
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-time">End time</Label>
                <Input 
                  id="end-time" 
                  type="time" 
                  value={endTime} 
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Availability'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
