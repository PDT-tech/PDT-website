// PDT Singers — Generate Rehearsals Edge Function
// Generates Monday rehearsal events for the next 12 weeks (rolling).
// Safe to run repeatedly — skips dates that already exist.
// Deploy: supabase functions deploy generate-rehearsals
// Schedule: run weekly via Supabase cron (or manually as needed)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const today = new Date()
  const rehearsals = []

  for (let week = 0; week < 12; week++) {
    const date = new Date(today)
    // Calculate days until next Monday (1 = Monday)
    const day = date.getDay()
    const daysUntilMonday = day === 1 ? 7 : (8 - day) % 7
    date.setDate(date.getDate() + daysUntilMonday + (week * 7))

    const dateStr = date.toISOString().split('T')[0]

    rehearsals.push({
      title:       'Monday Rehearsal',
      event_type:  'rehearsal',
      event_date:  dateStr,
      start_time:  '10:30:00',
      end_time:    '12:30:00',
      location:    'Westside Journey United Methodist Church, 13420 SW Butner Rd, Beaverton OR 97005',
      is_recurring: true
    })
  }

  const { error, count } = await supabase
    .from('events')
    .upsert(rehearsals, {
      onConflict: 'event_type,event_date',
      ignoreDuplicates: true,
      count: 'exact'
    })

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({
    ok: true,
    attempted: rehearsals.length,
    inserted: count ?? 0,
    dates: rehearsals.map(r => r.event_date)
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
})
