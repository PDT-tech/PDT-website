/* ============================================================
   PDT SINGERS — Public Photo Carousel
   Plain script (not a module). Reads window.PDT_CAROUSEL_CONFIG.

   Usage: define window.PDT_CAROUSEL_CONFIG before this script loads:
     window.PDT_CAROUSEL_CONFIG = {
       containerId: 'carousel',
       folderEnvKey: 'GOOGLE_DRIVE_CAROUSEL_FOLDER_ID',
       placeholderSrc: '/assets/images/PDT_logo_color_2.jpeg'
     }
   ============================================================ */

;(function () {
  document.addEventListener('DOMContentLoaded', async () => {
    const config = window.PDT_CAROUSEL_CONFIG
    if (!config) return

    const container = document.getElementById(config.containerId)
    if (!container) return

    // Placeholder is already rendered in the HTML — visible immediately.
    // Fetch the carousel file list (public — no auth required).
    let files = []
    try {
      const res = await fetch('/.netlify/functions/drive-music?action=carousel-list')
      if (res.ok) files = await res.json()
    } catch {}

    if (!files.length) return  // leave placeholder; stop silently

    // Fisher-Yates shuffle
    for (let i = files.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [files[i], files[j]] = [files[j], files[i]]
    }

    let currentIdx = 0
    let paused     = false

    function photoUrl (file) {
      return `/api/photo?fileId=${encodeURIComponent(file.fileId)}&filename=${encodeURIComponent(file.filename)}`
    }

    function activeImg () {
      return container.querySelector('.carousel-active')
    }

    // Crossfade to a new photo. Returns a promise that resolves when the
    // new image has loaded and the transition has started.
    function showPhoto (idx) {
      return new Promise(resolve => {
        const newEl    = document.createElement('img')
        newEl.className = 'carousel-img'
        newEl.alt       = 'Portland DayTime Singers'
        container.appendChild(newEl)

        newEl.onload = () => {
          // Force reflow so the opacity transition fires correctly
          newEl.getBoundingClientRect()

          const old = activeImg()
          newEl.classList.add('carousel-active')

          if (old) {
            old.classList.remove('carousel-active')
            // Remove old image after the CSS transition completes (0.8s + buffer)
            setTimeout(() => { if (container.contains(old)) container.removeChild(old) }, 950)
          }

          currentIdx = idx
          resolve()

          // Preload the next image while the current one is displayed
          const nextIdx    = (idx + 1) % files.length
          const preloadEl  = new Image()
          preloadEl.src    = photoUrl(files[nextIdx])
        }

        newEl.onerror = () => {
          if (container.contains(newEl)) container.removeChild(newEl)
          resolve()
        }

        // Set src after appending so the load event fires reliably
        newEl.src = photoUrl(files[idx])
      })
    }

    // Show first photo (crossfades from placeholder)
    await showPhoto(0)

    // Advance every 5 seconds
    setInterval(() => {
      if (!paused) {
        const nextIdx = (currentIdx + 1) % files.length
        showPhoto(nextIdx)
      }
    }, 5000)

    // Pause on hover, resume on leave
    container.addEventListener('mouseenter', () => { paused = true })
    container.addEventListener('mouseleave', () => { paused = false })
  })
})()
