// PDT Singers — Notify Attendance Change
// Triggered by Supabase database webhook on event_attendance INSERT or UPDATE.
// Sends director notification (non-rehearsal events) + member confirmation.
// Deploy: supabase functions deploy notify-attendance-change

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_URL   = 'https://api.resend.com/emails'
const FROM_ADDRESS = 'PDT Singers <noreply@pdtsingers.org>'
const SITE_URL     = Deno.env.get('SITE_URL') ?? 'https://pdtsingers.org'

Deno.serve(async (req) => {
  const payload   = await req.json()
  const record    = payload.record
  const oldRecord = payload.old_record ?? null

  if (!record?.event_id || !record?.member_id) {
    return json({ error: 'missing fields' }, 400)
  }

  // Skip if nothing meaningful changed (webhook fires on any update)
  if (oldRecord && oldRecord.status === record.status && oldRecord.reason === record.reason) {
    return json({ ok: true, skipped: true })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const [eventRes, memberUserRes, memberProfileRes] = await Promise.all([
    supabase.from('events').select('*').eq('id', record.event_id).single(),
    supabase.auth.admin.getUserById(record.member_id),
    supabase.from('profiles').select('full_name').eq('id', record.member_id).single()
  ])

  const event         = eventRes.data
  const memberUser    = memberUserRes.data?.user
  const memberProfile = memberProfileRes.data

  if (!event || !memberUser) {
    return json({ error: 'event or member not found' }, 404)
  }

  const memberName      = memberProfile?.full_name ?? memberUser.email
  const memberFirstName = memberName.split(' ')[0]
  const memberEmail     = memberUser.email
  const isRehearsal     = event.event_type === 'rehearsal'
  const statusLabel     = { attending: 'Attending', not_sure: 'Not sure yet', not_attending: "Can't make it" }[record.status as string] ?? record.status
  const eventDate       = formatDate(event.event_date)
  const attendanceUrl   = `${SITE_URL}/members/attendance.html?event=${event.id}`
  const censusUrl       = `${SITE_URL}/members/admin-attendance.html?event=${event.id}`

  const errors: string[] = []

  // Member confirmation email
  const confirmErr = await sendMemberConfirmation({
    to: memberEmail, firstName: memberFirstName, event,
    status: record.status, statusLabel, eventDate, attendanceUrl
  })
  if (confirmErr) errors.push(`member confirm: ${confirmErr}`)

  // Director notification (non-rehearsal only)
  if (!isRehearsal) {
    const { data: directors } = await supabase
      .from('profiles').select('id').eq('role', 'musical_director')

    for (const dp of (directors ?? [])) {
      const { data: { user: dirUser } } = await supabase.auth.admin.getUserById(dp.id)
      if (!dirUser?.email) continue
      const { data: dirProfile } = await supabase.from('profiles').select('full_name').eq('id', dp.id).single()
      const dirFirstName = (dirProfile?.full_name ?? '').split(' ')[0] || 'Chris'

      const notifyErr = await sendDirectorNotification({
        to: dirUser.email, dirFirstName, memberName, event,
        statusLabel, reason: record.reason, eventDate, censusUrl
      })
      if (notifyErr) errors.push(`director notify: ${notifyErr}`)
    }
  }

  return json({ ok: errors.length === 0, errors })
})

async function sendMemberConfirmation (opts: {
  to: string, firstName: string, event: Record<string, any>,
  status: string, statusLabel: string, eventDate: string, attendanceUrl: string
}): Promise<string | null> {
  const { to, firstName, event, status, statusLabel, eventDate, attendanceUrl } = opts
  const subject = `PDT Singers: Your attendance status for ${event.title}`

  let text: string
  if (status === 'attending') {
    const lines = [
      `Hi ${firstName},`,
      '',
      `You're confirmed for ${event.title}. Here are the details:`,
      '',
      `  📅 ${eventDate}`,
      event.location     ? `  📍 ${event.location}`                                                                         : null,
      event.address      ? `  📍 ${event.address}  (map: https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.address)})` : null,
      event.call_time    ? `  🕐 Call time: ${formatTime(event.call_time)}`                                                  : null,
      event.start_time   ? `     Start time: ${formatTime(event.start_time)}`                                                : null,
      event.end_time     ? `     End time: ${formatTime(event.end_time)}`                                                    : null,
      event.dress_code   ? `  👔 Dress code: ${event.dress_code}`                                                            : null,
      event.parking_notes ? `  🅿️  Parking: ${event.parking_notes}`                                                          : null,
      event.notes        ? `  📝 Notes: ${event.notes}`                                                                      : null,
      '',
      'See you there!',
      'PDT Singers',
    ].filter(l => l !== null)
    text = lines.join('\n')
  } else {
    text = [
      `Hi ${firstName},`,
      '',
      `Your attendance status for ${event.title} (${eventDate}) has been updated to:`,
      statusLabel,
      '',
      'You can change your status any time at:',
      attendanceUrl,
      '',
      '— PDT Singers',
    ].join('\n')
  }

  return sendEmail(to, subject, text)
}

async function sendDirectorNotification (opts: {
  to: string, dirFirstName: string, memberName: string, event: Record<string, any>,
  statusLabel: string, reason: string | null, eventDate: string, censusUrl: string
}): Promise<string | null> {
  const { to, dirFirstName, memberName, event, statusLabel, reason, eventDate, censusUrl } = opts
  const subject = `${memberName} updated attendance: ${event.title}`

  const lines = [
    `Hi ${dirFirstName},`,
    '',
    `${memberName} has updated their attendance status for ${event.title}:`,
    '',
    `  New status: ${statusLabel}`,
    reason ? `  Reason: ${reason}` : null,
    '',
    `  📅 ${eventDate}`,
    event.location  ? `  📍 ${event.location}`              : null,
    event.start_time ? `  🕐 ${formatTime(event.start_time)}` : null,
    '',
    'View the full attendance census for this event:',
    `  ${censusUrl}`,
    '',
    '— PDT Singers system',
  ].filter(l => l !== null)

  return sendEmail(to, subject, lines.join('\n'))
}

async function sendEmail (to: string, subject: string, text: string): Promise<string | null> {
  const apiKey = Deno.env.get('RESEND_API_KEY')
  if (!apiKey) return 'RESEND_API_KEY not set'

  const res = await fetch(RESEND_URL, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM_ADDRESS, to: [to], subject, text })
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
