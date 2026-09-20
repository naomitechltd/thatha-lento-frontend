// Initialize Supabase using the global CDN script and your Vercel environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qqvjypuzmrqryvanbqbw.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_PUBLISHABLE_KEY';

export const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
