// Shared download-link resolver for the Sonara site - the SINGLE SOURCE OF
// TRUTH for the four Windows artifacts, so the buttons always point at the
// LATEST published player and a change (repo, asset naming) happens in ONE
// place (owner request 2026-07-21: globalize the download links so home and
// the invite page can never drift).
//
// Usage: mark any link with data-dl and load this script:
//   data-dl="x64"           -> Setup ...x64.exe        (the primary button)
//   data-dl="arm64"         -> Setup ...arm64.exe
//   data-dl="portable-x64"  -> win-x64-portable.zip
//   data-dl="portable-arm64"-> win-arm64-portable.zip
//   data-dl="releases"      -> the GitHub releases page (all versions)
// Every marked link starts with a safe fallback href in the HTML (the
// releases page), and this script upgrades it to the direct asset URL once
// the latest release resolves. If GitHub is unreachable, the fallback stays.
//
// It also broadcasts the resolved release so a page can react (e.g. the home
// hero renders the version pill): window dispatches 'sonara:release' with
// detail { tag, assets }, and window.SonaraDownloads.ready is a Promise of
// the same (or null on failure).
(function () {
  // The ONE place the repo lives for downloads. (Other, non-download GitHub
  // links on a page may keep their own constant; this owns the artifacts.)
  var GH = 'xtianmir/Sonara';
  var RELEASES_PAGE = 'https://github.com/' + GH + '/releases';
  var LATEST_PAGE = RELEASES_PAGE + '/latest';

  var MATCHERS = {
    'x64': /Setup.*x64\.exe$/i,
    'arm64': /Setup.*arm64\.exe$/i,
    'portable-x64': /win-x64-portable\.zip$/i,
    'portable-arm64': /win-arm64-portable\.zip$/i
  };

  function fillFallbacks() {
    document.querySelectorAll('[data-dl]').forEach(function (el) {
      if (!el.getAttribute('href') || el.getAttribute('href') === '#') {
        el.setAttribute('href', el.getAttribute('data-dl') === 'releases' ? RELEASES_PAGE : LATEST_PAGE);
      }
    });
  }

  function apply(rel) {
    if (!rel || !rel.assets) return null;
    function assetUrl(re) {
      var a = rel.assets.find(function (x) { return re.test(x.name); });
      return a ? a.browser_download_url : null;
    }
    var resolved = {};
    Object.keys(MATCHERS).forEach(function (key) {
      var url = assetUrl(MATCHERS[key]);
      if (url) resolved[key] = url;
    });
    document.querySelectorAll('[data-dl]').forEach(function (el) {
      var key = el.getAttribute('data-dl');
      if (resolved[key]) el.setAttribute('href', resolved[key]);
    });
    return resolved;
  }

  // This script may live in <head>, so the [data-dl] elements might not exist
  // yet - run the DOM-touching steps once the document is ready. The fetch can
  // start immediately (it is the slow part); applying its result waits for the
  // DOM so nothing is missed and a fetch failure still leaves safe fallbacks.
  function whenReady(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  whenReady(fillFallbacks);

  window.SonaraDownloads = { GH: GH, releasesPage: RELEASES_PAGE, latestPage: LATEST_PAGE };
  window.SonaraDownloads.ready = fetch('https://api.github.com/repos/' + GH + '/releases/latest')
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (rel) {
      if (!rel) return null;
      return new Promise(function (resolve) {
        whenReady(function () {
          var assets = apply(rel);
          try {
            window.dispatchEvent(new CustomEvent('sonara:release', { detail: { tag: rel.tag_name || '', assets: assets } }));
          } catch (e) {}
          resolve({ tag: rel.tag_name || '', assets: assets });
        });
      });
    })
    .catch(function () { return null; });
})();
