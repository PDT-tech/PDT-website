// PDT Singers — Notify Attendance Change
// Called directly from the attendance page after a successful batch save.
// Sends one confirmation email to the member and one summary to the director.
// Deploy: supabase functions deploy notify-attendance-change

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_URL   = 'https://api.resend.com/emails'
const FROM_ADDRESS = 'PDT Singers <noreply@pdtsingers.org>'
const SITE_URL     = Deno.env.get('SITE_URL') ?? 'https://pdtsingers.org'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Change {
  event_id: string
  status:   string
  reason:   string | null
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  const supabaseUrl    = Deno.env.get('SUPABASE_URL')            ?? ''
  const supabaseAnon   = Deno.env.get('SUPABASE_ANON_KEY')       ?? ''
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

  // Validate JWT — caller must be an authenticated member
  const userClient = createClient(supabaseUrl, supabaseAnon, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } }
  })
  const { data: { user }, error: authErr } = await userClient.auth.getUser()
  if (authErr || !user) return json({ error: 'Unauthorized' }, 401)

  const { changes } = await req.json() as { changes: Change[] }
  if (!Array.isArray(changes) || changes.length === 0) {
    return json({ error: 'no changes' }, 400)
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  // Fetch all referenced events in one query
  const eventIds = [...new Set(changes.map(c => c.event_id))]
  const { data: events, error: eventsErr } = await supabase
    .from('events')
    .select('*')
    .in('id', eventIds)
  if (eventsErr || !events) return json({ error: 'events not found' }, 404)

  const eventMap: Record<string, Record<string, any>> =
    Object.fromEntries(events.map(e => [e.id, e]))

  // Fetch member user + profile
  const [{ data: { user: memberUser } }, { data: memberProfile }] = await Promise.all([
    supabase.auth.admin.getUserById(user.id),
    supabase.from('profiles').select('full_name').eq('id', user.id).single()
  ])
  if (!memberUser) return json({ error: 'member not found' }, 404)

  const memberName      = memberProfile?.full_name ?? memberUser.email
  const memberFirstName = memberName.split(' ')[0]
  const memberEmail     = memberUser.email!
  const attendanceUrl   = `${SITE_URL}/members/attendance.html`

  const errors: string[] = []

  // Member confirmation email — always send, all changes
  const confirmErr = await sendMemberSummary({
    to: memberEmail, firstName: memberFirstName,
    changes, eventMap, attendanceUrl
  })
  if (confirmErr) errors.push(`member: ${confirmErr}`)

  // Director email — only if any non-rehearsal events changed
  const nonRehearsalChanges = changes.filter(c => {
    const evt = eventMap[c.event_id]
    return evt && evt.event_type !== 'rehearsal'
  })

  if (nonRehearsalChanges.length > 0) {
    const { data: directors } = await supabase
      .from('profiles').select('id').eq('role', 'musical_director')

    for (const dp of (directors ?? [])) {
      const { data: { user: dirUser } } = await supabase.auth.admin.getUserById(dp.id)
      if (!dirUser?.email) continue
      const { data: dirProfile } = await supabase
        .from('profiles').select('full_name').eq('id', dp.id).single()
      const dirFirstName = (dirProfile?.full_name ?? '').split(' ')[0] || 'Chris'

      const notifyErr = await sendDirectorSummary({
        to: dirUser.email, dirFirstName, memberName,
        changes: nonRehearsalChanges, eventMap,
        censusUrl: `${SITE_URL}/members/admin-attendance.html`
      })
      if (notifyErr) errors.push(`director: ${notifyErr}`)
    }
  }

  return json({ ok: errors.length === 0, errors })
})

// ── Email builders ───────────────────────────────────────────

function buildChangeLines (changes: Change[], eventMap: Record<string, Record<string, any>>): string[] {
  const lines: string[] = []
  for (const c of changes) {
    const evt = eventMap[c.event_id]
    if (!evt) continue
    const label = (
      { attending: "I'll be there", not_sure: 'Not sure yet', not_attending: "Can't make it" } as Record<string, string>
    )[c.status] ?? c.status
    lines.push(`${evt.title} — ${formatDateShort(evt.event_date)}: ${label}`)
    if (c.reason) lines.push(`(Note: ${c.reason})`)
  }
  return lines
}

async function sendMemberSummary (opts: {
  to: string, firstName: string,
  changes: Change[], eventMap: Record<string, Record<string, any>>, attendanceUrl: string
}): Promise<string | null> {
  const { to, firstName, changes, eventMap, attendanceUrl } = opts
  const changeLines = buildChangeLines(changes, eventMap)

  const text = [
    `Hi ${firstName},`,
    '',
    "Here's a summary of your updated attendance:",
    ...changeLines,
    '',
    'You can update your attendance any time at:',
    attendanceUrl,
    '',
    '— PDT Singers',
  ].join('\n')

  return sendEmail(to, 'PDT Singers: Your attendance update', text)
}

async function sendDirectorSummary (opts: {
  to: string, dirFirstName: string, memberName: string,
  changes: Change[], eventMap: Record<string, Record<string, any>>, censusUrl: string
}): Promise<string | null> {
  const { to, dirFirstName, memberName, changes, eventMap, censusUrl } = opts
  const changeLines = buildChangeLines(changes, eventMap)

  const text = [
    `Hi ${dirFirstName},`,
    '',
    `Here's what ${memberName} submitted:`,
    ...changeLines,
    '',
    'View the full attendance census:',
    `  ${censusUrl}`,
    '',
    '— PDT Singers system',
  ].join('\n')

  return sendEmail(to, `PDT Singers: Attendance update from ${memberName}`, text)
}

// ── Shared utilities ─────────────────────────────────────────

async function sendEmail (to: string, subject: string, text: string): Promise<string | null> {
  const apiKey = Deno.env.get('RESEND_API_KEY')
  if (!apiKey) return 'RESEND_API_KEY not set'

  const res = await fetch(RESEND_URL, {
    method:  'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify({ from: FROM_ADDRESS, to: [to], subject, text })
  })

  return res.ok ? null : `Resend ${res.status}: ${await res.text()}`
}

function formatDateShort (ds: string): string {
  const [y, m, d] = ds.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric'
  })
}

function json (body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
  })
}
