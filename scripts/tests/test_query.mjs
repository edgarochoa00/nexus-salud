import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jtvkpbtyrsadkmbahino.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Wait, I don't need anon key, I can use Postgres directly!
