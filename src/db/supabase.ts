import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://zpbbnmdzxzzyvlswnnmi.supabase.co';

const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export interface Circuit {
  id: string;
  standId: string;
  name: string;
  isOccupied: boolean;
  isActive: boolean;
  userId: string | null;
  taskNumber: string | null;
}

export interface Stand {
  id: string;
  name: string;
  isActive: boolean;
}

export interface User {
  id: string;
  name: string;
}

