// PDT Singers — Member Attendance Page
// Dropdown cluster UI: sing-outs (left) and rehearsals (right).
// Save/notify logic unchanged from batch-save design; only DOM and
// event handling rewritten per pdt-decisions.md 2026-04-21.

import '../../js/auth-guard.js'
import { supabase } from '../../js/supabase.js'

const today = new Date().toISOString().split('T')[0]

// DB-persisted state, keyed by eventId
const attMap = {}  // eventId → { status, reason } | undefined

// Per-cluster mutable state
const clusters = {
  singout:   { events: [], selectedId: null, startStatus: 'attending', startReason: '' },
  rehearsal: { events: [], selectedId: null, startStatus: 'attending', startReason: '' },
}

let memberId

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

  reasonInput.addEventListener('input', () => updateSaveBtn(key))
  document.getElementById(`${key}-save-btn`).addEventListener('click', () => saveCluster(key))

  loadEvent(key, events[0].id)
}

function loadEvent(key, eventId) {
  const c      = clusters[key]
  c.selectedId = eventId

  const saved  = attMap[eventId]
  const status = saved?.status ?? 'attending'
  const reason = saved?.reason ?? ''

  // null when no prior record — any selection counts as a change
  c.startStatus = saved ? saved.status : null
  c.startReason = reason

  if (key === 'singout') {
    renderDetails(c.events.find(e => e.id === eventId))
  }

  renderRadios(key, status)

  const reasonInput = document.getElementById(`${key}-reason`)
  reasonInput.value = reason
  document.getElementById(`${key}-reason-wrap`).hidden = status === 'attending'

  const saveBtn = document.getElementById(`${key}-save-btn`)
  saveBtn.textContent = 'Save'
  saveBtn.disabled    = !isDirty(key)
  document.getElementById(`${key}-save-status`).hidden = true
  document.getElementById(`${key}-save-error`).hidden  = true
}

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

const STATUS_OPTIONS = {
  singout: [
    { value: 'attending',     label: "I'll be there"    },
    { value: 'not_sure',      label: "I'm not sure"     },
    { value: 'not_attending', label: "I can't be there" },
  ],
  rehearsal: [
    { value: 'attending',     label: "I'll be there"    },
    { value: 'not_attending', label: "I won't be there" },
  ],
}

function renderRadios(key, selectedStatus) {
  const container = document.getElementById(`${key}-radios`)
  container.innerHTML = STATUS_OPTIONS[key].map(opt =>
    `<label class="att-toggle${opt.value === selectedStatus ? ' att-toggle-on' : ''}">
      <input type="radio" name="${key}-status" value="${opt.value}"${opt.value === selectedStatus ? ' checked' : ''}>
      ${opt.label}
    </label>`
  ).join('')

  container.querySelectorAll('input[type=radio]').forEach(radio => {
    radio.addEventListener('change', () => onRadioChange(key))
  })
}

function onRadioChange(key) {
  const status      = getCurrentStatus(key)
  const reasonWrap  = document.getElementById(`${key}-reason-wrap`)
  const reasonInput = document.getElementById(`${key}-reason`)

  reasonWrap.hidden = status === 'attending'
  if (status === 'attending') reasonInput.value = ''

  document.getElementById(`${key}-radios`).querySelectorAll('.att-toggle').forEach(label => {
    label.classList.toggle('att-toggle-on', label.querySelector('input').value === status)
  })

  updateSaveBtn(key)
}

function getCurrentStatus(key) {
  return document.querySelector(`input[name="${key}-status"]:checked`)?.value ?? 'attending'
}

function getCurrentReason(key) {
  return document.getElementById(`${key}-reason`).value.trim()
}

function isDirty(key) {
  const c = clusters[key]
  if (!c.selectedId) return false
  if (c.startStatus === null) return true  // no prior record — any selection is a change
  return getCurrentStatus(key) !== c.startStatus ||
         getCurrentReason(key) !== (c.startReason ?? '').trim()
}

function updateSaveBtn(key) {
  document.getElementById(`${key}-save-btn`).disabled = !isDirty(key)
}

async function saveCluster(key) {
  const c       = clusters[key]
  const eventId = c.selectedId
  if (!eventId) return

  const status     = getCurrentStatus(key)
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
  c.startStatus     = status
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
