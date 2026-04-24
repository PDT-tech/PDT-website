// PDT Singers — Member Attendance Page
// Status dropdowns replace radio button groups per pdt-decisions.md 2026-04-21.

import '../../js/auth-guard.js'
import { supabase } from '../../js/supabase.js'

const today = new Date().toISOString().split('T')[0]

// DB-persisted state, keyed by eventId
const attMap = {}

// Per-cluster mutable state
const clusters = {
  singout:   { events: [], selectedId: null, startStatus: '', startReason: '' },
  rehearsal: { events: [], selectedId: null, startStatus: 'yes', startReason: '' },
}

let memberId

// Map between DB values and dropdown values
const DB_TO_DROP = { attending: 'yes', not_sure: 'maybe', not_attending: 'no' }
const DROP_TO_DB = { yes: 'attending', maybe: 'not_sure', no: 'not_attending' }

function init() {
  const profile = window.__PDT_USER
  if (!profile) {
    document.addEventListener('pdt:profile-loaded', init, { once: true })
    return
  }
  memberId = profile.id
  loadData()
}

async function loadData() {
  const [eventsRes, attRes] = await Promise.all([
    supabase
      .from('events')
      .select('id, title, event_type, event_date, start_time, end_time, call_time, location, address, dress_code, parking_notes, notes')
      .gte('event_date', today)
      .order('event_date'),
    supabase
      .from('event_attendance')
      .select('event_id, status, reason')
      .eq('member_id', memberId)
  ])

  if (eventsRes.error) {
    showLoadError('singout')
    showLoadError('rehearsal')
    return
  }

  ;(attRes.data ?? []).forEach(a => {
    attMap[a.event_id] = { status: a.status, reason: a.reason ?? '' }
  })

  const events = eventsRes.data ?? []
  clusters.singout.events   = events.filter(e => e.event_type !== 'rehearsal')
  clusters.rehearsal.events = events.filter(e => e.event_type === 'rehearsal')

  setupCluster('singout')
  setupCluster('rehearsal')

  window.addEventListener('beforeunload', e => {
    if (isDirty('singout') || isDirty('rehearsal')) {
      e.preventDefault()
      e.returnValue = ''
    }
  })
}

function setupCluster(key) {
  const { events }  = clusters[key]
  const loadingEl   = document.getElementById(`${key}-loading`)
  const emptyEl     = document.getElementById(`${key}-empty`)
  const controlsEl  = document.getElementById(`${key}-controls`)
  const selectEl    = document.getElementById(`${key}-select`)
  const statusSel   = document.getElementById(`${key}-status`)
  const reasonInput = document.getElementById(`${key}-reason`)

  loadingEl.hidden = true

  if (!events.length) {
    emptyEl.hidden    = false
    controlsEl.hidden = true
    return
  }

  emptyEl.hidden    = true
  controlsEl.hidden = false

  selectEl.innerHTML = events.map(e =>
    `<option value="${e.id}">${escHtml(e.title)} — ${formatDateShort(e.event_date)}</option>`
  ).join('')

  selectEl.addEventListener('change', () => {
    const newId = selectEl.value
    if (isDirty(key)) {
      if (!confirm('You have unsaved changes — leave anyway?')) {
        selectEl.value = clusters[key].selectedId
        return
      }
    }
    loadEvent(key, newId)
  })

  statusSel.addEventListener('change', () => onStatusChange(key))
  reasonInput.addEventListener('input', () => updateSaveBtn(key))
  document.getElementById(`${key}-save-btn`).addEventListener('click', () => saveCluster(key))

  loadEvent(key, events[0].id)
}

function loadEvent(key, eventId) {
  const c      = clusters[key]
  c.selectedId = eventId

  const saved   = attMap[eventId]
  const dropVal = saved ? (DB_TO_DROP[saved.status] ?? 'yes') : (key === 'rehearsal' ? 'yes' : '')
  const reason  = saved?.reason ?? ''

  c.startStatus = dropVal
  c.startReason = reason

  if (key === 'singout') {
    renderDetails(c.events.find(e => e.id === eventId))
  }

  document.getElementById(`${key}-status`).value = dropVal

  const reasonInput = document.getElementById(`${key}-reason`)
  reasonInput.value = reason
  document.getElementById(`${key}-reason-wrap`).hidden = !needsReason(key, dropVal)

  const saveBtn = document.getElementById(`${key}-save-btn`)
  saveBtn.textContent = 'Save'
  saveBtn.disabled    = !isDirty(key)
  document.getElementById(`${key}-save-status`).hidden = true
  document.getElementById(`${key}-save-error`).hidden  = true
}

