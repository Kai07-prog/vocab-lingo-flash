
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ktqfrogfartulsrvfytw.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0cWZyb2dmYXJ0dWxzcnZmeXR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgyNDU0NjYsImV4cCI6MjA1MzgyMTQ2Nn0.sKQdVfvK9XgsWORk22eLr18ZXx14q5xUEFUL_yGP5Xc";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'supabase.auth.token',
  },
});
