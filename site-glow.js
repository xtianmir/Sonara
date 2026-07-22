// Shared "glow download button" enhancement - the SINGLE SOURCE for the
// glossy Download button so it looks + behaves the SAME wherever it appears on
// the site (owner request 2026-07-21). Any button marked data-glow gets:
//   • an animation-style DOUBLE GLEAM that sweeps across slowly (a wide sharp
//     band + a thin one - crisp, not a soft thin line);
//   • a contour GLOW on hover that FADES IN smoothly (own layer, never
//     animated, so the transition is clean - no abrupt pop);
//   • a cursor-following highlight on the surface.
// GPU-only (transform/opacity), decorative layers are pointer-events:none and
// scoped so they never touch a page's own button CSS beyond the opt-in class.
//
// Usage: add `data-glow` to the primary download button and load this script.
(function () {
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
      // Animation-style double gleam: a wide band with a bright core + a thin
      // trailing band. Sharp edges (tight stops), bright, sweeps slowly.
      + '.glow-shine{position:absolute;top:-30%;bottom:-30%;left:0;width:62%;'
      + 'background:linear-gradient(105deg,'
      + 'transparent 31%,rgba(255,255,255,0.5) 36%,rgba(255,255,255,1) 41%,rgba(255,255,255,0.5) 46%,transparent 50%,'
      + 'transparent 55%,rgba(255,255,255,0.9) 59%,rgba(255,255,255,0.9) 61%,transparent 65%);'
      + 'transform:skewX(-20deg) translateX(-210%);'
      + 'animation:glow-shine-sweep 7s cubic-bezier(0.45,0,0.55,1) infinite;}'
      + '@keyframes glow-shine-sweep{0%,55%{transform:skewX(-20deg) translateX(-210%);}85%,100%{transform:skewX(-20deg) translateX(250%);}}'
      // Keep the button content above the effects.
      + '.glow-btn>svg,.glow-btn>span:not(.glow-clip){position:relative;z-index:2;}'
      + '@media(prefers-reduced-motion:reduce){.glow-shine{animation:none;}}';
    var s = document.createElement('style');
    s.id = 'site-glow-css';
    s.textContent = css;
    document.head.appendChild(s);
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

  function run() {
    injectCss();
    document.querySelectorAll('[data-glow]').forEach(enhance);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
  window.SonaraGlow = { render: run };
})();