function needsReason(key, dropVal) {
  return key === 'rehearsal' ? dropVal === 'no' : (dropVal === 'no' || dropVal === 'maybe')
}

function onStatusChange(key) {
  const dropVal     = getCurrentDropVal(key)
  const reasonWrap  = document.getElementById(`${key}-reason-wrap`)
  const reasonInput = document.getElementById(`${key}-reason`)

  reasonWrap.hidden = !needsReason(key, dropVal)
  if (!needsReason(key, dropVal)) reasonInput.value = ''

  updateSaveBtn(key)
}

function getCurrentDropVal(key) {
  return document.getElementById(`${key}-status`).value
}

function getCurrentReason(key) {
  return document.getElementById(`${key}-reason`).value.trim()
}

function isDirty(key) {
  const c = clusters[key]
  if (!c.selectedId) return false
  return getCurrentDropVal(key) !== c.startStatus ||
         getCurrentReason(key) !== (c.startReason ?? '').trim()
}

function updateSaveBtn(key) {
  const dirty = isDirty(key)
  const valid = key === 'rehearsal' || getCurrentDropVal(key) !== ''
  document.getElementById(`${key}-save-btn`).disabled = !dirty || !valid
}

async function saveCluster(key) {
  const c       = clusters[key]
  const eventId = c.selectedId
  if (!eventId) return

  const dropVal = getCurrentDropVal(key)
  if (key === 'singout' && !dropVal) return

  const status     = DROP_TO_DB[dropVal] || 'attending'
  const reason     = getCurrentReason(key) || null
  const saveBtn    = document.getElementById(`${key}-save-btn`)
  const saveStatus = document.getElementById(`${key}-save-status`)
  const saveError  = document.getElementById(`${key}-save-error`)

  saveBtn.disabled    = true
  saveBtn.textContent = 'Saving…'
  saveStatus.hidden   = true
  saveError.hidden    = true

  const { error } = await supabase
    .from('event_attendance')
    .upsert(
      { event_id: eventId, member_id: memberId, status, reason, updated_at: new Date().toISOString() },
      { onConflict: 'event_id,member_id' }
    )

  if (error) {
    saveError.textContent = 'Something went wrong. Please try again.'
    saveError.hidden      = false
    saveBtn.textContent   = 'Save'
    saveBtn.disabled      = false
    return
  }

  attMap[eventId]   = { status, reason: reason ?? '' }
  c.startStatus     = dropVal
  c.startReason     = reason ?? ''

  // Fire-and-forget — notification failure must not block the save confirmation
  supabase.functions.invoke('notify-attendance-change', {
    body: { changes: [{ event_id: eventId, status, reason }] }
  }).catch(() => {})

  saveBtn.textContent = 'Save'
  updateSaveBtn(key)
  saveStatus.hidden = false
  clearTimeout(saveStatus._t)
  saveStatus._t = setTimeout(() => { saveStatus.hidden = true }, 3000)
}

// ── Helpers ──────────────────────────────────────────────────

function renderDetails(evt) {
  const el = document.getElementById('singout-details')
  if (!evt) { el.innerHTML = ''; return }

  const mapsUrl = evt.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(evt.address)}`
    : null

  el.innerHTML = [
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
      ? `<div class="att-detail-row att-detail-indent">Start: ${formatTime(evt.start_time)}</div>`
      : '',
    evt.dress_code
      ? `<div class="att-detail-row">👔 Dress code: ${escHtml(evt.dress_code)}</div>`
      : '',
    evt.parking_notes
      ? `<div class="att-detail-row">🅿️ Parking: ${escHtml(evt.parking_notes)}</div>`
      : '',
    evt.notes
      ? `<div class="att-detail-row">📝 ${escHtml(evt.notes)}</div>`
      : '',
  ].filter(Boolean).join('')
}

function showLoadError(key) {
  document.getElementById(`${key}-loading`).hidden  = true
  const emptyEl = document.getElementById(`${key}-empty`)
  emptyEl.textContent = 'Failed to load events.'
  emptyEl.hidden      = false
}

function formatDateShort(ds) {
  const [y, m, d] = ds.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric'
  })
}

function formatDateLong(ds) {
  const [y, m, d] = ds.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  })
}

function formatTime(ts) {
  if (!ts) return ''
  const [h, m] = ts.split(':').map(Number)
  return new Date(0, 0, 0, h, m).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit'
  })
}

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

init()
