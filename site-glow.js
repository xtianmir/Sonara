// Shared "glow download button" enhancement - the SINGLE SOURCE for the
// glossy Download button so it looks + behaves the SAME wherever it appears on
// the site (owner request 2026-07-21). Any button marked data-glow gets:
//   • a SHEEN: one clean band of light that crosses the button quickly. It
//     fires when the pointer arrives, and on its own every IDLE_MS so the
//     button still catches the eye of someone who never hovers it;
//   • a contour GLOW on hover that FADES IN smoothly (own layer, never
//     animated, so the transition is clean - no abrupt pop);
//   • a cursor-following highlight on the surface.
// The sheen replaced a slow DOUBLE GLEAM that ran on an endless 7 s loop
// (owner 2026-07-23): he picked this shape for the player's About buttons and
// asked for the same one here, so the site and the app now move alike. One
// band beats two - two read as a shop-window animation, one reads as light.
// The old loop also animated forever whether or not anyone was looking.
// GPU-only (transform/opacity), decorative layers are pointer-events:none and
// scoped so they never touch a page's own button CSS beyond the opt-in class.
//
// Usage: add `data-glow` to the primary download button and load this script.
(function () {
  var SWEEP_MS = 620;   // how long one crossing takes
  var IDLE_MS = 7000;   // how often an untouched button sweeps by itself
  // Where the band waits and where it ends up - both fully outside the button,
  // so it is invisible except while crossing. Percentages are of the BAND's own
  // width (28% of the button), which is why the numbers look large. These are
  // the EXACT numbers from the preview the owner approved; his first look at
  // the shipped version read "narrower and faster than what I picked", which
  // was the band's fault, not the travel's - see the gradient below.
  var REST = 'translateX(-260%) skewX(-18deg)';
  var PAST = 'translateX(520%) skewX(-18deg)';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function injectCss() {
    if (document.getElementById('site-glow-css')) return;
    var css = ''
      + '.glow-btn{position:relative;isolation:isolate;}'
      // Hover glow: a contour box-shadow that fades in SMOOTHLY (own layer,
      // never animated). Hugs the rounded edge (no big offset cloud).
      + '.glow-btn::before{content:"";position:absolute;inset:0;border-radius:inherit;z-index:-1;pointer-events:none;'
      + 'box-shadow:0 0 22px 2px rgba(34,211,161,0.85),0 0 44px 9px rgba(34,211,161,0.45);'
      + 'opacity:0;transition:opacity 0.5s ease;}'
      + '.glow-btn:hover::before{opacity:1;}'
      // Clip layer holds the shine sweep + the cursor highlight.
      + '.glow-clip{position:absolute;inset:0;border-radius:inherit;overflow:hidden;pointer-events:none;z-index:1;}'
      + '.glow-clip::after{content:"";position:absolute;width:150px;height:150px;left:var(--gx,50%);top:var(--gy,50%);'
      + 'transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,0.5),transparent 60%);'
      + 'opacity:0;transition:opacity 0.2s ease;}'
      + '.glow-btn:hover .glow-clip::after{opacity:1;}'
      // The sheen: a single band parked off the left edge. It has no animation
      // of its own - sweep() drives it - so nothing moves at rest.
      // The gradient has a PLATEAU (flat from 22% to 78%, soft only at the two
      // ends). A plain transparent->white->transparent ramp peaks at a single
      // line, so the eye tracks that line and the band reads far thinner and
      // quicker than the 28% it actually occupies - exactly what the owner saw
      // versus the preview he approved, where the band was a flat fill.
      + '.glow-shine{position:absolute;top:-30%;bottom:-30%;left:-40%;width:28%;'
      + 'background:linear-gradient(90deg,transparent,rgba(255,255,255,0.5) 22%,'
      + 'rgba(255,255,255,0.5) 78%,transparent);'
      + 'transform:' + REST + ';}'
      // Keep the button content above the effects.
      + '.glow-btn>svg,.glow-btn>span:not(.glow-clip){position:relative;z-index:2;}';
    var s = document.createElement('style');
    s.id = 'site-glow-css';
    s.textContent = css;
    document.head.appendChild(s);
  }

  // One sweep, and never two at once.
  //
  // Driven with element.animate() rather than a CSS class, deliberately: a CSS
  // animation does NOT restart when its class is re-added, so class-driven
  // sweeps need a remove + forced-reflow + re-add dance AND an animationend
  // listener to take the class off again - and that listener is exactly what
  // never arrives in a HIDDEN tab, where the browser creates the animation but
  // never advances its clock. The button would then be stuck "mid-sweep"
  // forever. Each call here creates its own animation instead; it does not
  // fill, so it drops out of getAnimations() the moment it finishes and there
  // is no state left to clean up. The busy check reads the animation itself,
  // so a sweep genuinely in flight is never cut in half.
  function sweep(btn) {
    if (reduceMotion) return;
    var shine = btn.querySelector('.glow-shine');
    if (!shine || !shine.animate) return;
    var busy = shine.getAnimations && shine.getAnimations().some(function (a) {
      return a.playState === 'running' || a.playState === 'paused';
    });
    if (busy) return;
    shine.animate(
      [{ transform: REST }, { transform: PAST }],
      { duration: SWEEP_MS, easing: 'ease-out' }
    );
  }

  function enhance(btn) {
    if (btn.querySelector('.glow-clip')) return; // already enhanced
    btn.classList.add('glow-btn');
    var clip = document.createElement('span');
    clip.className = 'glow-clip';
    clip.setAttribute('aria-hidden', 'true');
    var shine = document.createElement('span');
    shine.className = 'glow-shine';
    clip.appendChild(shine);
    btn.insertBefore(clip, btn.firstChild);
    btn.addEventListener('pointerenter', function () { sweep(btn); });
    btn.addEventListener('pointermove', function (e) {
      var r = btn.getBoundingClientRect();
      btn.style.setProperty('--gx', (e.clientX - r.left) + 'px');
      btn.style.setProperty('--gy', (e.clientY - r.top) + 'px');
    });
    btn.addEventListener('pointerleave', function () {
      btn.style.setProperty('--gx', '50%');
      btn.style.setProperty('--gy', '50%');
    });
  }

  // The idle sweep. ONE timer for the whole page (the buttons sit in different
  // sections, so nobody ever sees two of them fire together), and it stands
  // down while the tab is hidden - a background tab must not keep painting.
  var idleTimer = null;
  function startIdle() {
    if (idleTimer || reduceMotion) return;
    idleTimer = setInterval(function () {
      if (document.hidden) return;
      document.querySelectorAll('[data-glow]').forEach(sweep);
    }, IDLE_MS);
  }

  function run() {
    injectCss();
    document.querySelectorAll('[data-glow]').forEach(enhance);
    startIdle();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
  window.SonaraGlow = { render: run };
})();
