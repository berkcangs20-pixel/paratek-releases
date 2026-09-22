(function () {
  "use strict";
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var reduceMotion = false;
  try { reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  /* ---------- Nav: kaydırınca koyulaşma + mobil menü ---------- */
  var header = document.querySelector('.site-nav');
  var onScroll = function () {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 10);
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var burger = document.getElementById('burger');
  var mobilePanel = document.getElementById('mobilePanel');
  if (burger && mobilePanel) {
    burger.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
    mobilePanel.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { mobilePanel.classList.remove('open'); });
    });
  }

  /* ---------- Kaydırınca beliren bölümler ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Özellik kartlarında yumuşak 3D eğim ---------- */
  function attachTilt(selector, strength) {
    document.querySelectorAll(selector).forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var mx = ((e.clientX - r.left) / r.width) * 100;
        var my = ((e.clientY - r.top) / r.height) * 100;
        card.style.setProperty('--mx', mx + '%');
        card.style.setProperty('--my', my + '%');
        var rx = ((my - 50) / 50) * -strength;
        var ry = ((mx - 50) / 50) * strength;
        card.style.transform = 'perspective(700px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';
      });
      card.addEventListener('mouseleave', function () { card.style.transform = ''; });
    });
  }
  if (!reduceMotion) {
    attachTilt('.fcard', 5);
    attachTilt('.shot-frame-inner', 4);
  }

  /* ---------- Ekran görüntüsü sekmeleri ---------- */
  var tabs = document.querySelectorAll('.shot-tab');
  var shots = document.querySelectorAll('.shot-frame-inner img');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var key = tab.dataset.tab;
      tabs.forEach(function (t) { t.classList.toggle('active', t === tab); });
      shots.forEach(function (img) { img.classList.toggle('active', img.dataset.key === key); });
    });
  });

  /* ---------- SSS akordeon ---------- */
  document.querySelectorAll('.faq-q').forEach(function (q) {
    q.addEventListener('click', function () {
      var item = q.closest('.faq-item');
      var wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function (o) { o.classList.remove('open'); });
      if (!wasOpen) item.classList.add('open');
    });
  });

  /* ---------- GitHub Releases'ten güncel sürüm bilgisi ---------- */
  (function loadRelease() {
    var REPO = 'berkcangs20-pixel/paratek-releases';
    var versionEl = document.getElementById('dlVersion');
    var btnEl = document.getElementById('dlBtn');
    var sizeEl = document.getElementById('dlSize');
    var dateEl = document.getElementById('dlDate');
    var fallbackUrl = 'https://github.com/' + REPO + '/releases/latest';
    fetch('https://api.github.com/repos/' + REPO + '/releases/latest', { headers: { Accept: 'application/vnd.github+json' } })
      .then(function (res) { if (!res.ok) throw new Error('İstek başarısız'); return res.json(); })
      .then(function (data) {
        var asset = (data.assets || []).find(function (a) { return /\.exe$/i.test(a.name); });
        if (versionEl && data.tag_name) versionEl.textContent = data.tag_name.replace(/^v/i, 'v');
        if (asset) {
          if (btnEl) btnEl.href = asset.browser_download_url;
          if (sizeEl) sizeEl.textContent = Math.round(asset.size / 1024 / 1024) + ' MB';
        } else if (btnEl) {
          btnEl.href = fallbackUrl;
        }
        if (dateEl && data.published_at) {
          dateEl.textContent = new Date(data.published_at).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
        }
      })
      .catch(function () {
        if (btnEl) btnEl.href = fallbackUrl;
        if (versionEl) versionEl.textContent = '';
        if (sizeEl) sizeEl.textContent = '';
        if (dateEl) dateEl.textContent = '';
      });
  })();

  /* ---------- 3D logo patlaması ---------- */
  var stage = document.getElementById('logoStage');
  var logo3d = document.getElementById('logo3d');
  var shock = document.getElementById('shock');
  var sparksWrap = document.getElementById('sparks');
  if (stage && logo3d) {
    var PIECES = ['bg', 'ring', 'body', 'shade', 'slot', 'bar1', 'bar2', 'bar3', 'coin', 'coinshine'];
    var MAG = { bg: 22, ring: 55, body: 88, shade: 68, slot: 78, bar1: 108, bar2: 118, bar3: 128, coin: 98, coinshine: 138 };

    function explodeTransforms() {
      var n = PIECES.length;
      return PIECES.map(function (key, i) {
        var angle = (i / n) * Math.PI * 2 + (Math.random() * 0.6 - 0.3);
        var mag = MAG[key] * (0.75 + Math.random() * 0.5);
        var x = Math.cos(angle) * mag;
        var y = Math.sin(angle) * mag * 0.82;
        var z = Math.random() * 150 - 40;
        var rz = Math.random() * 170 - 85;
        var t = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,' + z.toFixed(1) + 'px) rotate3d(' +
          Math.random().toFixed(2) + ',' + Math.random().toFixed(2) + ',' + Math.random().toFixed(2) + ',' + rz.toFixed(0) + 'deg)';
        return { key: key, t: t };
      });
    }
    function setTransforms(list) {
      list.forEach(function (p) {
        var el = logo3d.querySelector('.lp.' + p.key);
        if (el) el.style.transform = p.t;
      });
    }
    function resetTransforms() {
      PIECES.forEach(function (key) {
        var el = logo3d.querySelector('.lp.' + key);
        if (el) el.style.transform = '';
      });
    }
    function flashShock() {
      if (!shock) return;
      shock.classList.remove('pulse');
      void shock.offsetWidth;
      shock.classList.add('pulse');
    }
    function spawnSparks() {
      if (!sparksWrap) return;
      sparksWrap.innerHTML = '';
      var n = 16;
      for (var i = 0; i < n; i++) {
        var el = document.createElement('div');
        el.className = 'spark';
        var angle = Math.random() * Math.PI * 2;
        var dist = 70 + Math.random() * 170;
        el.style.setProperty('--sx', (Math.cos(angle) * dist).toFixed(0) + 'px');
        el.style.setProperty('--sy', (Math.sin(angle) * dist).toFixed(0) + 'px');
        el.style.setProperty('--sd', (650 + Math.random() * 500).toFixed(0) + 'ms');
        sparksWrap.appendChild(el);
        requestAnimationFrame(function (node) { return function () { node.classList.add('go'); }; }(el));
      }
    }

    var exploding = false;
    function playExplosion() {
      if (exploding) return Promise.resolve();
      exploding = true;
      return (async function () {
        logo3d.classList.remove('idle');
        logo3d.classList.add('exploding');
        setTransforms(explodeTransforms());
        flashShock();
        spawnSparks();
        await sleep(560);
        logo3d.classList.remove('exploding');
        resetTransforms();
        await sleep(980);
        logo3d.classList.add('idle');
        exploding = false;
      })();
    }

    stage.addEventListener('click', function () { playExplosion(); });

    if (reduceMotion) {
      logo3d.classList.add('idle');
    } else {
      setTimeout(function () { playExplosion(); }, 700);
    }
  }
})();
