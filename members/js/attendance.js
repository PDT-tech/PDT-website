// PDT Singers — Member Attendance Page
// Selections are local until the page-level Save button is clicked.

import '../../js/auth-guard.js'
import { supabase } from '../../js/supabase.js'

const today = new Date().toISOString().split('T')[0]

// Page-level save state (populated in loadData)
const baseline = {}  // eventId → {status, reason} | null  (last persisted)
const current  = {}  // eventId → {status, reason} | null  (current UI)
let memberId

function init () {
  const profile = window.__PDT_USER
  if (!profile) {
    document.addEventListener('pdt:profile-loaded', init, { once: true })
    return
  }
  memberId = profile.id
  loadData()
}

async function loadData () {
  const [eventsRes, attRes] = await Promise.all([
    supabase
      .from('events')
      .select('id, title, event_type, event_date, start_time, end_time, call_time, location, address, dress_code, parking_notes, notes')
      .gte('event_date', today)
      .order('event_date'),
    supabase
      .from('event_attendance')
      .select('id, event_id, status, reason')
      .eq('member_id', memberId)
  ])

  if (eventsRes.error) {
    showError('rehearsal-list', 'Failed to load events.')
    showError('event-list',     'Failed to load events.')
    return
  }

  const events = eventsRes.data ?? []
  const attMap = {}
  ;(attRes.data ?? []).forEach(a => { attMap[a.event_id] = a })

  events.forEach(e => {
    const att = attMap[e.id]
    const val = att ? { status: att.status, reason: att.reason ?? '' } : null
    baseline[e.id] = val
    current[e.id]  = val ? { ...val } : null
  })

  const rehearsals = events.filter(e => e.event_type === 'rehearsal')
  const singouts   = events.filter(e => e.event_type !== 'rehearsal')

  renderRehearsals(rehearsals, attMap)
  renderSingouts(singouts, attMap)

  document.getElementById('att-save-btn').addEventListener('click', savePage)

  const targetId = new URLSearchParams(window.location.search).get('event')
  if (targetId) {
    setTimeout(() => {
      const el = document.getElementById(`ev-${targetId}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.classList.add('att-highlight')
      }
    }, 150)
  }
}

// ── Rehearsals column ────────────────────────────────────────

function renderRehearsals (rehearsals, attMap) {
  const container = document.getElementById('rehearsal-list')
  if (!rehearsals.length) {
    container.innerHTML = '<p class="att-empty">No upcoming rehearsals.</p>'
    return
  }

  container.innerHTML = rehearsals.map(r => {
    const att   = attMap[r.id]
    const isOut = att?.status === 'not_attending'
    return `
      <div class="att-rehearsal-row" id="ev-${r.id}" data-id="${r.id}">
        <div class="att-rehearsal-date">${formatDateShort(r.event_date)}</div>
        <div class="att-toggle-row">
          <label class="att-toggle ${!isOut ? 'att-toggle-on' : ''}">
            <input type="radio" name="r-${r.id}" value="attending" ${!isOut ? 'checked' : ''}>
            I'll be there
          </label>
          <label class="att-toggle ${isOut ? 'att-toggle-on' : ''}">
            <input type="radio" name="r-${r.id}" value="not_attending" ${isOut ? 'checked' : ''}>
            I won't be there
          </label>
        </div>
        <div class="att-reason-wrap" ${isOut ? '' : 'hidden'}>
          <input type="text" class="att-reason form-input"
                 placeholder="Reason (optional)"
                 value="${escHtml(att?.reason ?? '')}">
        </div>
      </div>`
  }).join('')

  rehearsals.forEach(r => {
    const row         = document.getElementById(`ev-${r.id}`)
    const radios      = row.querySelectorAll('input[type=radio]')
    const reasonWrap  = row.querySelector('.att-reason-wrap')
    const reasonInput = row.querySelector('.att-reason')

    radios.forEach(radio => {
      radio.addEventListener('change', () => {
        const status = radio.value
        reasonWrap.hidden = status !== 'not_attending'
        row.querySelectorAll('.att-toggle').forEach(l => {
          l.classList.toggle('att-toggle-on', l.querySelector('input').value === status)
        })
        const reason = status !== 'not_attending' ? '' : (current[r.id]?.reason ?? '')
        if (status !== 'not_attending') reasonInput.value = ''
        current[r.id] = { status, reason }
        updateSaveButton()
      })
    })

    reasonInput.addEventListener('input', () => {
      if (!current[r.id]) current[r.id] = { status: 'not_attending', reason: '' }
      current[r.id].reason = reasonInput.value.trim()
      updateSaveButton()
    })
  })
}

// ── Sing-outs & events column ────────────────────────────────

function renderSingouts (events, attMap) {
  const container = document.getElementById('event-list')
  if (!events.length) {
    container.innerHTML = '<p class="att-empty">No upcoming sing-outs or events.</p>'
    return
  }

  container.innerHTML = events.map(evt => {
    const att    = attMap[evt.id]
    const status = att?.status ?? ''
    const mapsUrl = evt.address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(evt.address)}`
      : null

    const details = [
      `<div class="att-detail-row">📅 ${formatDateLong(evt.event_date)}</div>`,
      evt.location
        ? `<div class="att-detail-row">📍 ${mapsUrl
            ? `<a href="${mapsUrl}" target="_blank" rel="noopener">${escHtml(evt.location)}</a>`
            : escHtml(evt.location)}</div>`
        : '',
      evt.call_time
        ? `<div class="att-detail-row">🕐 Call time: ${formatTime(evt.call_time)}</div>`
        : '',
      evt.start_time
        ? `<div class="att-detail-row att-detail-indent">Start time: ${formatTime(evt.start_time)}</div>`
        : '',
      evt.dress_code
        ? `<div class="att-detail-row">👔 Dress code: ${escHtml(evt.dress_code)}</div>`
        : '',
      evt.parking_notes
        ? `<div class="att-detail-row">🅿️ Parking: ${escHtml(evt.parking_notes)}</div>`
        : '',
      evt.notes
        ? `<div class="att-detail-row">📝 Notes: ${escHtml(evt.notes)}</div>`
        : '',
    ].filter(Boolean).join('')

    return `
      <div class="att-event-card" id="ev-${evt.id}" data-id="${evt.id}">
        <div class="att-event-header">
          <div class="att-event-title">${escHtml(evt.title)}</div>
          <span class="att-type-badge">${escHtml(formatEventType(evt.event_type))}</span>
        </div>
        <div class="att-event-details">${details}</div>
        <div class="att-radio-group">
          ${radioOpt(evt.id, 'attending',     "I'll be there",  status)}
          ${radioOpt(evt.id, 'not_sure',      'Not sure yet',   status)}
          ${radioOpt(evt.id, 'not_attending', "I can't make it", status)}
        </div>
        <div class="att-reason-wrap" ${status === 'not_attending' ? '' : 'hidden'}>
          <input type="text" class="att-reason form-input"
                 placeholder="Reason (optional)"
                 value="${escHtml(att?.reason ?? '')}">
        </div>
      </div>`
  }).join('')

  events.forEach(evt => {
    const card        = document.getElementById(`ev-${evt.id}`)
    const radios      = card.querySelectorAll('input[type=radio]')
    const reasonWrap  = card.querySelector('.att-reason-wrap')
    const reasonInput = card.querySelector('.att-reason')

    radios.forEach(radio => {
      radio.addEventListener('change', () => {
        const status = radio.value
        reasonWrap.hidden = status !== 'not_attending'
        if (status !== 'not_attending') reasonInput.value = ''
        const reason = status !== 'not_attending' ? '' : (current[evt.id]?.reason ?? '')
        current[evt.id] = { status, reason }
        updateSaveButton()
      })
    })

    reasonInput.addEventListener('input', () => {
      if (!current[evt.id]) current[evt.id] = { status: 'not_attending', reason: '' }
      current[evt.id].reason = reasonInput.value.trim()
      updateSaveButton()
    })
  })
}

// ── Page-level save ──────────────────────────────────────────

function getChanges () {
  return Object.entries(current)
    .filter(([id, c]) => {
      const b = baseline[id]
      if (!b && !c) return false
      if (!b &&  c) return true
      if ( b && !c) return false
      const bReason = (b.reason ?? '').trim()
      const cReason = (c.reason ?? '').trim()
      return b.status !== c.status || bReason !== cReason
    })
    .map(([id, c]) => ({
      event_id: id,
      status:   c.status,
      reason:   (c.reason ?? '').trim() || null
    }))
}

function updateSaveButton () {
  document.getElementById('att-save-btn').disabled = getChanges().length === 0
}

async function savePage () {
  const changes = getChanges()
  if (!changes.length) return

  const saveBtn    = document.getElementById('att-save-btn')
  const saveStatus = document.getElementById('att-save-status')
  const saveError  = document.getElementById('att-save-error')

  saveBtn.disabled    = true
  saveBtn.textContent = 'Saving…'
  saveStatus.hidden   = true
  saveError.hidden    = true

  const upsertRows = changes.map(c => ({
    event_id:   c.event_id,
    member_id:  memberId,
    status:     c.status,
    reason:     c.reason,
    updated_at: new Date().toISOString()
  }))

  const { error } = await supabase
    .from('event_attendance')
    .upsert(upsertRows, { onConflict: 'event_id,member_id' })

  if (error) {
    saveError.textContent = 'Something went wrong. Please try again.'
    saveError.hidden      = false
    saveBtn.textContent   = 'Save'
    saveBtn.disabled      = false
    return
  }

  // Fire-and-forget — notification failure must not block the save confirmation
  supabase.functions.invoke('notify-attendance-change', {
    body: { changes }
  }).catch(() => {})

  changes.forEach(c => {
    baseline[c.event_id] = { status: c.status, reason: c.reason ?? '' }
    current[c.event_id]  = { status: c.status, reason: c.reason ?? '' }
  })

  saveBtn.textContent = 'Save'
  updateSaveButton()
  saveStatus.hidden = false
  clearTimeout(saveStatus._t)
  saveStatus._t = setTimeout(() => { saveStatus.hidden = true }, 3000)
}

// ── Helpers ──────────────────────────────────────────────────

function showError (id, msg) {
  document.getElementById(id).innerHTML = `<p class="att-error">${msg}</p>`
}

function radioOpt (eventId, value, label, selected) {
  return `<label class="att-radio-label">
    <input type="radio" name="e-${eventId}" value="${value}" ${selected === value ? 'checked' : ''}>
    ${label}
  </label>`
}

function formatDateShort (ds) {
  const [y, m, d] = ds.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric'
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

function formatEventType (type) {
  return ({ rehearsal: 'Rehearsal', singout: 'Sing-out', sing_out: 'Sing-out',
            performance: 'Performance', social: 'Social' })[type] ?? type
}

function escHtml (str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

init()
