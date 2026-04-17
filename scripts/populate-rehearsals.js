#!/usr/bin/env node
// scripts/populate-rehearsals.js
//
// Deletes all existing Monday rehearsal events for the target year,
// then inserts one rehearsal event for every Monday through Dec 31
// of that year.
//
// Usage:
//   SUPABASE_URL=https://xxxx.supabase.co \
//   SUPABASE_SERVICE_KEY=your-service-role-key \
//   node scripts/populate-rehearsals.js [YYYY]
//
// If year argument is omitted, defaults to current calendar year.
// Run once per year, typically in December for the coming year.

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL         = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const REHEARSAL = {
  title:        'Chorus Rehearsal',
  event_type:   'rehearsal',
  start_time:   '10:30:00',
  end_time:     '12:30:00',
  location:     'Westside Journey UMC, 13420 SW Butner Rd, Beaverton OR 97005',
  is_cancelled: false,
  is_recurring: true,
  notes:        null,
  created_by:   null,
}

const year = parseInt(process.argv[2]) || new Date().getFullYear()

// Collect all Mondays in the target year from today (or Jan 1 if future year)
function getMondaysForYear(year) {
  const mondays = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = new Date(year, 0, 1) // Jan 1
  const cutoff = start > today ? start : today
  const end   = new Date(year, 11, 31) // Dec 31

  let d = new Date(cutoff)
  // Advance to first Monday
  while (d.getDay() !== 1) d.setDate(d.getDate() + 1)

  while (d <= end) {
    mondays.push(d.toISOString().slice(0, 10))
    d.setDate(d.getDate() + 7)
  }
  return mondays
}

async function run() {
  console.log(`\nPopulating rehearsals for ${year}…`)

  // 1. Delete all existing Monday rehearsals in target year
  const { data: existing, error: fetchErr } = await supabase
    .from('events')
    .select('id, event_date')
    .eq('event_type', 'rehearsal')
    .gte('event_date', `${year}-01-01`)
    .lte('event_date', `${year}-12-31`)

  if (fetchErr) { console.error('Fetch error:', fetchErr.message); process.exit(1) }

  const mondayIds = existing
    .filter(e => new Date(e.event_date + 'T12:00:00').getDay() === 1)
    .map(e => e.id)

  if (mondayIds.length > 0) {
    const { error: delErr } = await supabase
      .from('events')
      .delete()
      .in('id', mondayIds)
    if (delErr) { console.error('Delete error:', delErr.message); process.exit(1) }
    console.log(`Deleted ${mondayIds.length} existing Monday rehearsals.`)
  } else {
    console.log('No existing Monday rehearsals to delete.')
  }

  // 2. Insert new rehearsals
  const mondays = getMondaysForYear(year)
  const rows = mondays.map(date => ({ ...REHEARSAL, event_date: date }))

  const { error: insertErr } = await supabase.from('events').insert(rows)
  if (insertErr) { console.error('Insert error:', insertErr.message); process.exit(1) }

  console.log(`Inserted ${rows.length} rehearsals (${mondays[0]} → ${mondays[mondays.length-1]}).`)
  console.log('Done.\n')
}

run()
