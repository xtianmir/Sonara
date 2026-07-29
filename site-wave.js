// Shared Deep AIR Wave background for every public Sonara page.
// It redraws only while pointer or scroll easing is still moving, then sleeps.
(function () {
  function init() {
    var host = document.querySelector('.site-background');
    if (!host || host.querySelector('[data-site-wave]')) return;

    var canvas = document.createElement('canvas');
    canvas.setAttribute('data-site-wave', '');
    host.appendChild(canvas);

    var ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    var width = 0;
    var height = 0;
    var dpr = 1;
    var frame = 0;
    var scrollTarget = 0;
    var scrollCurrent = 0;
    var pointerTargetX = 0.5;
    var pointerTargetY = 0.42;
    var pointerX = 0.5;
    var pointerY = 0.42;
    var reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    var accent = [34, 211, 161];

    function clamp(value, min, max) {
      return Math.min(max, Math.max(min, value));
    }

    function rgba(alpha) {
      return 'rgba(' + accent[0] + ',' + accent[1] + ',' + accent[2] + ',' + alpha + ')';
    }

    function requestDraw() {
      if (!frame && !document.hidden) frame = window.requestAnimationFrame(draw);
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      updateScroll();
    }

    function updateScroll() {
      var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scrollTarget = clamp(window.scrollY / max, 0, 1);
      requestDraw();
    }

    function pointerMove(event) {
      if (reducedQuery.matches || event.pointerType === 'touch') return;
      pointerTargetX = clamp(event.clientX / Math.max(1, width), 0, 1);
      pointerTargetY = clamp(event.clientY / Math.max(1, height), 0, 1);
      requestDraw();
    }

    function line(a, b, alpha, widthPx) {
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = rgba(alpha);
      ctx.lineWidth = widthPx;
      ctx.stroke();
    }

    function node(point, alpha, radius) {
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = rgba(alpha);
      ctx.fill();
    }

    function ring(point, alpha, radius) {
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(alpha);
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    function drawWave() {
      var bands = width < 700 ? 5 : 7;
      var count = width < 700 ? 12 : 20;
      var phase = scrollCurrent * Math.PI * 4.6;
      var rows = [];

      for (var band = 0; band < bands; band += 1) {
        var row = [];
        var baseY = height * (0.12 + band * (0.76 / Math.max(1, bands - 1)));
        var depth = 0.6 + band / Math.max(1, bands - 1) * 0.7;

        for (var i = 0; i < count; i += 1) {
          var u = i / (count - 1);
          var amplitude = 14 + 19 * Math.sin(u * Math.PI);
          var y = baseY
            + Math.sin(u * Math.PI * (3.2 + band * 0.16) + phase + band * 0.8) * amplitude * depth
            + Math.cos(u * Math.PI * 7 - phase * 0.6) * 5;
          var x = u * width + (pointerX - 0.5) * 8 * depth;

          y += (pointerY - 0.42) * 6 * depth;
          y += (scrollCurrent - 0.5) * (band - bands * 0.5) * 12;
          row.push({ x: x, y: y });
        }

        rows.push(row);
      }

      rows.forEach(function (row, band) {
        for (var i = 0; i < row.length; i += 1) {
          var point = row[i];
          if (i < row.length - 1) line(point, row[i + 1], 0.075 + band * 0.006, 0.75);
          if (band < rows.length - 1 && i % 3 === 1) line(point, rows[band + 1][i], 0.035, 0.52);
          node(point, i % 3 === 1 ? 0.38 : 0.18, i % 3 === 1 ? 1.8 : 1);
          if (i % 7 === 1) ring(point, 0.1, 5.5);
        }
      });
    }

    function draw() {
      frame = 0;

      if (reducedQuery.matches) {
        scrollCurrent = scrollTarget;
        pointerX = 0.5;
        pointerY = 0.42;
      } else {
        scrollCurrent += (scrollTarget - scrollCurrent) * 0.09;
        pointerX += (pointerTargetX - pointerX) * 0.08;
        pointerY += (pointerTargetY - pointerY) * 0.08;
      }

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'screen';
      drawWave();
      ctx.globalCompositeOperation = 'source-over';

      var wash = ctx.createLinearGradient(0, 0, 0, height);
      wash.addColorStop(0, 'rgba(16,18,20,0.03)');
      wash.addColorStop(0.55, 'rgba(16,18,20,0)');
      wash.addColorStop(1, 'rgba(16,18,20,0.24)');
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, width, height);

      canvas.dataset.scrollProgress = scrollCurrent.toFixed(4);

      if (!reducedQuery.matches && (
        Math.abs(scrollTarget - scrollCurrent) > 0.001 ||
        Math.abs(pointerTargetX - pointerX) > 0.001 ||
        Math.abs(pointerTargetY - pointerY) > 0.001
      )) requestDraw();
    }

    function visibilityChange() {
      if (!document.hidden) requestDraw();
    }

    window.addEventListener('resize', resize);
    window.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('pointermove', pointerMove, { passive: true });
    document.addEventListener('visibilitychange', visibilityChange);
    reducedQuery.addEventListener?.('change', requestDraw);
    resize();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
