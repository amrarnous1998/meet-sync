import { supabase } from './supabase';
import type { Calendar, Availability, Meeting, User } from './supabase';

// Calendar operations
export async function createCalendar(userId: string, title: string, description?: string, isPublic: boolean = true) {
  const { data, error } = await supabase
    .from('calendars')
    .insert({
      user_id: userId,
      title,
      description,
      is_public: isPublic,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  return { data, error };
}

export async function getCalendarsByUserId(userId: string) {
  const { data, error } = await supabase
    .from('calendars')
    .select('*')
    .eq('user_id', userId);

  return { data, error };
}

export async function getCalendarById(calendarId: string) {
  const { data, error } = await supabase
    .from('calendars')
    .select('*')
    .eq('id', calendarId)
    .single();

  return { data, error };
}

export async function updateCalendar(calendarId: string, updates: Partial<Calendar>) {
  const { data, error } = await supabase
    .from('calendars')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', calendarId)
    .select()
    .single();

  return { data, error };
}

export async function deleteCalendar(calendarId: string) {
  const { error } = await supabase
    .from('calendars')
    .delete()
    .eq('id', calendarId);

  return { error };
}

// Availability operations
export async function createAvailability(
  calendarId: string,
  dayOfWeek: number,
  startTime: string,
  endTime: string,
  recurring: boolean = true,
  date?: string
) {
  const { data, error } = await supabase
    .from('availabilities')
    .insert({
      calendar_id: calendarId,
      day_of_week: dayOfWeek,
      start_time: startTime,
      end_time: endTime,
      recurring,
      date,
    })
    .select()
    .single();

  return { data, error };
}

export async function getAvailabilitiesByCalendarId(calendarId: string) {
  const { data, error } = await supabase
    .from('availabilities')
    .select('*')
    .eq('calendar_id', calendarId);

  return { data, error };
}

export async function updateAvailability(availabilityId: string, updates: Partial<Availability>) {
  const { data, error } = await supabase
    .from('availabilities')
    .update(updates)
    .eq('id', availabilityId)
    .select()
    .single();

  return { data, error };
}

export async function deleteAvailability(availabilityId: string) {
  const { error } = await supabase
    .from('availabilities')
    .delete()
    .eq('id', availabilityId);

  return { error };
}

// Meeting operations
export async function createMeeting(
  calendarId: string,
  bookerEmail: string,
  bookerName: string,
  startTime: string,
  endTime: string,
  title: string,
  description?: string,
  googleMeetLink?: string
) {
  const { data, error } = await supabase
    .from('meetings')
    .insert({
      calendar_id: calendarId,
      booker_email: bookerEmail,
      booker_name: bookerName,
      start_time: startTime,
      end_time: endTime,
      google_meet_link: googleMeetLink,
      status: 'pending',
      title,
      description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  return { data, error };
}

export async function getMeetingsByCalendarId(calendarId: string) {
  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('calendar_id', calendarId);

  return { data, error };
}

export async function getMeetingsByUserId(userId: string) {
  const { data: calendars, error: calendarError } = await supabase
    .from('calendars')
    .select('id')
    .eq('user_id', userId);

  if (calendarError) {
    return { data: null, error: calendarError };
  }

  if (!calendars || calendars.length === 0) {
    return { data: [], error: null };
  }

  const calendarIds = calendars.map(cal => cal.id);
  
  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .in('calendar_id', calendarIds)
    .order('start_time', { ascending: true });

  return { data, error };
}

export async function getMeetingById(meetingId: string) {
  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('id', meetingId)
    .single();

  return { data, error };
}

export async function updateMeeting(meetingId: string, updates: Partial<Meeting>) {
  const { data, error } = await supabase
    .from('meetings')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', meetingId)
    .select()
    .single();

  return { data, error };
}

export async function deleteMeeting(meetingId: string) {
  const { error } = await supabase
    .from('meetings')
    .delete()
    .eq('id', meetingId);

  return { error };
}

// User profile operations
export async function updateUserProfile(userId: string, updates: Partial<User>) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  return { data, error };
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  return { data, error };
}