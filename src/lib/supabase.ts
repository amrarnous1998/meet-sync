import { createClient } from '@supabase/supabase-js';

// These environment variables will need to be set in a .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for your database tables
export type User = {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  time_zone?: string;
};

export type Calendar = {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

export type Availability = {
  id: string;
  calendar_id: string;
  day_of_week: number; // 0-6 (Sunday-Saturday)
  start_time: string;
  end_time: string;
  recurring: boolean;
  date?: string;
};

export type Meeting = {
  id: string;
  calendar_id: string;
  booker_email: string;
  booker_name?: string;
  start_time: string;
  end_time: string;
  google_meet_link?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
};