/* ============================================================
   PDT SINGERS — Auth Guard
   Include this script on every /members/* page.
   Redirects unauthenticated users to /login.html.
   Attaches the current user's profile to window.__PDT_USER
   for use by other scripts on the page.
   ============================================================ */

import { getSession, getProfile, signOut } from './supabase.js'

const LOGIN_URL = '/login.html'

async function initAuthGuard () {
  const session = await getSession()

  // Not logged in — redirect to login
  if (!session) {
    window.location.href = `${LOGIN_URL}?next=${encodeURIComponent(window.location.pathname)}`
    return
  }

  const profile = await getProfile()

  // Logged in but no profile (shouldn't happen, but guard against it)
  if (!profile) {
    console.error('PDT: Authenticated user has no profile record.')
    window.location.href = LOGIN_URL
    return
  }

  // Not an active member
  if (!profile.is_active) {
    window.location.href = `${LOGIN_URL}?reason=inactive`
    return
  }

  // Attach profile to window for use by page scripts
  window.__PDT_USER = profile

  // Fire event so page scripts can react to the loaded profile
  document.dispatchEvent(new CustomEvent('pdt:profile-loaded', { detail: profile }))

  // Render the user's name in any .pdt-user-name elements
  document.querySelectorAll('.pdt-user-name').forEach(el => {
    el.textContent = profile.full_name
  })

  // Show admin-only elements if user is admin
  if (profile.role === 'admin') {
    document.querySelectorAll('.pdt-admin-only').forEach(el => {
      el.style.display = 'block'
    })
  }

  // Show calendar-manager elements
  if (profile.role === 'admin' || profile.role === 'calendar_manager') {
    document.querySelectorAll('.pdt-manager-only').forEach(el => {
      el.style.display = 'block'
    })
  }

  // Wire up any logout buttons
  document.querySelectorAll('.pdt-logout-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault()
      await signOut()
    })
  })
}

// Run immediately
initAuthGuard()
