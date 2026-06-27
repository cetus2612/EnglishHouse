'use client';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!url || !anon) {
  // ช่วยเตือนตอน dev ถ้าลืมตั้งค่า env
  console.warn('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// ใช้ client เดียวทั้งแอป (เก็บ session ใน localStorage ของเบราว์เซอร์)
export const supabase = createClient(url, anon, {
  auth: { persistSession: true, autoRefreshToken: true },
});
