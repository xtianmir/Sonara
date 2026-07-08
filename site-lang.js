// Shared language engine for the whole Sonara site - the SINGLE SOURCE OF
// TRUTH for "which of the 7 languages is this visitor on". Loaded by every
// page (index + legal pages) so the choice is GLOBAL: pick a language (or let
// detection choose) on any page and every other page follows, because the
// choice lives in one localStorage key and the detection logic lives here once.
//
// This file owns ONLY detection + persistence. Each page keeps its own
// applyLang() that paints ITS OWN DOM from ITS OWN dictionary; it just asks
// this engine "what language?" and "remember this choice".
//
// Resolution order (strongest signal first, decision 2026-07-07):
//   1. ?lang=xx in the URL (the player deep-links its own language).
//   2. The visitor's saved choice from a previous visit (any page).
//   3. A NON-English match from the browser's language list.
//   4. Timezone heuristic (Europe/Sofia -> bg, ...): instant, offline, private.
//   5. IP country lookup (geojs.io) - async, first visit only (detectAsyncIp).
//   6. English.
// A footer selector on any page calls save() and the choice sticks everywhere.
(function () {
  var LANGS = ['en', 'bg', 'de', 'es', 'fr', 'ru', 'zh'];
  var STORAGE_KEY = 'sonara-site-lang';

  var TZ_LANG = {
    'Europe/Sofia': 'bg',
    'Europe/Berlin': 'de', 'Europe/Vienna': 'de', 'Europe/Zurich': 'de', 'Europe/Busingen': 'de', 'Europe/Vaduz': 'de',
    'Europe/Paris': 'fr', 'Europe/Monaco': 'fr', 'Europe/Luxembourg': 'fr',
    'Europe/Madrid': 'es', 'Atlantic/Canary': 'es', 'Europe/Andorra': 'es',
    'Europe/Moscow': 'ru', 'Europe/Kaliningrad': 'ru', 'Europe/Samara': 'ru', 'Europe/Volgograd': 'ru', 'Europe/Saratov': 'ru', 'Europe/Kirov': 'ru', 'Europe/Astrakhan': 'ru', 'Europe/Ulyanovsk': 'ru', 'Europe/Minsk': 'ru',
    'Asia/Yekaterinburg': 'ru', 'Asia/Omsk': 'ru', 'Asia/Novosibirsk': 'ru', 'Asia/Krasnoyarsk': 'ru', 'Asia/Irkutsk': 'ru', 'Asia/Yakutsk': 'ru', 'Asia/Vladivostok': 'ru', 'Asia/Sakhalin': 'ru', 'Asia/Magadan': 'ru', 'Asia/Kamchatka': 'ru',
    'Asia/Shanghai': 'zh', 'Asia/Chongqing': 'zh', 'Asia/Harbin': 'zh', 'Asia/Urumqi': 'zh', 'Asia/Hong_Kong': 'zh', 'Asia/Macau': 'zh', 'Asia/Taipei': 'zh'
  };
  var TZ_PREFIX_ES = ['America/Mexico', 'America/Monterrey', 'America/Cancun', 'America/Merida', 'America/Chihuahua', 'America/Tijuana', 'America/Hermosillo', 'America/Mazatlan', 'America/Bogota', 'America/Lima', 'America/Santiago', 'America/Buenos_Aires', 'America/Argentina', 'America/Caracas', 'America/Guayaquil', 'America/La_Paz', 'America/Asuncion', 'America/Montevideo', 'America/Havana', 'America/Santo_Domingo', 'America/Guatemala', 'America/El_Salvador', 'America/Tegucigalpa', 'America/Managua', 'America/Costa_Rica', 'America/Panama'];
  // Multilingual countries (CH, BE) are left to the browser language.
  var COUNTRY_LANG = {
    BG: 'bg',
    DE: 'de', AT: 'de', LI: 'de',
    FR: 'fr', MC: 'fr', LU: 'fr',
    RU: 'ru', BY: 'ru',
    CN: 'zh', TW: 'zh', HK: 'zh', MO: 'zh', SG: 'zh',
    ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es', VE: 'es', EC: 'es', GT: 'es', CU: 'es', BO: 'es', DO: 'es', HN: 'es', PY: 'es', SV: 'es', NI: 'es', CR: 'es', PA: 'es', UY: 'es'
  };

  function langFromTimezone(tz) {
    if (!tz) return null;
    if (TZ_LANG[tz]) return TZ_LANG[tz];
    for (var i = 0; i < TZ_PREFIX_ES.length; i++) {
      if (tz.indexOf(TZ_PREFIX_ES[i]) === 0) return 'es';
    }
    return null;
  }
  function langFromCountry(cc) { return COUNTRY_LANG[String(cc || '').toUpperCase()] || null; }

  function getSaved() {
    try {
      var s = localStorage.getItem(STORAGE_KEY);
      return LANGS.indexOf(s) >= 0 ? s : null;
    } catch (e) { return null; }
  }
  function save(lang) {
    if (LANGS.indexOf(lang) < 0) return;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
  }

  // Synchronous best guess (everything except the async IP lookup).
  function detect() {
    try {
      var m = location.search.match(/[?&]lang=([A-Za-z-]+)/);
      if (m) {
        var fromUrl = m[1].slice(0, 2).toLowerCase();
        if (LANGS.indexOf(fromUrl) >= 0) return fromUrl;
      }
    } catch (e) {}
    var saved = getSaved();
    if (saved) return saved;
    var list = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || ''];
    for (var i = 0; i < list.length; i++) {
      var code = String(list[i]).slice(0, 2).toLowerCase();
      if (code !== 'en' && LANGS.indexOf(code) >= 0) return code;
    }
    var tz = null;
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) {}
    var byTz = langFromTimezone(tz);
    if (byTz) return byTz;
    return 'en';
  }

  // IP country fallback - only meaningful on a first visit that resolved to
  // English with no saved choice. Calls back with a language code if (and only
  // if) the visitor still has not chosen one by the time it resolves.
  function detectAsyncIp(cb) {
    if (getSaved()) return;
    fetch('https://get.geojs.io/v1/ip/country.json')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d) return;
        var byIp = langFromCountry(d.country);
        if (byIp && !getSaved()) cb(byIp);
      })
      .catch(function () {});
  }

  window.SonaraLang = {
    LANGS: LANGS,
    STORAGE_KEY: STORAGE_KEY,
    getSaved: getSaved,
    save: save,
    detect: detect,
    detectAsyncIp: detectAsyncIp,
    langFromTimezone: langFromTimezone,
    langFromCountry: langFromCountry
  };
  // Back-compat globals (were exposed by the old inline index.html engine).
  window.__langFromTimezone = langFromTimezone;
  window.__langFromCountry = langFromCountry;
})();
