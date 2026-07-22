// Shared brand lockup for the Sonara site - the SINGLE SOURCE OF TRUTH for
// how the name is shown next to its logo, so the mark + wordmark look
// IDENTICAL and correctly aligned on every page (owner request 2026-07-21:
// the wordmark sat misaligned vs the equalizer mark, and the legal pages had
// no logo at all).
//
// Usage: put an anchor placeholder where the brand should go and load this
// script (order-independent):
//   <a data-brand href="./" aria-label="Sonara home"></a>
// Optional size: data-brand="lg" for a larger lockup.
//
// It uses its OWN scoped class names (.sbrand*) and injects its own CSS once,
// so it never collides with a page's existing .brand rules. The alignment is
// solved here in ONE place: the mark and the wordmark are vertically centered
// on a shared optical line, with the wordmark's line-box collapsed
// (line-height:1) so font descender space can't drop it below the bars.
(function () {
  function injectCss() {
    if (document.getElementById('site-brand-css')) return;
    var css = ''
      + '.sbrand{display:inline-flex;align-items:center;gap:9px;color:var(--text-strong);text-decoration:none;line-height:1;}'
      + '.sbrand:hover{color:var(--text-strong);text-decoration:none;}'
      + '.sbrand-mark{display:inline-flex;align-items:flex-end;gap:2px;height:16px;flex:0 0 auto;}'
      + '.sbrand-mark i{width:3px;border-radius:2px;background:var(--accent);display:block;}'
      + '.sbrand-mark i:nth-child(1){height:8px;}'
      + '.sbrand-mark i:nth-child(2){height:16px;}'
      + '.sbrand-mark i:nth-child(3){height:11px;}'
      + '.sbrand-mark i:nth-child(4){height:14px;}'
      + '.sbrand-mark i:nth-child(5){height:7px;}'
      // The wordmark: display font, uppercase, line-box collapsed and nudged a
      // hair down so the uppercase glyphs' optical centre lines up with the
      // bars (Archivo Black sits high in its line box).
      + '.sbrand-word{font-family:var(--font-display);text-transform:uppercase;font-weight:400;'
      + 'font-size:17px;line-height:1;letter-spacing:0.005em;transform:translateY(0.5px);display:inline-block;}'
      + '.sbrand--lg .sbrand-mark{height:22px;gap:3px;}'
      + '.sbrand--lg .sbrand-mark i{width:4px;}'
      + '.sbrand--lg .sbrand-word{font-size:24px;}';
    var s = document.createElement('style');
    s.id = 'site-brand-css';
    s.textContent = css;
    document.head.appendChild(s);
  }

  function render(el) {
    var size = el.getAttribute('data-brand');
    el.classList.add('sbrand');
    if (size === 'lg') el.classList.add('sbrand--lg');
    if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', 'Sonara home');
    el.innerHTML =
      '<span class="sbrand-mark" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>'
      + '<span class="sbrand-word">Sonara</span>';
  }

  function init() {
    var nodes = document.querySelectorAll('[data-brand]');
    if (!nodes.length) return;
    injectCss();
    nodes.forEach(render);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  window.SonaraBrand = { render: init };
})();
