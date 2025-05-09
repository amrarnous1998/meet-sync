'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getCalendarById, updateCalendar } from '@/lib/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { Calendar } from '@/lib/supabase';

// Define the form schema using Zod
const formSchema = z.object({
  title: z.string().min(3, {
    message: 'Calendar title must be at least 3 characters.',
  }),
  description: z.string().optional(),
  isPublic: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditCalendarPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [calendar, setCalendar] = useState<Calendar | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      isPublic: true,
    },
  });

  useEffect(() => {
    const fetchCalendar = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await getCalendarById(params.id);
        
        if (error) {
          throw error;
        }
        
        if (!data) {
          setError('Calendar not found.');
          return;
        }
        
        // Check if the user is the owner of the calendar
        if (data.user_id !== user.id) {
          setError('You do not have permission to edit this calendar.');
          return;
        }
        
        setCalendar(data);
        
        // Set form values
        form.reset({
          title: data.title,
          description: data.description || '',
          isPublic: data.is_public,
        });
      } catch (err) {
        console.error('Error fetching calendar:', err);
        setError('Failed to fetch calendar data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalendar();
  }, [user, params.id, form]);  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    if (!user || !calendar) {
      setError('You must be logged in and have a valid calendar to edit.');
      return;
    }

    setIsSubmitting(true);
    setError(null);    try {
      const { data, error } = await updateCalendar(params.id, {
        title: values.title,
        description: values.description || undefined, // Convert empty string to undefined
        is_public: values.isPublic,
      });

      if (error) throw error;

      // Redirect to the calendar's details page
      router.push(`/dashboard/calendars/${params.id}`);
      router.refresh();
    } catch (err) {
      console.error('Error updating calendar:', err);
      setError('Failed to update calendar. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Edit Calendar</h1>
        <p className="text-muted-foreground">
          Update your calendar settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Calendar Details</CardTitle>
          <CardDescription>
            Modify basic information for your calendar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calendar Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Work Meetings, Consulting Hours" {...field} />
                    </FormControl>
                    <FormDescription>
                      Give your calendar a clear name so others know what type of meetings they're booking
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide details about this calendar" 
                        className="resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Optional details about what this calendar is for
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Public Calendar</FormLabel>
                      <FormDescription>
                        Allow anyone with the link to view and book this calendar
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/dashboard/calendars/${params.id}`)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
