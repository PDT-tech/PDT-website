/* ============================================================
   PDT SINGERS — Supabase Client
   Single source of truth for the Supabase connection.
   Import this in any page that needs Supabase access.
   ============================================================ */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// These values are injected by Netlify from environment variables.
// For local development, create a .env file with these values
// and use a local dev server that supports env var injection,
// OR temporarily hardcode them here (never commit those values).
const SUPABASE_URL      = window.__PDT_ENV?.SUPABASE_URL      || ''
const SUPABASE_ANON_KEY = window.__PDT_ENV?.SUPABASE_ANON_KEY || ''

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('PDT: Supabase credentials missing. Check environment variables.')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

/* ── Auth helpers ──────────────────────────────────────────── */

/**
 * Get the current session (null if not logged in)
 */
export async function getSession () {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

/**
 * Get the current user's profile from the profiles table.
 * Returns null if not logged in.
 */
export async function getProfile () {
  const session = await getSession()
  if (!session) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (error) { console.error('PDT: Error fetching profile', error); return null }
  return data
}

/**
 * Send a magic link to the given email address.
 */
export async function sendMagicLink (email) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/members/`
    }
  })
  return { error }
}

/* ── PASSWORD LOGIN STUB (uncomment to enable) ─────────────── *
export async function signInWithPassword (email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export async function signUpWithPassword (email, password, fullName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } }
  })
  return { data, error }
}
* ─────────────────────────────────────────────────────────── */

/**
 * Sign out the current user.
 */
export async function signOut () {
  const { error } = await supabase.auth.signOut()
  if (!error) window.location.href = '/'
}
