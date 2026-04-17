// PDT Singers — Send Attendance Nudge Emails
// Triggered nightly at 7 AM Pacific via pg_cron (0 15 * * * UTC).
// For each non-rehearsal event 10 days out: nudges members who haven't confirmed.
// Deploy: supabase functions deploy send-attendance-emails

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_URL   = 'https://api.resend.com/emails'
const FROM_ADDRESS = 'PDT Singers <noreply@pdtsingers.org>'
const SITE_URL     = Deno.env.get('SITE_URL') ?? 'https://pdtsingers.org'

Deno.serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const target = new Date()
  target.setDate(target.getDate() + 10)
  const targetStr = target.toISOString().split('T')[0]

  const { data: events, error: eventsErr } = await supabase
    .from('events')
    .select('*')
    .eq('event_date', targetStr)
    .neq('event_type', 'rehearsal')

  if (eventsErr || !events?.length) {
    return json({ ok: true, nudged: 0, targetDate: targetStr, events: events?.length ?? 0 })
  }

  const { data: activeProfiles } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('is_active', true)

  if (!activeProfiles?.length) {
    return json({ ok: true, nudged: 0 })
  }

  let nudged = 0
  const errors: string[] = []

  for (const event of events) {
    const { data: attendance } = await supabase
      .from('event_attendance')
      .select('member_id, status')
      .eq('event_id', event.id)

    const respondedIds = new Set((attendance ?? []).map((a: any) => a.member_id))
    const notSureIds   = new Set(
      (attendance ?? []).filter((a: any) => a.status === 'not_sure').map((a: any) => a.member_id)
    )

    const toNudge = activeProfiles.filter(p =>
      notSureIds.has(p.id) || !respondedIds.has(p.id)
    )

    const eventDate    = formatDate(event.event_date)
    const attendanceUrl = `${SITE_URL}/members/attendance.html?event=${event.id}`

    for (const profile of toNudge) {
      const { data: { user } } = await supabase.auth.admin.getUserById(profile.id)
      if (!user?.email) continue

      const firstName = profile.full_name.split(' ')[0]
      const err = await sendNudge({ to: user.email, firstName, event, eventDate, attendanceUrl })
      if (err) {
        errors.push(`${user.email}: ${err}`)
      } else {
        nudged++
      }
    }
  }

  return json({ ok: true, targetDate: targetStr, nudged, errors })
})

async function sendNudge (opts: {
  to: string, firstName: string, event: Record<string, any>,
  eventDate: string, attendanceUrl: string
}): Promise<string | null> {
  const { to, firstName, event, eventDate, attendanceUrl } = opts
  const subject = `PDT Singers: Are you in for ${event.title}?`

  const callStart = event.call_time && event.start_time
    ? `Call time: ${formatTime(event.call_time)} / Start: ${formatTime(event.start_time)}`
    : event.start_time ? `Start: ${formatTime(event.start_time)}` : null

  const lines = [
    `Hi ${firstName},`,
    '',
    `${event.title} is coming up in 10 days and we haven't heard from you yet.`,
    '',
    `  📅 ${eventDate}`,
    event.location ? `  📍 ${event.location}` : null,
    callStart      ? `  🕐 ${callStart}`       : null,
    '',
    'Will you be joining us?',
    '',
    `  I'll Be There → ${attendanceUrl}`,
    `  I Can't Make It → ${attendanceUrl}`,
    '',
    '(These links take you to the attendance page — you may need to log in.)',
    '',
    'If your plans are still uncertain, you can update your status any time at:',
    attendanceUrl,
    '',
    'See you soon,',
    'PDT Singers',
  ].filter(l => l !== null)

  const apiKey = Deno.env.get('RESEND_API_KEY')
  if (!apiKey) return 'RESEND_API_KEY not set'

  const res = await fetch(RESEND_URL, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM_ADDRESS, to: [to], subject, text: lines.join('\n') })
  })

  return res.ok ? null : `Resend ${res.status}: ${await res.text()}`
}

function formatDate (ds: string): string {
  const [y, m, d] = ds.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
}

function formatTime (ts: string): string {
  if (!ts) return ''
  const [h, m] = ts.split(':').map(Number)
  return new Date(0, 0, 0, h, m).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit'
  })
}

function json (body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}
