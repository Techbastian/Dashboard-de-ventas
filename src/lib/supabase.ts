import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://upkvrgncduvxzjvtxbpv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwa3ZyZ25jZHV2eHpqdnR4YnB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNTA3ODgsImV4cCI6MjA3OTcyNjc4OH0.7R52do0JRvkrK89vtv8wlYZorWokSQmNaYXm8Itb4yk';

export const supabase = createClient(supabaseUrl, supabaseKey);
