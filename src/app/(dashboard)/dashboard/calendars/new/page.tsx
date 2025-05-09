'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { createCalendar } from '@/lib/database';
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

// Define the form schema using Zod
const formSchema = z.object({
  title: z.string().min(3, {
    message: 'Calendar title must be at least 3 characters.',
  }),
  description: z.string().optional(),
  isPublic: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewCalendarPage() {
  const { user } = useAuth();
  const router = useRouter();
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

  // Handle form submission
  const onSubmit = async (values: FormValues) => {    if (!user) {
      setError('You must be logged in to create a calendar.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      const { data, error } = await createCalendar(
        user.id,
        values.title,
        values.description || undefined, // Convert empty string to undefined
        values.isPublic
      );

      if (error) throw error;

      // Redirect to the newly created calendar's details page
      router.push(`/dashboard/calendars/${data.id}`);
      router.refresh();
    } catch (err) {
      console.error('Error creating calendar:', err);
      setError('Failed to create calendar. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create New Calendar</h1>
        <p className="text-muted-foreground">
          Create a calendar for scheduling meetings with others
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Calendar Details</CardTitle>
          <CardDescription>
            Configure basic information for your new calendar
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="p-4 mb-6 rounded-md bg-destructive/10 text-destructive">
              {error}
            </div>
          )}

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
                  onClick={() => router.push('/dashboard')}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Calendar'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
