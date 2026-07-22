// Shared site CHROME (nav + footer) - the SINGLE SOURCE for the home-style
// top navigation and the full footer, so every page carries the SAME chrome
// (owner request 2026-07-21: "put the same footer as home everywhere, make it
// global"). The brand (top-left + footer mark) always links home, so there is
// no per-page "Home" button - the logo/wordmark is the way home.
//
// A page uses it by dropping two placeholders and loading this script (after
// site-lang.js, site-brand.js, site-downloads.js):
//   <div id="site-nav"></div>      (full width, before the page content)
//   <div id="site-footer"></div>   (full width, after the page content)
//
// Everything is SCOPED under sc- class names so it can never collide with a
// page's own CSS. Nav links point at index.html#anchor, so they work from any
// page (navigate to home, then scroll); the brand + footer mark go to "./".
// Language uses the SAME custom dropdown as the home footer and fires
// `sonara:lang` (each page's own painter listens to translate its content).
(function () {
  var GH = (window.SonaraDownloads && window.SonaraDownloads.GH) || 'xtianmir/Sonara';
  var REPO = 'https://github.com/' + GH;
  var DISC = REPO + '/discussions';
  var HOME = 'index.html';

  var LANG_NAMES = { en: 'English', bg: 'Български', de: 'Deutsch', es: 'Español', fr: 'Français', ru: 'Русский', zh: '中文' };

  // Nav + footer labels, lifted verbatim from the home page's I18N (7 locales).
  var L = {"en":{"nav.features":"Features","nav.pricing":"Free &amp; Premium","nav.donate":"Donate","nav.faq":"FAQ","nav.ideas":"Ideas","nav.download":"Download","nav.mlabel.cat":"Categories","nav.cat.ideas":"Ideas &amp; feedback","nav.cat.ann":"Announcements","nav.cat.gen":"General","nav.cat.qa":"Q&amp;A","nav.mlabel.proj":"Project","nav.gh.repo":"Repository","nav.gh.rel":"Releases","nav.gh.disc":"Discussions","fo.tag":"A local-first music player for Windows.","fo.lang":"Language","fo.soc":"Social","fo.prod":"Product","fo.res":"Resources","fo.com":"Community","fo.dl":"Download","legal.terms":"Terms of Service","legal.privacy":"Privacy Policy"},"bg":{"nav.features":"Функции","nav.pricing":"Безплатен и Premium","nav.donate":"Дарение","nav.faq":"Въпроси","nav.ideas":"Идеи","nav.download":"Изтегли","nav.mlabel.cat":"Категории","nav.cat.ideas":"Идеи и предложения","nav.cat.ann":"Новини","nav.cat.gen":"Общи","nav.cat.qa":"Въпроси и отговори","nav.mlabel.proj":"Проект","nav.gh.repo":"Хранилище","nav.gh.rel":"Версии","nav.gh.disc":"Дискусии","fo.tag":"Локален музикален плеър за Windows.","fo.lang":"Език","fo.soc":"Социални","fo.prod":"Продукт","fo.res":"Ресурси","fo.com":"Общност","fo.dl":"Изтегли","legal.terms":"Общи условия","legal.privacy":"Политика за поверителност"},"de":{"nav.features":"Funktionen","nav.pricing":"Free &amp; Premium","nav.donate":"Spenden","nav.faq":"FAQ","nav.ideas":"Ideen","nav.download":"Download","nav.mlabel.cat":"Kategorien","nav.cat.ideas":"Ideen &amp; Feedback","nav.cat.ann":"Ankündigungen","nav.cat.gen":"Allgemein","nav.cat.qa":"Fragen &amp; Antworten","nav.mlabel.proj":"Projekt","nav.gh.repo":"Repository","nav.gh.rel":"Releases","nav.gh.disc":"Diskussionen","fo.tag":"Ein Local-First-Musikplayer für Windows.","fo.lang":"Sprache","fo.soc":"Social","fo.prod":"Produkt","fo.res":"Ressourcen","fo.com":"Community","fo.dl":"Download","legal.terms":"Nutzungsbedingungen","legal.privacy":"Datenschutzerklärung"},"es":{"nav.features":"Funciones","nav.pricing":"Free y Premium","nav.donate":"Donar","nav.faq":"FAQ","nav.ideas":"Ideas","nav.download":"Descargar","nav.mlabel.cat":"Categorías","nav.cat.ideas":"Ideas y sugerencias","nav.cat.ann":"Anuncios","nav.cat.gen":"General","nav.cat.qa":"Preguntas y respuestas","nav.mlabel.proj":"Proyecto","nav.gh.repo":"Repositorio","nav.gh.rel":"Versiones","nav.gh.disc":"Discusiones","fo.tag":"Un reproductor de música local para Windows.","fo.lang":"Idioma","fo.soc":"Redes","fo.prod":"Producto","fo.res":"Recursos","fo.com":"Comunidad","fo.dl":"Descargar","legal.terms":"Condiciones de servicio","legal.privacy":"Política de privacidad"},"fr":{"nav.features":"Fonctions","nav.pricing":"Free et Premium","nav.donate":"Faire un don","nav.faq":"FAQ","nav.ideas":"Idées","nav.download":"Télécharger","nav.mlabel.cat":"Catégories","nav.cat.ideas":"Idées et retours","nav.cat.ann":"Annonces","nav.cat.gen":"Général","nav.cat.qa":"Questions-réponses","nav.mlabel.proj":"Projet","nav.gh.repo":"Dépôt","nav.gh.rel":"Versions","nav.gh.disc":"Discussions","fo.tag":"Un lecteur de musique local pour Windows.","fo.lang":"Langue","fo.soc":"Réseaux","fo.prod":"Produit","fo.res":"Ressources","fo.com":"Communauté","fo.dl":"Télécharger","legal.terms":"Conditions d'utilisation","legal.privacy":"Politique de confidentialité"},"ru":{"nav.features":"Функции","nav.pricing":"Free и Premium","nav.donate":"Поддержать","nav.faq":"Вопросы","nav.ideas":"Идеи","nav.download":"Скачать","nav.mlabel.cat":"Категории","nav.cat.ideas":"Идеи и отзывы","nav.cat.ann":"Анонсы","nav.cat.gen":"Общее","nav.cat.qa":"Вопросы и ответы","nav.mlabel.proj":"Проект","nav.gh.repo":"Репозиторий","nav.gh.rel":"Релизы","nav.gh.disc":"Обсуждения","fo.tag":"Локальный музыкальный плеер для Windows.","fo.lang":"Язык","fo.soc":"Соцсети","fo.prod":"Продукт","fo.res":"Ресурсы","fo.com":"Сообщество","fo.dl":"Скачать","legal.terms":"Условия использования","legal.privacy":"Политика конфиденциальности"},"zh":{"nav.features":"功能","nav.pricing":"免费与 Premium","nav.donate":"捐助","nav.faq":"常见问题","nav.ideas":"想法","nav.download":"下载","nav.mlabel.cat":"分类","nav.cat.ideas":"想法与反馈","nav.cat.ann":"公告","nav.cat.gen":"综合","nav.cat.qa":"问答","nav.mlabel.proj":"项目","nav.gh.repo":"代码仓库","nav.gh.rel":"版本发布","nav.gh.disc":"讨论区","fo.tag":"Windows 本地优先音乐播放器。","fo.lang":"语言","fo.soc":"社交","fo.prod":"产品","fo.res":"资源","fo.com":"社区","fo.dl":"下载","legal.terms":"服务条款","legal.privacy":"隐私政策"}};

  // Footer legal bar (copyright holder = the operating company; localized credit
  // + fine-print). Same wording as the home footer's legal.fine.
  var F = {
    en: { copy: 'ArtSolver Ltd.', credit: 'Sonara is created by Tihomir Nyagolov', fine: 'Sonara is provided as-is, without warranty. The free version is free to use; Premium features need a valid license. Anonymous usage statistics are on by default and can be turned off in Preferences. Your music library and listening history are never sent anywhere - they stay strictly local on your computer.' },
    bg: { copy: 'ArtSolver Ltd.', credit: 'Sonara е създадена от Tihomir Nyagolov', fine: 'Sonara се предоставя както си е, без гаранция. Безплатната версия е свободна за ползване; Premium функциите изискват валиден лиценз. Анонимните статистики за ползване са включени по подразбиране и могат да се изключат от предпочитанията. Музикалната ти библиотека и историята на слушане никога не се изпращат никъде - остават строго локални на твоя компютър.' },
    de: { copy: 'ArtSolver Ltd.', credit: 'Sonara wurde erstellt von Tihomir Nyagolov', fine: 'Sonara wird bereitgestellt wie es ist, ohne Gewähr. Die kostenlose Version ist frei nutzbar; Premium-Funktionen brauchen eine gültige Lizenz. Anonyme Nutzungsstatistiken sind standardmäßig aktiv und lassen sich in den Einstellungen abschalten. Deine Musikbibliothek und dein Hörverlauf werden nirgendwohin gesendet - sie bleiben strikt lokal auf deinem Computer.' },
    es: { copy: 'ArtSolver Ltd.', credit: 'Sonara está creado por Tihomir Nyagolov', fine: 'Sonara se ofrece tal cual, sin garantía. La versión gratuita es de uso libre; las funciones Premium requieren una licencia válida. Las estadísticas anónimas de uso están activadas por defecto y pueden desactivarse en Preferencias. Tu biblioteca musical y tu historial de escucha nunca se envían a ningún sitio - permanecen estrictamente locales en tu equipo.' },
    fr: { copy: 'ArtSolver Ltd.', credit: 'Sonara est créé par Tihomir Nyagolov', fine: "Sonara est fourni tel quel, sans garantie. La version gratuite est libre d'utilisation ; les fonctions Premium nécessitent une licence valide. Les statistiques anonymes d'utilisation sont activées par défaut et peuvent être désactivées dans les Préférences. Votre bibliothèque musicale et votre historique d'écoute ne sont jamais envoyés nulle part - ils restent strictement locaux sur votre ordinateur." },
    ru: { copy: 'ArtSolver Ltd.', credit: 'Sonara создан Tihomir Nyagolov', fine: 'Sonara предоставляется как есть, без гарантий. Бесплатная версия свободна для использования; Premium-функции требуют действующей лицензии. Анонимная статистика включена по умолчанию и отключается в настройках. Ваша библиотека и история прослушивания никуда не отправляются - они остаются строго локально на вашем компьютере.' },
    zh: { copy: 'ArtSolver Ltd.', credit: 'Sonara 由 Tihomir Nyagolov 创作', fine: 'Sonara 按现状提供，不含任何保证。免费版可自由使用；Premium 功能需要有效许可证。匿名使用统计默认开启，可在偏好设置中关闭。你的音乐库与收听记录绝不会被发送到任何地方 - 它们严格保留在你的电脑本地。' }
  };

  function injectCss() {
    if (document.getElementById('site-chrome-css')) return;
    var css = ''
      // Nav (scoped; mirrors the home nav)
      + '.sc-nav{position:relative;z-index:40;max-width:1180px;margin:0 auto;padding:22px 28px;display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;}'
      + '.sc-links{display:flex;gap:4px;font-size:14px;font-weight:800;align-items:center;flex-wrap:wrap;}'
      + '.sc-links>a,.sc-item>a{color:var(--text-strong);opacity:.92;padding:8px 12px;border-radius:999px;display:inline-flex;align-items:center;gap:6px;cursor:pointer;}'
      + '.sc-links>a:hover,.sc-item>a:hover{opacity:1;text-decoration:none;background:rgba(133,145,235,.12);}'
      + '.sc-chev{width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round;transition:transform .15s ease;}'
      + '.sc-item{position:relative;}'
      + '.sc-item:hover>a .sc-chev,.sc-item:focus-within>a .sc-chev{transform:rotate(180deg);}'
      + '.sc-menu{position:absolute;top:calc(100% + 8px);left:50%;transform:translate(-50%,6px);min-width:216px;padding:12px;background:var(--glass-strong);backdrop-filter:var(--blur-glass);-webkit-backdrop-filter:var(--blur-glass);border:1px solid var(--glass-border);border-radius:18px;display:flex;flex-direction:column;gap:2px;opacity:0;visibility:hidden;transition:opacity .15s ease,transform .15s ease,visibility .15s;z-index:50;}'
      + '.sc-menu::before{content:"";position:absolute;top:-12px;left:0;right:0;height:12px;}'
      + '.sc-item:hover .sc-menu,.sc-item:focus-within .sc-menu{opacity:1;visibility:visible;transform:translate(-50%,0);}'
      + '.sc-menu-label{font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--text-faint);font-weight:800;padding:4px 12px 5px;}'
      + '.sc-menu a{display:block;padding:8px 12px;border-radius:10px;color:var(--text-strong);font-weight:700;font-size:13.5px;}'
      + '.sc-menu a:hover{background:rgba(34,211,161,.14);text-decoration:none;}'
      // Footer (scoped; mirrors the home footer) - full-width gradient + top
      // border clearly SEPARATE it from the page content (like home); the
      // content sits in a centred inner container.
      + '.sc-foot{position:relative;z-index:1;margin-top:76px;background:linear-gradient(180deg,#0b0d26 0%,#101538 42%,#0e352c 100%);border-top:1px solid var(--border-soft,#23264c);padding:64px 0 52px;color:var(--text-muted);font-size:13px;}'
      + '.sc-foot-inner{max-width:1180px;margin:0 auto;padding:0 28px;}'
      + '.sc-fgrid{display:grid;grid-template-columns:1.35fr 1fr 1fr 1fr;gap:32px;}'
      + '@media(max-width:760px){.sc-fgrid{grid-template-columns:1fr 1fr;}}'
      + '.sc-brand-link{display:inline-block;}'
      + '.sc-mark{display:inline-flex;align-items:flex-end;gap:3px;height:24px;}'
      + '.sc-mark i{width:4px;border-radius:2px;background:var(--accent);display:block;}'
      + '.sc-mark i:nth-child(1){height:11px;}.sc-mark i:nth-child(2){height:23px;}.sc-mark i:nth-child(3){height:16px;}.sc-mark i:nth-child(4){height:20px;}.sc-mark i:nth-child(5){height:10px;}'
      + '.sc-flabel{color:var(--text-faint);font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;margin:18px 0 8px;}'
      + '.sc-flabel:first-of-type{margin-top:20px;}'
      + '.sc-fgrid h4{color:var(--accent);font-size:13.5px;font-weight:800;margin-bottom:13px;}'
      + '.sc-fgrid .sc-col a{display:block;color:var(--text);font-size:13.5px;margin-bottom:9px;cursor:pointer;}'
      + '.sc-fgrid .sc-col a:hover{color:var(--accent);}'
      + '.sc-social{display:flex;gap:10px;}'
      + '.sc-social a{width:34px;height:34px;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;background:var(--glass);border:1px solid var(--glass-border);color:var(--text-secondary);transition:transform .15s ease,color .15s ease,border-color .15s ease;}'
      + '.sc-social a:hover{transform:translateY(-2px);color:var(--accent);border-color:var(--chip-border);text-decoration:none;}'
      + '.sc-social svg{width:17px;height:17px;}'
      // Language picker (same custom dropdown as the home footer)
      + '.sc-lang{position:relative;max-width:230px;}'
      + '.sc-lang .lang-btn{width:100%;display:flex;justify-content:space-between;align-items:center;gap:10px;background:rgba(29,32,68,.55);border:1px solid var(--border);border-radius:14px;padding:12px 16px;color:var(--text-strong);font-family:var(--font-sans);font-size:14px;font-weight:700;cursor:pointer;transition:border-color .15s ease;}'
      + '.sc-lang .lang-btn:hover{border-color:var(--chip-border);}'
      + '.sc-lang .sc-chev{width:15px;height:15px;}'
      + '.sc-lang.open .sc-chev{transform:rotate(180deg);}'
      + '.sc-lang .lang-menu{position:absolute;top:calc(100% + 8px);left:0;right:0;background:var(--glass-strong);backdrop-filter:var(--blur-glass);-webkit-backdrop-filter:var(--blur-glass);border:1px solid var(--glass-border);border-radius:14px;padding:8px;display:none;z-index:30;max-height:250px;overflow:auto;}'
      + '.sc-lang.open .lang-menu{display:block;}'
      + '.sc-lang .lang-menu button{width:100%;text-align:left;background:transparent;border:0;color:var(--text-strong);font-family:var(--font-sans);font-weight:700;font-size:13.5px;padding:9px 12px;border-radius:10px;cursor:pointer;}'
      + '.sc-lang .lang-menu button:hover{background:rgba(34,211,161,.14);}'
      + '.sc-lang .lang-menu button.is-active{background:var(--accent);color:var(--on-accent);}'
      // Legal bar
      + '.sc-legal{margin-top:44px;padding-top:22px;border-top:1px solid rgba(133,145,235,.14);text-align:center;}'
      + '.sc-legal .sc-links2{margin-top:8px;font-size:13px;}'
      + '.sc-legal .sc-links2 a{color:var(--text-muted);font-weight:700;margin:0 10px;}'
      + '.sc-legal .sc-links2 a:hover{color:var(--accent);}'
      + '.sc-legal .sc-copy{font-size:13px;color:var(--text-faint);}'
      + '.sc-legal .sc-fine{margin:12px auto 0;font-size:12px;color:var(--text-faint);max-width:640px;line-height:1.5;}';
    var s = document.createElement('style');
    s.id = 'site-chrome-css';
    s.textContent = css;
    document.head.appendChild(s);
  }

  var CHEV = '<svg class="sc-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
  var MARK = '<span class="sc-mark" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>';
  var SOC = {
    x: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.9 1.2h3.7l-8.1 9.3 9.5 12.3h-7.5l-5.8-7.6-6.7 7.6H.2l8.7-9.9L-.2 1.2h7.7l5.3 6.9 6.1-6.9z"/></svg>',
    ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><rect x="2.8" y="2.8" width="18.4" height="18.4" rx="5.2"/><circle cx="12" cy="12" r="4.4"/><circle cx="17.6" cy="6.4" r="1.15" fill="currentColor" stroke="none"/></svg>',
    yt: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6z"/></svg>',
    tt: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19.6 5.8a5.7 5.7 0 0 1-3.4-3.6h-3.2v13.5a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V9.6a6.3 6.3 0 0 0-.9-.1 6.2 6.2 0 1 0 6.2 6.2V9.3a8.9 8.9 0 0 0 4.6 1.3V7.4a5.7 5.7 0 0 1-1.3-.2z"/></svg>',
    dc: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.3 4.6A19.9 19.9 0 0 0 15.4 3l-.6 1.2a15 15 0 0 0-5.6 0L8.6 3a19.9 19.9 0 0 0-4.9 1.6A20.5 20.5 0 0 0 .2 18.4a20 20 0 0 0 6 3l1-1.7a12.9 12.9 0 0 1-2-1l.5-.4a14.3 14.3 0 0 0 12.6 0l.5.4a12.9 12.9 0 0 1-2 1l1 1.7a20 20 0 0 0 6-3A20.5 20.5 0 0 0 20.3 4.6zM8.3 15.3c-1.2 0-2.2-1.1-2.2-2.4S7.1 10.5 8.3 10.5s2.2 1.1 2.2 2.4-1 2.4-2.2 2.4zm7.4 0c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4z"/></svg>'
  };

  // The nav links: home anchors (navigate to home + scroll from any page).
  var NAV_LINKS = [
    { k: 'nav.features', href: HOME + '#features' },
    { k: 'nav.pricing', href: HOME + '#pricing' },
    { k: 'nav.donate', href: HOME + '#support' },
    { k: 'nav.faq', href: HOME + '#faq' }
  ];

  function buildNav(host) {
    var links = '';
    for (var i = 0; i < NAV_LINKS.length; i++) links += '<a href="' + NAV_LINKS[i].href + '" data-sc="' + NAV_LINKS[i].k + '"></a>';
    // Ideas + GitHub dropdowns (mirror home)
    var ideasMenu = '<span class="sc-item"><a href="' + DISC + '/categories/ideas">' + '<span data-sc="nav.ideas"></span>' + CHEV + '</a>'
      + '<span class="sc-menu"><span class="sc-menu-label" data-sc="nav.mlabel.cat"></span>'
      + '<a href="' + DISC + '/categories/ideas" data-sc="nav.cat.ideas"></a>'
      + '<a href="' + DISC + '/categories/announcements" data-sc="nav.cat.ann"></a>'
      + '<a href="' + DISC + '/categories/general" data-sc="nav.cat.gen"></a>'
      + '<a href="' + DISC + '/categories/q-a" data-sc="nav.cat.qa"></a></span></span>';
    var ghMenu = '<span class="sc-item"><a href="' + REPO + '"><span>GitHub</span>' + CHEV + '</a>'
      + '<span class="sc-menu"><span class="sc-menu-label" data-sc="nav.mlabel.proj"></span>'
      + '<a href="' + REPO + '" data-sc="nav.gh.repo"></a>'
      + '<a href="' + REPO + '/releases" data-sc="nav.gh.rel"></a>'
      + '<a href="' + DISC + '" data-sc="nav.gh.disc"></a></span></span>';
    host.innerHTML = '<div class="sc-nav" role="navigation" aria-label="Site">'
      + '<a data-brand href="./" aria-label="Sonara home"></a>'
      + '<span class="sc-links">' + links + ideasMenu + ghMenu + '</span></div>';
  }

  function buildFooter(host) {
    var langOpts = '';
    for (var i = 0; i < SonaraLang.LANGS.length; i++) {
      var l = SonaraLang.LANGS[i];
      langOpts += '<button type="button" data-lang="' + l + '">' + LANG_NAMES[l] + '</button>';
    }
    var year = new Date().getFullYear();
    host.innerHTML = '<div class="sc-foot"><div class="sc-foot-inner"><div class="sc-fgrid">'
      // Column 1: JUST the logo mark (no wordmark, no tagline) - like home;
      // links home. Then language + social.
      + '<div><a class="sc-brand-link" href="./" aria-label="Sonara home"><span class="sc-mark" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span></a>'
      + '<div class="sc-flabel" data-sc="fo.lang"></div>'
      + '<div class="sc-lang"><button type="button" class="lang-btn" aria-haspopup="listbox"><span data-sc-lang-current></span>' + CHEV + '</button>'
      + '<div class="lang-menu" role="listbox" aria-label="Site language">' + langOpts + '</div></div>'
      + '<div class="sc-flabel" data-sc="fo.soc"></div>'
      + '<div class="sc-social">'
      + '<a href="#" rel="noopener" aria-label="X" data-soc="x">' + SOC.x + '</a>'
      + '<a href="#" rel="noopener" aria-label="Instagram" data-soc="ig">' + SOC.ig + '</a>'
      + '<a href="#" rel="noopener" aria-label="YouTube" data-soc="yt">' + SOC.yt + '</a>'
      + '<a href="#" rel="noopener" aria-label="TikTok" data-soc="tt">' + SOC.tt + '</a>'
      + '<a href="#" rel="noopener" aria-label="Discord" data-soc="dc">' + SOC.dc + '</a>'
      + '</div></div>'
      // Column 2: Product
      + '<div class="sc-col"><h4 data-sc="fo.prod"></h4>'
      + '<a href="' + HOME + '#download" data-sc="fo.dl"></a>'
      + '<a href="' + HOME + '#pricing" data-sc="nav.pricing"></a>'
      + '<a href="' + HOME + '#features" data-sc="nav.features"></a></div>'
      // Column 3: Resources
      + '<div class="sc-col"><h4 data-sc="fo.res"></h4>'
      + '<a href="' + HOME + '#support" data-sc="nav.donate"></a>'
      + '<a href="' + HOME + '#faq" data-sc="nav.faq"></a>'
      + '<a href="' + DISC + '/categories/ideas" data-sc="nav.cat.ideas"></a></div>'
      // Column 4: Community
      + '<div class="sc-col"><h4 data-sc="fo.com"></h4>'
      + '<a href="' + REPO + '" data-sc="nav.gh.repo"></a>'
      + '<a href="' + REPO + '/releases" data-sc="nav.gh.rel"></a>'
      + '<a href="' + DISC + '" data-sc="nav.gh.disc"></a></div>'
      + '</div>'
      // Legal bar
      + '<div class="sc-legal">'
      + '<div class="sc-copy">&copy; ' + year + ' <span data-sc-copy></span> &middot; <span data-sc-credit></span></div>'
      + '<div class="sc-links2"><a href="terms.html" data-sc="legal.terms"></a><a href="privacy.html" data-sc="legal.privacy"></a></div>'
      + '<p class="sc-fine" data-sc-fine></p></div>' // close .sc-legal
      + '</div></div>'; // close .sc-foot-inner + .sc-foot
  }

  function paint(lang) {
    if (!L[lang]) lang = 'en';
    document.documentElement.setAttribute('lang', lang);
    var l = L[lang], f = F[lang];
    document.querySelectorAll('[data-sc]').forEach(function (el) {
      var v = l[el.getAttribute('data-sc')];
      if (v != null) el.innerHTML = v; // labels may carry &amp; entities
    });
    document.querySelectorAll('[data-sc-lang-current]').forEach(function (el) { el.textContent = LANG_NAMES[lang]; });
    document.querySelectorAll('[data-sc-copy]').forEach(function (el) { el.textContent = f.copy; });
    document.querySelectorAll('[data-sc-credit]').forEach(function (el) { el.textContent = f.credit; });
    document.querySelectorAll('[data-sc-fine]').forEach(function (el) { el.textContent = f.fine; });
    document.querySelectorAll('.sc-lang .lang-menu button').forEach(function (b) { b.classList.toggle('is-active', b.getAttribute('data-lang') === lang); });
  }

  function wirePicker() {
    document.querySelectorAll('.sc-lang').forEach(function (picker) {
      var btn = picker.querySelector('.lang-btn');
      btn.addEventListener('click', function (e) { e.stopPropagation(); picker.classList.toggle('open'); });
      picker.querySelectorAll('.lang-menu button').forEach(function (b) {
        b.addEventListener('click', function () {
          var lang = b.getAttribute('data-lang');
          picker.classList.remove('open');
          if (window.SonaraLang) SonaraLang.save(lang);
          paint(lang);
          try { window.dispatchEvent(new CustomEvent('sonara:lang', { detail: lang })); } catch (e) {}
        });
      });
    });
    document.addEventListener('click', function (e) {
      document.querySelectorAll('.sc-lang.open').forEach(function (p) { if (!p.contains(e.target)) p.classList.remove('open'); });
    });
  }

  function init() {
    var nav = document.getElementById('site-nav');
    var foot = document.getElementById('site-footer');
    if (!nav && !foot) return;
    injectCss();
    if (nav) buildNav(nav);
    if (foot) buildFooter(foot);
    if (window.SonaraBrand) SonaraBrand.render(); // fill the [data-brand] we just created
    wirePicker();
    var start = (window.SonaraLang && SonaraLang.detect()) || 'en';
    paint(start);
    if (window.SonaraLang && SonaraLang.detectAsyncIp) {
      SonaraLang.detectAsyncIp(function (byIp) { if (L[byIp]) { paint(byIp); try { window.dispatchEvent(new CustomEvent('sonara:lang', { detail: byIp })); } catch (e) {} } });
    }
    window.addEventListener('storage', function (e) {
      if (window.SonaraLang && e.key === SonaraLang.STORAGE_KEY && e.newValue && L[e.newValue]) paint(e.newValue);
    });
    // Download links inside the footer (data-dl) are upgraded by
    // site-downloads.js on its own; nothing to do here.
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  window.SonaraChrome = { render: init, paint: paint };
})();
