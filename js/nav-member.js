;(function () {
  const hamburger = document.getElementById('nav-hamburger')
  const navLinks  = document.querySelector('.member-nav-links')
  const navRight  = document.querySelector('.member-nav-right')
  hamburger?.addEventListener('click', () => {
    const open = hamburger.classList.toggle('is-open')
    navLinks.classList.toggle('is-open', open)
    navRight.classList.toggle('is-open', open)
    hamburger.setAttribute('aria-expanded', open)
  })
})()
