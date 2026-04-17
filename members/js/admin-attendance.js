// PDT Singers — Admin Attendance Census Page
// Requires admin or musical_director role. Redirects others to /members/.
// Shows per-event attendance grouped by status, with ?event= deep-link support.

import '../../js/auth-guard.js'
import { supabase } from '../../js/supabase.js'

const today  = new Date().toISOString().split('T')[0]
const in30   = new Date(Date.now() + 30 * 864e5).toISOString().split('T')[0]

let allEvents   = []
let allProfiles = []

function checkAccess () {
  const profile = window.__PDT_USER
  if (!profile) {
    document.addEventListener('pdt:profile-loaded', checkAccess, { once: true })
    return
  }
  if (profile.role !== 'admin' && profile.role !== 'musical_director') {
    window.location.href = '/members/'
    return
  }
  init()
}

async function init () {
  const [eventsRes, profilesRes] = await Promise.all([
    supabase
      .from('events')
      .select('id, title, event_type, event_date, start_time, location')
      .gte('event_date', today)
      .neq('event_type', 'rehearsal')
      .order('event_date'),
    supabase
      .from('profiles')
      .select('id, full_name')
      .eq('is_active', true)
      .order('full_name')
  ])

  allEvents   = eventsRes.data   ?? []
  allProfiles = profilesRes.data ?? []

  populateDropdown()
  bindFilters()

  const targetId = new URLSearchParams(window.location.search).get('event')
  if (targetId) {
    const select = document.getElementById('event-filter')
    if (select.querySelector(`option[value="${targetId}"]`)) {
      select.value = targetId
    }
  }

  await renderReport()

  if (targetId) {
    setTimeout(() => {
      const el = document.getElementById(`census-${targetId}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        el.classList.add('census-highlight')
      }
    }, 150)
  }
}

function populateDropdown () {
  const select       = document.getElementById('event-filter')
  const thirtyDayOnly = document.getElementById('thirty-day-filter').checked
  const current      = select.value

  const visible = thirtyDayOnly ? allEvents.filter(e => e.event_date <= in30) : allEvents

  select.innerHTML = '<option value="all">All upcoming events</option>'
  visible.forEach(e => {
    const opt = document.createElement('option')
    opt.value       = e.id
    opt.textContent = `${e.title} — ${formatDateShort(e.event_date)}`
    select.appendChild(opt)
  })

  if (current && select.querySelector(`option[value="${current}"]`)) {
    select.value = current
  }
}

function bindFilters () {
  document.getElementById('thirty-day-filter').addEventListener('change', () => {
    populateDropdown()
    renderReport()
  })
  document.getElementById('event-filter').addEventListener('change', renderReport)
}

async function renderReport () {
  const report        = document.getElementById('census-report')
  const selectedId    = document.getElementById('event-filter').value
  const thirtyDayOnly = document.getElementById('thirty-day-filter').checked

  let toShow = thirtyDayOnly ? allEvents.filter(e => e.event_date <= in30) : allEvents
  if (selectedId !== 'all') toShow = toShow.filter(e => e.id === selectedId)

  if (!toShow.length) {
    report.innerHTML = '<p class="att-empty">No events match the current filter.</p>'
    return
  }

  report.innerHTML = '<div class="att-loading">Loading attendance data…</div>'

  const sections = await Promise.all(toShow.map(async evt => {
    const { data: rows } = await supabase
      .from('event_attendance')
      .select('member_id, status, reason')
      .eq('event_id', evt.id)

    const attMap = {}
    ;(rows ?? []).forEach(r => { attMap[r.member_id] = r })

    const attending  = allProfiles.filter(p => attMap[p.id]?.status === 'attending')
    const notSure    = allProfiles.filter(p => attMap[p.id]?.status === 'not_sure')
    const cantMake   = allProfiles.filter(p => attMap[p.id]?.status === 'not_attending')
    const noResponse = allProfiles.filter(p => !attMap[p.id])

    const nameList = (profiles, showReason = false) => {
      if (!profiles.length) return '<span class="census-name census-none">—</span>'
      return profiles.map(p => {
        const reason = showReason && attMap[p.id]?.reason
          ? ` (${escHtml(attMap[p.id].reason)})`
          : ''
        return `<span class="census-name">${escHtml(p.full_name)}${reason}</span>`
      }).join('')
    }

    const meta = [
      formatDateLong(evt.event_date),
      evt.location  ? escHtml(evt.location)           : null,
      evt.start_time ? formatTime(evt.start_time)     : null,
    ].filter(Boolean).join(' &middot; ')

    return `
      <div class="census-section" id="census-${evt.id}">
        <div class="census-section-header">
          <div class="census-event-title">${escHtml(evt.title)}</div>
          <div class="census-event-meta">${meta}</div>
        </div>
        <div class="census-groups">
          <div class="census-group">
            <div class="census-group-label">✅ Attending (${attending.length})</div>
            <div class="census-names">${nameList(attending)}</div>
          </div>
          <div class="census-group">
            <div class="census-group-label">❓ Not sure yet (${notSure.length})</div>
            <div class="census-names">${nameList(notSure)}</div>
          </div>
          <div class="census-group">
            <div class="census-group-label">❌ Can't make it (${cantMake.length})</div>
            <div class="census-names">${nameList(cantMake, true)}</div>
          </div>
          <div class="census-group">
            <div class="census-group-label">⬜ No response (${noResponse.length})</div>
            <div class="census-names">${nameList(noResponse)}</div>
          </div>
        </div>
      </div>`
  }))

  report.innerHTML = sections.join('')
}

function formatDateShort (ds) {
  const [y, m, d] = ds.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}

function formatDateLong (ds) {
  const [y, m, d] = ds.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  })
}

function formatTime (ts) {
  if (!ts) return ''
  const [h, m] = ts.split(':').map(Number)
  return new Date(0, 0, 0, h, m).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit'
  })
}

function escHtml (str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

checkAccess()
