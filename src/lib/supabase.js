import { createClient } from '@supabase/supabase-js';

// ─── SUPABASE CONFIG ───────────────────────────────────────────
// Replace these with your Supabase project URL and anon key
// Found at: https://app.supabase.com → Project Settings → API
const SUPABASE_URL = 'https://ffuumzbezfxmfusphbgy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_EnL15KFHmp12uJZz_fW3Xg_hj3Oq-uB';
// ──────────────────────────────────────────────────────────────

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
