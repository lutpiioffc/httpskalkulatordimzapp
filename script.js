/* Neon Calc – logika kalkulator (tanpa library, tanpa internet) */
(function () {
  'use strict';

  /* ===== LOGIC START ===== */
  var BIN = '+−×÷';
  var state = { expr: '', lastExpr: '', done: false, err: '' };

  function tokenize(s) {
    var t = [], i = 0, m, c;
    while (i < s.length) {
      c = s.charAt(i);
      if (/[0-9.]/.test(c)) {
        m = /^(\d+\.?\d*|\.\d+)/.exec(s.slice(i));
        if (!m) throw new Error('syntax');
        t.push({ type: 'num', value: parseFloat(m[0]) });
        i += m[0].length;
        continue;
      }
      if ('+−×÷²%√'.indexOf(c) > -1) { t.push({ type: c }); i++; continue; }
      throw new Error('syntax');
    }
    return t;
  }

  /* Penghitung ekspresi buatan sendiri (tanpa eval) */
  function evaluate(s) {
    var t = tokenize(s), p = 0;
    function peek() { return p < t.length ? t[p].type : null; }
    function next() { return t[p++]; }

    function postfix() {
      var tok = next();
      if (!tok || tok.type !== 'num') throw new Error('syntax');
      var r = { v: tok.value, pct: false };
      while (peek() === '²' || peek() === '%') {
        if (next().type === '²') { r.v = r.v * r.v; r.pct = false; }
        else { r.v = r.v / 100; r.pct = true; }
      }
      return r;
    }
    function unary() {
      var r;
      if (peek() === '−') { next(); r = unary(); return { v: -r.v, pct: r.pct }; }
      if (peek() === '√') {
        next(); r = unary();
        if (r.v < 0) throw new Error('sqrt');
        return { v: Math.sqrt(r.v), pct: false };
      }
      return postfix();
    }
    function term() {
      var l = unary(), op, r;
      while (peek() === '×' || peek() === '÷') {
        op = next().type; r = unary();
        if (op === '÷') {
          if (r.v === 0) throw new Error('div0');
          l = { v: l.v / r.v, pct: false };
        } else {
          l = { v: l.v * r.v, pct: false };
        }
      }
      return l;
    }
    function expr() {
      var l = term(), op, r, rv;
      while (peek() === '+' || peek() === '−') {
        op = next().type; r = term();
        rv = r.pct ? l.v * r.v : r.v;           /* 200 + 10% = 220 */
        l = { v: op === '+' ? l.v + rv : l.v - rv, pct: false };
      }
      return l;
    }
    var res = expr();
    if (p < t.length) throw new Error('syntax');
    return res.v;
  }

  function toPlain(n) {
    var r = parseFloat(n.toPrecision(12));
    if (Math.abs(r) < 1e-12) r = 0;
    var s = String(r);
    if (s.indexOf('e') > -1) s = r.toFixed(12).replace(/\.?0+$/, '');
    return s.replace('-', '−');
  }

  function compute(s) {
    var v = evaluate(s);
    if (!isFinite(v) || Math.abs(v) >= 1e15) throw new Error('big');
    return toPlain(v);
  }

  function stripTail(s) {
    while (s.length && '+−×÷√'.indexOf(s.charAt(s.length - 1)) > -1) s = s.slice(0, -1);
    return s;
  }
  function hasCalc(s) {
    return /[+−×÷²%√]/.test(s.charAt(0) === '−' ? s.slice(1) : s);
  }

  function resetAll() { state.expr = ''; state.lastExpr = ''; state.done = false; state.err = ''; }

  function curNumber() { return /(\d*\.?\d*)$/.exec(state.expr)[1]; }
  function lastChar() { return state.expr.slice(-1); }

  function digit(d) {
    if (state.done) { state.expr = ''; state.done = false; }
    var cur = curNumber(), last = lastChar();
    if (last === '²' || last === '%') { state.expr += '×'; cur = ''; }
    if (cur.replace('.', '').length >= 15) return;
    if (cur === '0') state.expr = state.expr.slice(0, -1);
    state.expr += d;
  }
  function dot() {
    if (state.done) { state.expr = ''; state.done = false; }
    var last = lastChar(), cur = curNumber();
    if (last === '²' || last === '%') { state.expr += '×'; cur = ''; }
    if (cur.indexOf('.') > -1) return;
    if (cur === '') state.expr += '0';
    state.expr += '.';
  }
  function op(o) {
    state.done = false;
    var last = lastChar();
    if (state.expr === '') { if (o === '−') state.expr = '−'; return; }
    if (last === '√') return;
    if (BIN.indexOf(last) > -1) {
      if (state.expr.length === 1) return;
      state.expr = state.expr.slice(0, -1) + o;
      return;
    }
    state.expr += o;
  }
  function post(sym) {
    var last = lastChar();
    if (state.expr === '' || !/[0-9²%]/.test(last)) return;
    state.done = false;
    state.expr += sym;
  }
  function root() {
    if (state.done) { state.expr = '√' + state.expr; state.done = false; return; }
    var last = lastChar();
    if (state.expr === '' || '+−×÷√'.indexOf(last) > -1) state.expr += '√';
    else state.expr += '×√';
  }
  function equals() {
    if (state.done) return null;
    var e = stripTail(state.expr);
    if (!hasCalc(e)) return null;
    try {
      var r = compute(e);
      state.lastExpr = e;
      state.expr = r;
      state.done = true;
      return { expr: e, result: r };
    } catch (err) {
      state.err = err.message === 'div0' ? 'Tidak bisa dibagi nol'
                : err.message === 'sqrt' ? 'Akar bilangan negatif tidak valid'
                : err.message === 'big'  ? 'Angka terlalu besar'
                : 'Format tidak valid';
      return null;
    }
  }

  var KEYOPS = { '+': '+', '-': '−', '*': '×', '/': '÷' };
  function handle(k) {
    if (state.err) resetAll();
    if (k === 'ac') { resetAll(); return null; }
    if (k === 'del') { state.done = false; state.expr = state.expr.slice(0, -1); return null; }
    if (k === '=') return equals();
    if (state.expr.length >= 60) return null;
    if (/^[0-9]$/.test(k)) digit(k);
    else if (k === '.') dot();
    else if (KEYOPS[k]) op(KEYOPS[k]);
    else if (k === '%') post('%');
    else if (k === 'sq') post('²');
    else if (k === 'rt') root();
    return null;
  }

  function pretty(s) { return s.replace(/([0-9²%])([+−×÷])/g, '$1 $2 '); }

  /* Teks untuk baris besar (hasil langsung) */
  function liveText() {
    var s = stripTail(state.expr);
    if (s === '') return { text: '0', dim: !state.expr };
    if (!hasCalc(s)) return { text: s, dim: false };
    try { return { text: compute(s), dim: false }; }
    catch (e) { return { text: '—', dim: true }; }
  }
  /* ===== LOGIC END ===== */

  if (typeof document === 'undefined') {            /* mode uji di Node */
    if (typeof module !== 'undefined') module.exports = { evaluate: evaluate, compute: compute, handle: handle, state: state, resetAll: resetAll, liveText: liveText };
    return;
  }

  /* ===== UI ===== */
  var $ = function (id) { return document.getElementById(id); };
  var exprEl = $('expression'), resEl = $('result'), keypad = $('keypad');
  var listEl = $('historyList'), panel = $('history'), scrim = $('scrim');
  var toggleBtn = $('historyToggle');
  var history = [];

  function store(key, val) { try { localStorage.setItem(key, val); } catch (e) {} }
  function load(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }

  function render() {
    var text, cls = 'result';
    if (state.err) {
      exprEl.textContent = pretty(state.expr);
      text = state.err; cls += ' error';
    } else if (state.done) {
      exprEl.textContent = pretty(state.lastExpr) + ' =';
      text = state.expr;
    } else {
      exprEl.textContent = pretty(state.expr);
      var lv = liveText();
      text = lv.text;
      if (lv.dim) cls += ' dim';
    }
    if (!state.err) {
      var n = text.length;
      cls += n > 14 ? ' xs' : n > 10 ? ' sm' : n > 7 ? ' md' : '';
    }
    resEl.className = cls;
    resEl.textContent = text;
    exprEl.scrollLeft = exprEl.scrollWidth;
  }

  function renderHistory() {
    listEl.textContent = '';
    if (!history.length) {
      var li = document.createElement('li');
      li.className = 'h-empty';
      li.textContent = 'Belum ada perhitungan. Hasil yang Anda hitung akan muncul di sini.';
      listEl.appendChild(li);
      return;
    }
    history.forEach(function (h, i) {
      var li = document.createElement('li');
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'h-item'; b.dataset.i = i;
      var e = document.createElement('span'); e.className = 'h-expr'; e.textContent = pretty(h.expr) + ' =';
      var r = document.createElement('span'); r.className = 'h-res'; r.textContent = h.result;
      b.appendChild(e); b.appendChild(r);
      li.appendChild(b);
      listEl.appendChild(li);
    });
  }

  function saveHistory() { store('neoncalc.history', JSON.stringify(history)); }

  function press(k) {
    var done = handle(k);
    if (done) {
      history.unshift(done);
      if (history.length > 50) history.pop();
      saveHistory();
      renderHistory();
      listEl.scrollTop = 0;
    }
    render();
    try { if (navigator.vibrate) navigator.vibrate(8); } catch (e) {}
  }

  function flash(btn) {
    if (!btn) return;
    btn.classList.remove('pulse');
    void btn.offsetWidth;
    btn.classList.add('pulse');
  }

  keypad.addEventListener('click', function (e) {
    var btn = e.target.closest('.key');
    if (!btn) return;
    flash(btn);
    press(btn.dataset.k);
  });
  keypad.addEventListener('animationend', function (e) {
    if (e.target.classList) e.target.classList.remove('pulse');
  });

  /* Riwayat */
  listEl.addEventListener('click', function (e) {
    var b = e.target.closest('.h-item');
    if (!b) return;
    var h = history[+b.dataset.i];
    if (!h) return;
    state.err = '';
    state.lastExpr = h.expr;
    state.expr = h.result;
    state.done = true;
    render();
    closePanel();
  });
  $('clearHistory').addEventListener('click', function () {
    history = [];
    saveHistory();
    renderHistory();
  });

  function openPanel() {
    panel.classList.add('open'); scrim.classList.add('open');
    toggleBtn.setAttribute('aria-expanded', 'true');
  }
  function closePanel() {
    panel.classList.remove('open'); scrim.classList.remove('open');
    toggleBtn.setAttribute('aria-expanded', 'false');
  }
  toggleBtn.addEventListener('click', function () {
    panel.classList.contains('open') ? closePanel() : openPanel();
  });
  $('closeHistory').addEventListener('click', closePanel);
  scrim.addEventListener('click', closePanel);

  /* Tema */
  var root_ = document.documentElement;
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  function setTheme(t) {
    root_.setAttribute('data-theme', t);
    if (themeMeta) themeMeta.setAttribute('content', t === 'dark' ? '#03050a' : '#e7eefb');
    store('neoncalc.theme', t);
  }
  $('themeToggle').addEventListener('click', function () {
    setTheme(root_.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });

  /* Keyboard */
  var KEYMAP = {
    '+': '+', '-': '-', '*': '*', 'x': '*', 'X': '*', '/': '/', '%': '%', '.': '.', ',': '.',
    '=': '=', 'Enter': '=', 'Backspace': 'del', 'Escape': 'ac', 'Delete': 'ac',
    '^': 'sq', 'r': 'rt', 'R': 'rt'
  };
  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var k = e.key;
    if (k === 'Escape' && panel.classList.contains('open')) { closePanel(); return; }
    var t = e.target;
    if (k === 'Enter' && t && t.closest && t.closest('button') && !t.closest('.keypad')) return;
    var code = /^[0-9]$/.test(k) ? k : KEYMAP[k];
    if (!code) return;
    e.preventDefault();
    flash(keypad.querySelector('[data-k="' + code + '"]'));
    press(code);
  });

  /* Mulai */
  var saved = load('neoncalc.theme');
  if (saved === 'light' || saved === 'dark') setTheme(saved);
  try {
    var h = JSON.parse(load('neoncalc.history') || '[]');
    if (Array.isArray(h)) history = h.filter(function (x) { return x && typeof x.expr === 'string' && typeof x.result === 'string'; }).slice(0, 50);
  } catch (e) { history = []; }
  renderHistory();
  render();
})();
