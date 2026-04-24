;(function () {
  const hamburger = document.getElementById('nav-hamburger')
  const navLinks  = document.querySelector('.nav-links')
  if (!hamburger || !navLinks) return
  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('is-open')
    navLinks.classList.toggle('is-open', open)
    hamburger.setAttribute('aria-expanded', open)
  })
})()
