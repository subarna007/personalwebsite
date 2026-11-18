(function () {
  var header = document.querySelector('.site-header');
  var bar = document.querySelector('.progress span');
  var toTop = document.querySelector('.to-top');

  // header shadow, reading progress and back-to-top button
  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle('scrolled', y > 8);
    bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
    toTop.classList.toggle('on', y > 900);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();
  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0 });
    document.querySelector('.brand').focus({ preventScroll: true });
  });

  // mobile menu
  var menuBtn = document.querySelector('.menu-btn');
  var nav = document.getElementById('nav');
  function setMenu(open) {
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menuBtn.querySelector('use').setAttribute('href', open ? '#i-close' : '#i-menu');
  }
  menuBtn.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  // highlight the section being read
  var links = {};
  nav.querySelectorAll('a[href^="#"]').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        Object.keys(links).forEach(function (k) { links[k].classList.toggle('active', k === en.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['research', 'papers', 'apps', 'about'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) spy.observe(el);
    });

    // fade blocks in once as they reach the screen
    var rev = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); rev.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) { rev.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  // on touch screens the first tap on a topic card shows the overlay, the second follows the link
  document.querySelectorAll('.topic').forEach(function (card) {
    if (!card.querySelector('.over')) return;
    card.addEventListener('click', function (e) {
      if (window.matchMedia('(hover: none)').matches && !card.classList.contains('show')) {
        e.preventDefault();
        document.querySelectorAll('.topic.show').forEach(function (c) { c.classList.remove('show'); });
        card.classList.add('show');
      }
    });
  });

  // enlarge figures
  var box = document.querySelector('.lightbox');
  var boxImg = box.querySelector('img');
  var boxCap = box.querySelector('.lb-cap');
  document.querySelectorAll('.zoom').forEach(function (btn) {
    var img = btn.querySelector('img');
    btn.setAttribute('aria-label', 'Enlarge figure: ' + img.alt);
    btn.addEventListener('click', function () {
      boxImg.src = img.currentSrc || img.src;
      boxImg.alt = img.alt;
      var cap = btn.nextElementSibling;
      boxCap.textContent = cap && cap.tagName === 'FIGCAPTION' ? cap.textContent : '';
      if (box.showModal) box.showModal(); else window.open(img.src, '_blank');
    });
  });
  box.querySelector('.lb-close').addEventListener('click', function () { box.close(); });
  box.addEventListener('click', function (e) { if (e.target === box) box.close(); });

  // copy a BibTeX entry
  var toast = document.querySelector('.toast');
  var toastTimer;
  function say(msg) {
    toast.textContent = msg;
    toast.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('on'); }, 2400);
  }
  document.querySelectorAll('.cite').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var bib = '@misc{' + btn.dataset.key + ',\n' +
        '  author = {Dahal, Subarna},\n' +
        '  title = {' + btn.dataset.title + '},\n' +
        '  year = {2026},\n' +
        '  note = {Preprint},\n' +
        '  url = {' + btn.dataset.url + '}\n}';
      var done = function () { say('BibTeX copied to the clipboard'); };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(bib).then(done, function () { fallback(bib); });
      } else {
        fallback(bib);
      }
      function fallback(text) {
        var t = document.createElement('textarea');
        t.value = text; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';
        document.body.appendChild(t); t.select();
        try { document.execCommand('copy'); done(); } catch (err) { say('Could not copy. Select the text manually.'); }
        t.remove();
      }
    });
  });
})();
