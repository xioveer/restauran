/* ===========================================================
   RESTAURANTE LOCO - Núcleo: estado, nube, economía, simulación
   =========================================================== */
(function () {
  'use strict';
  const D = window.RL_DATA;
  const RL = window.RL = { D: D, S: null, R: null, ACT: {}, vistas: {}, sucio: false };

  /* ---------- Utilidades ---------- */
  RL.$ = function (s, el) { return (el || document).querySelector(s); };
  RL.$$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  RL.fmt = function (n) { return Math.round(n).toLocaleString('es-CO'); };
  RL.rand = function (a, b) { return a + Math.random() * (b - a); };
  RL.randInt = function (a, b) { return Math.floor(a + Math.random() * (b - a + 1)); };
  RL.pick = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };
  RL.clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  RL.esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  RL.shuffle = function (arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  };
  RL.hoy = function () {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  };
  RL.marcar = function (k) { if (RL.R) RL.R.dirty[k] = true; };

  /* ---------- Sonido ---------- */
  let actx = null;
  function beep(f, d, type, vol, delay) {
    if (RL.S && RL.S.sonido === false) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      actx = actx || new AC();
      const t0 = actx.currentTime + (delay || 0);
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = type || 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(vol || 0.05, t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
      o.connect(g); g.connect(actx.destination);
      o.start(t0); o.stop(t0 + d + 0.02);
    } catch (e) { /* sin audio */ }
  }
  RL.sfx = {
    click: function () { beep(520, 0.05, 'triangle', 0.04); },
    pop: function () { beep(700, 0.06, 'square', 0.04); },
    ok: function () { beep(660, 0.08, 'triangle', 0.06); beep(990, 0.1, 'triangle', 0.06, 0.07); },
    coin: function () { beep(880, 0.07, 'square', 0.05); beep(1320, 0.12, 'square', 0.05, 0.07); },
    bad: function () { beep(180, 0.18, 'sawtooth', 0.06); },
    nivel: function () { [523, 659, 784, 1047].forEach(function (f, i) { beep(f, 0.16, 'triangle', 0.07, i * 0.1); }); }
  };

  /* ---------- Avisos y modales ---------- */
  RL.toast = function (msg, tipo) {
    const cont = RL.$('#toasts');
    if (!cont) return;
    const t = document.createElement('div');
    t.className = 'toast ' + (tipo || '');
    t.textContent = msg;
    cont.appendChild(t);
    while (cont.children.length > 3) cont.removeChild(cont.firstChild);
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 2600);
  };

  let modalActual = null;
  const modalCola = [];
  function abrirModal(o) {
    const fondo = RL.$('#modal');
    fondo.innerHTML = '';
    const box = document.createElement('div');
    box.className = 'modal' + (o.ancho ? ' ancho' : '');
    box.innerHTML = (o.titulo ? '<h2>' + o.titulo + '</h2>' : '') + (o.html || '');
    if (o.botones && o.botones.length) {
      const ac = document.createElement('div');
      ac.className = 'modal-acciones';
      o.botones.forEach(function (b) {
        const bt = document.createElement('button');
        bt.type = 'button';
        bt.className = 'btn ' + (b.cls || 'btn-mango');
        bt.innerHTML = b.txt;
        bt.addEventListener('click', function () {
          RL.sfx.click();
          if (b.cerrar !== false) RL.cerrarModal();
          if (b.fn) b.fn();
        });
        ac.appendChild(bt);
      });
      box.appendChild(ac);
    }
    fondo.appendChild(box);
    fondo.classList.remove('oculto');
    modalActual = o;
    return box;
  }
  RL.modal = function (o) {
    if (modalActual && !o.forzar) { modalCola.push(o); return null; }
    return abrirModal(o);
  };
  RL.cerrarModal = function () {
    const fondo = RL.$('#modal');
    fondo.classList.add('oculto');
    fondo.innerHTML = '';
    const o = modalActual;
    modalActual = null;
    if (o && o.onClose) o.onClose();
    if (modalCola.length) abrirModal(modalCola.shift());
  };
  RL.hayModal = function () { return !!modalActual; };
  RL.initModal = function () {
    const fondo = RL.$('#modal');
    fondo.addEventListener('click', function (e) {
      if (e.target === fondo && modalActual && modalActual.cerrable !== false) RL.cerrarModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modalActual && modalActual.cerrable !== false) RL.cerrarModal();
    });
  };

  /* ---------- Avatar (SVG) ---------- */
  function opcion(cat, id) {
    const l = D.COSM[cat];
    for (let i = 0; i < l.length; i++) if (l[i].id === id) return l[i];
    return l[0];
  }
  RL.avatarSVG = function (av) {
    const T = '#1E2A4A';
    const piel = opcion('piel', av.piel).c;
    const pelo = opcion('colorPelo', av.colorPelo).c;
    const camisa = opcion('camisa', av.camisa).c;
    const delantal = opcion('delantal', av.delantal).c;
    const st = 'stroke="' + T + '" stroke-width="2.5" stroke-linejoin="round"';
    let back = '', hairTop = '', hat = '', acc = '';
    if (av.pelo === 'largo') back += '<path d="M21 48 Q18 92 30 98 L70 98 Q82 92 79 48 Z" fill="' + pelo + '" ' + st + '/>';
    if (av.pelo === 'rizos') {
      [[24, 40], [21, 56], [27, 70], [76, 40], [79, 56], [73, 70], [50, 20], [35, 25], [65, 25]].forEach(function (p) {
        back += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="11" fill="' + pelo + '" ' + st + '/>';
      });
    }
    if (av.pelo === 'trenzas') back += '<ellipse cx="21" cy="74" rx="7" ry="20" fill="' + pelo + '" ' + st + '/><ellipse cx="79" cy="74" rx="7" ry="20" fill="' + pelo + '" ' + st + '/>';
    if (av.pelo === 'mono') back += '<circle cx="50" cy="14" r="10" fill="' + pelo + '" ' + st + '/>';
    hairTop = '<path d="M24 46 Q22 20 50 20 Q78 20 76 46 Q66 32 50 33 Q34 32 24 46 Z" fill="' + pelo + '" ' + st + '/>';
    if (av.gorro === 'chef') {
      hat = '<g fill="#fff" ' + st + '><rect x="30" y="16" width="40" height="14" rx="4"/><circle cx="34" cy="12" r="10"/><circle cx="50" cy="7" r="11"/><circle cx="66" cy="12" r="10"/></g>';
    } else if (av.gorro === 'gorra') {
      hat = '<path d="M24 38 Q26 13 50 13 Q74 13 76 38 Z" fill="#FF6B57" ' + st + '/><path d="M52 36 Q78 33 90 42 Q70 45 52 42 Z" fill="#E4503D" ' + st + '/>';
    } else if (av.gorro === 'panuelo') {
      hat = '<path d="M23 40 Q50 14 77 40 L77 31 Q50 4 23 31 Z" fill="' + delantal + '" ' + st + '/><circle cx="40" cy="26" r="2.5" fill="#fff"/><circle cx="52" cy="22" r="2.5" fill="#fff"/><circle cx="63" cy="27" r="2.5" fill="#fff"/>';
    } else if (av.gorro === 'vueltiao') {
      hat = '<ellipse cx="50" cy="30" rx="42" ry="10" fill="#EBD9A8" ' + st + '/><path d="M30 30 Q30 6 50 6 Q70 6 70 30 Z" fill="#EBD9A8" ' + st + '/><path d="M32 22 H68 M31 26 H69" stroke="' + T + '" stroke-width="2.5" fill="none"/>';
    }
    if (av.acc === 'gafas') acc = '<g fill="rgba(255,255,255,.35)" stroke="' + T + '" stroke-width="2.5"><circle cx="40" cy="50" r="8"/><circle cx="60" cy="50" r="8"/><path d="M48 50 H52" fill="none"/></g>';
    if (av.acc === 'lazo') acc = '<g ' + st + ' fill="#FF6B8A"><path d="M28 26 L16 19 L16 34 Z"/><path d="M28 26 L40 19 L40 34 Z"/><circle cx="28" cy="26" r="4.5"/></g>';
    if (av.acc === 'aretes') acc = '<circle cx="24" cy="63" r="4" fill="#FFC83D" ' + st + '/><circle cx="76" cy="63" r="4" fill="#FFC83D" ' + st + '/>';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 110">' + back +
      '<path d="M12 110 Q12 80 50 76 Q88 80 88 110 Z" fill="' + camisa + '" ' + st + '/>' +
      '<path d="M31 110 L36 84 Q50 93 64 84 L69 110 Z" fill="' + delantal + '" ' + st + '/>' +
      '<rect x="44" y="96" width="12" height="9" rx="3" fill="rgba(255,255,255,.35)"/>' +
      '<rect x="43" y="64" width="14" height="15" rx="5" fill="' + piel + '" ' + st + '/>' +
      '<circle cx="24" cy="52" r="5" fill="' + piel + '" ' + st + '/><circle cx="76" cy="52" r="5" fill="' + piel + '" ' + st + '/>' +
      '<circle cx="50" cy="48" r="26" fill="' + piel + '" ' + st + '/>' +
      hairTop +
      '<circle cx="40" cy="50" r="3.3" fill="' + T + '"/><circle cx="60" cy="50" r="3.3" fill="' + T + '"/>' +
      '<circle cx="41.2" cy="48.8" r="1.1" fill="#fff"/><circle cx="61.2" cy="48.8" r="1.1" fill="#fff"/>' +
      '<circle cx="33" cy="58" r="4.5" fill="#FF8FA3" opacity=".55"/><circle cx="67" cy="58" r="4.5" fill="#FF8FA3" opacity=".55"/>' +
      '<path d="M43 60 Q50 67 57 60" stroke="' + T + '" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
      acc + hat + '</svg>';
  };

  /* ---------- Estado inicial ---------- */
  RL.normalizarClave = function (nombre) {
    let k = nombre.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    if (!k) k = 'j_' + encodeURIComponent(nombre.toLowerCase()).replace(/%/g, '').slice(0, 30);
    return k;
  };

  function nuevoEstado(nombre, clave) {
    const recetas = {}, despensa = {};
    D.REC_LISTA.forEach(function (r) {
      if (r.gratis) {
        recetas[r.id] = true;
        Object.keys(r.ing).forEach(function (i) { despensa[i] = 10; });
      }
    });
    return {
      v: 1, nombre: nombre, clave: clave, restaurante: 'Restaurante de ' + nombre,
      creado: Date.now(), actualizado: Date.now(),
      monedas: 220, xp: 0, nivel: 1, puntaje: 0,
      recetas: recetas, despensa: despensa, listos: [], equipo: [], idStaff: 1,
      mejoras: { estufa: 1, freidora: 1, horno: 1, licuadora: 1, cuchillos: 1, nevera: 1 },
      mesas: 2,
      decor: { piso: 'piso0', pared: 'pared0', luces: 'luz0', plantas: 'pl0', cuadros: 'cu0' },
      decorPoseido: { piso0: 1, pared0: 1, luz0: 1, pl0: 1, cu0: 1 },
      avatar: JSON.parse(JSON.stringify(D.AVATAR_INICIAL)), cosmeticos: {},
      stats: { clientes: 0, platos: 0, cobros: 0, perdidos: 0, ventas: 0, propinas: 0, cocinados: 0, minijuegos: 0, compras: 0 },
      mini: { corte: 0, caja: 0, vuelo: 0 },
      regalo: { ultimo: '', racha: 0 }, oferta: { pasillo: '', hasta: 0 },
      sonido: true, tutorial: false
    };
  }
  RL.nuevoEstado = nuevoEstado;

  function normalizarEstado(s) {
    const base = nuevoEstado(s.nombre || 'Jugadora', s.clave || 'jugadora');
    Object.keys(base).forEach(function (k) { if (s[k] === undefined) s[k] = base[k]; });
    ['stats', 'mini', 'mejoras', 'decor', 'avatar'].forEach(function (k) {
      Object.keys(base[k]).forEach(function (kk) { if (s[k][kk] === undefined) s[k][kk] = base[k][kk]; });
    });
    if (!Array.isArray(s.listos)) s.listos = [];
    if (!Array.isArray(s.equipo)) s.equipo = [];
    return s;
  }

  /* ---------- Guardado local y en la nube ---------- */
  const cfg = window.RL_CONFIG || {};
  RL.nube = { activa: !!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY), estado: 'local', ultimo: 0 };
  const LS = 'rl:';

  function nubeFetch(ruta, opts) {
    opts = opts || {};
    const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const to = setTimeout(function () { if (ctl) ctl.abort(); }, 9000);
    const h = {
      apikey: cfg.SUPABASE_ANON_KEY, Authorization: 'Bearer ' + cfg.SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    };
    if (opts.headers) Object.keys(opts.headers).forEach(function (k) { h[k] = opts.headers[k]; });
    return fetch(cfg.SUPABASE_URL.replace(/\/$/, '') + '/rest/v1/' + ruta, {
      method: opts.method || 'GET', headers: h, body: opts.body, keepalive: !!opts.keepalive,
      signal: ctl ? ctl.signal : undefined
    }).then(function (r) { clearTimeout(to); return r; }, function (e) { clearTimeout(to); throw e; });
  }

  RL.nubeCargar = function (clave) {
    if (!RL.nube.activa) return Promise.resolve(null);
    return nubeFetch('jugadoras?clave=eq.' + encodeURIComponent(clave) + '&select=datos,actualizado').then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (rows) {
      RL.nube.estado = 'nube';
      return rows && rows.length ? rows[0].datos : null;
    }).catch(function () { RL.nube.estado = 'error'; return null; });
  };

  RL.nubeGuardar = function (S, keepalive) {
    if (!RL.nube.activa || !S) return Promise.resolve(false);
    const cuerpo = JSON.stringify({
      clave: S.clave, nombre: S.nombre, restaurante: S.restaurante, nivel: S.nivel,
      puntaje: Math.round(S.puntaje), datos: S, actualizado: new Date().toISOString()
    });
    return nubeFetch('jugadoras?on_conflict=clave', {
      method: 'POST', body: cuerpo, keepalive: keepalive && cuerpo.length < 60000,
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }
    }).then(function (r) {
      RL.nube.estado = r.ok ? 'nube' : 'error';
      if (r.ok) { RL.nube.ultimo = Date.now(); RL.sucio = false; }
      RL.marcar('hud');
      return r.ok;
    }).catch(function () { RL.nube.estado = 'error'; RL.marcar('hud'); return false; });
  };

  RL.nubeRanking = function () {
    if (!RL.nube.activa) return Promise.resolve(null);
    return nubeFetch('jugadoras?select=nombre,restaurante,nivel,puntaje,clave&order=puntaje.desc&limit=20').then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).catch(function () { return null; });
  };

  RL.localCargar = function (clave) {
    try {
      const t = localStorage.getItem(LS + clave);
      return t ? JSON.parse(t) : null;
    } catch (e) { return null; }
  };
  RL.localLista = function () {
    const out = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.indexOf(LS) === 0) {
          const d = JSON.parse(localStorage.getItem(k));
          if (d && d.nombre) out.push({ nombre: d.nombre, nivel: d.nivel, puntaje: d.puntaje || 0, clave: d.clave, actualizado: d.actualizado || 0, restaurante: d.restaurante });
        }
      }
    } catch (e) { /* nada */ }
    return out.sort(function (a, b) { return b.actualizado - a.actualizado; });
  };
  RL.guardarLocal = function () {
    const S = RL.S;
    if (!S) return;
    S.actualizado = Date.now();
    try { localStorage.setItem(LS + S.clave, JSON.stringify(S)); } catch (e) { /* lleno */ }
  };
  RL.guardar = function (forzarNube, keepalive) {
    if (!RL.S) return;
    RL.guardarLocal();
    RL.sucio = true;
    if (RL.nube.activa && (forzarNube || Date.now() - RL.nube.ultimo > 20000)) {
      RL.nube.ultimo = Date.now();
      RL.nubeGuardar(RL.S, keepalive);
    }
  };
  RL.borrarLocal = function (clave) { try { localStorage.removeItem(LS + clave); } catch (e) { /* nada */ } };

  RL.cargarJugadora = function (nombre) {
    const clave = RL.normalizarClave(nombre);
    const local = RL.localCargar(clave);
    return RL.nubeCargar(clave).then(function (remoto) {
      let s = null;
      if (local && remoto) s = (remoto.actualizado || 0) > (local.actualizado || 0) ? remoto : local;
      else s = remoto || local;
      if (s) { s.nombre = s.nombre || nombre; s.clave = clave; return normalizarEstado(s); }
      return nuevoEstado(nombre, clave);
    });
  };

  /* ---------- Runtime ---------- */
  RL.crearRuntime = function () {
    RL.R = {
      mesas: new Array(D.MAX_MESAS).fill(null), spawnT: 2.5, idCliente: 1, cart: {},
      cooking: null, staffRT: {}, dirty: { hud: true, salon: true, tabs: true }, tab: 'salon',
      pausaManual: false, tick: 0, hudT: 0, guardaT: 0
    };
  };

  /* ---------- Economía y reglas ---------- */
  RL.ap = function (n) { return RL.S.mejoras[n] || 1; };
  RL.capacidad = function () { return D.NEVERA_CAP[RL.ap('nevera') - 1]; };
  RL.stock = function (id) { return RL.S.despensa[id] || 0; };
  RL.encanto = function () {
    let e = 0;
    Object.keys(D.DECOR).forEach(function (cat) {
      const it = D.DECOR[cat].items.filter(function (x) { return x.id === RL.S.decor[cat]; })[0];
      if (it) e += it.enc;
    });
    return e;
  };
  RL.xpNecesaria = function (n) { return Math.round(40 + 30 * Math.pow(n - 1, 1.3)); };
  RL.mult = function (q) { return 0.7 + (q / 100) * 0.7; };
  RL.estrellas = function (q) { return q >= 85 ? 3 : q >= 60 ? 2 : 1; };
  RL.estrellasTxt = function (q) { const n = RL.estrellas(q); return '★'.repeat(n) + '☆'.repeat(3 - n); };
  RL.precioPlato = function (rid, q) { return Math.max(1, Math.round(D.REC[rid].precio * RL.mult(q))); };

  RL.ganar = function (n) {
    RL.S.monedas += n;
    RL.marcar('hud');
    if (n > 0) RL.pulso = 'monedas';
  };
  RL.gastar = function (n) {
    if (RL.S.monedas < n) { RL.sfx.bad(); RL.toast('Te faltan ' + RL.fmt(n - RL.S.monedas) + ' monedas', 'mal'); return false; }
    RL.S.monedas -= n;
    RL.marcar('hud');
    return true;
  };

  RL.ganarXP = function (n) {
    const S = RL.S;
    if (S.nivel >= D.MAX_NIVEL) { RL.marcar('hud'); return; }
    S.xp += Math.round(n);
    while (S.nivel < D.MAX_NIVEL && S.xp >= RL.xpNecesaria(S.nivel)) {
      S.xp -= RL.xpNecesaria(S.nivel);
      S.nivel++;
      subirNivel();
    }
    RL.marcar('hud');
  };
  function subirNivel() {
    const S = RL.S, n = S.nivel;
    const bono = 50 + n * 25;
    S.monedas += bono;
    S.puntaje += n * 50;
    RL.sfx.nivel();
    const nuevas = D.REC_LISTA.filter(function (r) { return r.nivel === n && !r.gratis; });
    const zona = D.ZONAS.filter(function (z) { return z.nivel === n && z.id > 0; })[0];
    const roles = Object.keys(D.ROLES).filter(function (k) { return D.ROLES[k].nivelReq === n; });
    let html = '<div class="nivel-grande">' + n + '</div><p class="centro">¡Tu restaurante subió de nivel!</p>' +
      '<p class="centro" style="margin-top:6px">Premio: <b>' + RL.fmt(bono) + ' 🪙</b></p>';
    if (zona) html += '<div class="card centro" style="margin-top:10px">' + zona.emoji + ' <b>Nueva zona: ' + zona.nombre + '</b><br><small>Ya puedes comprar mesas allí.</small></div>';
    if (roles.length) html += '<div class="card centro" style="margin-top:10px">' + roles.map(function (k) { return D.ROLES[k].emoji + ' ' + D.ROLES[k].n; }).join(', ') + '<br><small>Ya puedes contratar este puesto.</small></div>';
    if (nuevas.length) html += '<div class="card centro" style="margin-top:10px"><b>' + nuevas.length + ' recetas nuevas para desbloquear</b><br><span style="font-size:1.5rem">' + nuevas.slice(0, 12).map(function (r) { return r.emoji; }).join(' ') + '</span></div>';
    RL.modal({ titulo: '¡Subiste de nivel!', html: html, botones: [{ txt: '¡Seguir cocinando!', cls: 'btn-mango' }] });
    RL.marcar('tabs'); RL.marcar('salon');
    RL.guardar(true);
  }

  RL.faltan = function (rec, veces) {
    veces = veces || 1;
    const out = [];
    Object.keys(rec.ing).forEach(function (id) {
      const need = rec.ing[id] * veces, have = RL.stock(id);
      if (have < need) out.push({ id: id, falta: need - have });
    });
    return out;
  };
  RL.consumir = function (rec) {
    Object.keys(rec.ing).forEach(function (id) { RL.S.despensa[id] = (RL.S.despensa[id] || 0) - rec.ing[id]; });
  };
  RL.recetasPropias = function () {
    return D.REC_LISTA.filter(function (r) { return RL.S.recetas[r.id]; });
  };
  RL.precioIng = function (id) {
    const base = D.ING[id].precio, S = RL.S;
    if (S.oferta && S.oferta.pasillo === D.ING[id].pasillo && S.oferta.hasta > Date.now()) return Math.max(1, Math.round(base * 0.7 * 10) / 10);
    return base;
  };

  /* ---------- Clientes ---------- */
  const TIPOS = {
    normal:  { n: 'Normal',  pac: 1,   tip: 1 },
    apurado: { n: 'Apurado', pac: 0.6, tip: 1.6 },
    gourmet: { n: 'Gourmet', pac: 1.1, tip: 1.3 },
    vip:     { n: 'VIP',     pac: 1.3, tip: 2.2 }
  };
  RL.TIPOS = TIPOS;

  function intervaloSpawn() {
    const S = RL.S;
    const base = Math.max(5, 16 - S.nivel * 0.5 - RL.encanto() * 0.12);
    return base * (0.7 + Math.random() * 0.6);
  }

  RL.spawnCliente = function () {
    const S = RL.S, R = RL.R;
    const libres = [];
    for (let i = 0; i < S.mesas; i++) if (!R.mesas[i]) libres.push(i);
    if (!libres.length) return false;
    const propias = RL.recetasPropias();
    if (!propias.length) return false;
    const idx = RL.pick(libres);
    const zona = Math.floor(idx / D.MESAS_POR_ZONA);
    let tipo = 'normal';
    const r = Math.random();
    if (zona >= 2 && r < 0.35) tipo = 'vip';
    else if (r < 0.25) tipo = 'apurado';
    else if (S.nivel >= 3 && r > 0.85) tipo = 'gourmet';
    let n;
    const q = Math.random();
    if (S.nivel < 3) n = q < 0.6 ? 1 : q < 0.95 ? 2 : 3;
    else n = q < 0.4 ? 1 : q < 0.8 ? 2 : 3;
    if (tipo === 'gourmet') n = Math.max(2, n);
    const pedido = [];
    for (let k = 0; k < n; k++) pedido.push({ rid: RL.pick(propias).id, ok: false, q: 0 });
    const pacMax = (Math.max(55, 95 - S.nivel * 2.5) * TIPOS[tipo].pac) + RL.encanto() * 0.6;
    R.mesas[idx] = {
      id: R.idCliente++, emoji: RL.pick(D.CLIENTES_EMOJI), tipo: tipo, estado: 'esperando',
      pedido: pedido, pac: pacMax, pacMax: pacMax, t: 0, moodFinal: 1, cuenta: 0, pago: null, llegada: Date.now()
    };
    S.stats.clientes++;
    RL.marcar('salon'); RL.marcar('tabs');
    return true;
  };

  RL.hayPlato = function (rid) {
    return RL.S.listos.some(function (p) { return p.rid === rid; });
  };
  RL.servir = function (mi, ii, silencioso) {
    const S = RL.S, R = RL.R, c = R.mesas[mi];
    if (!c || c.estado !== 'esperando') return false;
    const it = c.pedido[ii];
    if (!it || it.ok) return false;
    let best = -1;
    S.listos.forEach(function (p, k) { if (p.rid === it.rid && (best < 0 || p.q > S.listos[best].q)) best = k; });
    if (best < 0) return false;
    const plato = S.listos.splice(best, 1)[0];
    it.ok = true; it.q = plato.q;
    S.stats.platos++;
    RL.ganarXP(3 + Math.round(plato.q / 12));
    if (!silencioso) RL.sfx.ok();
    if (c.pedido.every(function (x) { return x.ok; })) {
      c.estado = 'comiendo'; c.t = 4; c.moodFinal = RL.clamp(c.pac / c.pacMax, 0, 1);
    }
    RL.marcar('salon'); RL.marcar('cocina'); RL.marcar('tabs');
    return true;
  };

  RL.calcCuenta = function (c) {
    return c.pedido.reduce(function (s, it) { return s + (it.ok ? RL.precioPlato(it.rid, it.q) : 0); }, 0);
  };

  function prepararPago(c) {
    const cuenta = RL.calcCuenta(c);
    c.cuenta = cuenta;
    const r = Math.random();
    const billetes = [10, 20, 50, 100, 200, 500];
    if (r < 0.25) c.pago = { modo: 'tarjeta', dado: cuenta };
    else if (r < 0.35) c.pago = { modo: 'exacto', dado: cuenta };
    else {
      const op = billetes.filter(function (b) { return b >= cuenta; });
      let b;
      if (!op.length) b = Math.ceil(cuenta / 100) * 100 + (Math.random() < 0.5 ? 0 : 100);
      else b = op[Math.min(op.length - 1, Math.random() < 0.6 ? 0 : 1)];
      c.pago = b === cuenta ? { modo: 'exacto', dado: cuenta } : { modo: 'efectivo', dado: b };
    }
  }
  RL.devueltaNecesaria = function (c) { return c.pago.dado - c.cuenta; };

  RL.cobrar = function (mi, opts) {
    opts = opts || {};
    const S = RL.S, R = RL.R, c = R.mesas[mi];
    if (!c || c.estado !== 'pagar') return null;
    const mult = TIPOS[c.tipo].tip * (1 + RL.encanto() * 0.01);
    let propina = Math.round(c.cuenta * (0.04 + 0.22 * c.moodFinal) * mult);
    if (opts.auto) propina = Math.round(propina * 0.5);
    if (opts.perfecto) propina += 1 + Math.round(c.cuenta * 0.03);
    const mejor = c.pedido.reduce(function (s, it) { return s + RL.estrellas(it.q); }, 0);
    RL.ganar(c.cuenta + propina);
    S.puntaje += c.cuenta + propina * 2 + mejor * 5;
    S.stats.cobros++; S.stats.ventas += c.cuenta; S.stats.propinas += propina;
    RL.ganarXP(4);
    R.mesas[mi] = null;
    RL.sfx.coin();
    RL.toast('+' + RL.fmt(c.cuenta + propina) + ' 🪙' + (propina ? ' (propina ' + propina + ')' : ''), 'oro');
    RL.marcar('salon'); RL.marcar('tabs');
    RL.guardar();
    return { cuenta: c.cuenta, propina: propina };
  };

  function clienteSeVa(mi, razon) {
    const S = RL.S, R = RL.R, c = R.mesas[mi];
    if (!c) return;
    const servidos = c.pedido.filter(function (it) { return it.ok; });
    const base = RL.calcCuenta(c);
    const pago = Math.round(base * (razon === 'pago' ? 0.5 : 0.4));
    if (pago > 0) { RL.ganar(pago); S.puntaje += pago; }
    S.stats.perdidos++;
    R.mesas[mi] = null;
    RL.sfx.bad();
    RL.toast(c.emoji + ' se fue ' + (razon === 'pago' ? 'sin esperar la cuenta' : 'enojado') + (pago ? ' (dejó ' + pago + ' 🪙)' : ''), 'mal');
    RL.marcar('salon'); RL.marcar('tabs');
    return servidos;
  }

  /* ---------- Pedidos pendientes y personal ---------- */
  RL.pendientes = function () {
    const m = {};
    RL.R.mesas.forEach(function (c) {
      if (c && c.estado === 'esperando') c.pedido.forEach(function (it) { if (!it.ok) m[it.rid] = (m[it.rid] || 0) + 1; });
    });
    return m;
  };
  function enCocina(rid) {
    let n = 0;
    const R = RL.R;
    if (R.cooking && R.cooking.rid === rid) n++;
    Object.keys(R.staffRT).forEach(function (k) { const j = R.staffRT[k].job; if (j && j.rid === rid) n++; });
    return n;
  }
  RL.sinCubrir = function () {
    const pend = RL.pendientes(), out = {};
    Object.keys(pend).forEach(function (rid) {
      const listos = RL.S.listos.filter(function (p) { return p.rid === rid; }).length;
      const f = pend[rid] - listos - enCocina(rid);
      if (f > 0) out[rid] = f;
    });
    return out;
  };

  function tickStaff(dt) {
    const S = RL.S, R = RL.R;
    S.equipo.forEach(function (st) {
      const rt = R.staffRT[st.id] || (R.staffRT[st.id] = { t: 0, job: null });
      const n = st.nivel;
      rt.t += dt;
      if (st.rol === 'mesero') {
        if (rt.t >= 5.5 - 0.8 * (n - 1)) {
          rt.t = 0;
          const orden = [];
          R.mesas.forEach(function (c, i) { if (c && c.estado === 'esperando') orden.push(i); });
          orden.sort(function (a, b) { return R.mesas[a].llegada - R.mesas[b].llegada; });
          for (let k = 0; k < orden.length; k++) {
            const c = R.mesas[orden[k]];
            let hecho = false;
            for (let j = 0; j < c.pedido.length; j++) {
              if (!c.pedido[j].ok && RL.hayPlato(c.pedido[j].rid)) { RL.servir(orden[k], j, true); hecho = true; break; }
            }
            if (hecho) break;
          }
        }
      } else if (st.rol === 'cocinero') {
        if (rt.job) {
          rt.job.t += dt;
          if (rt.job.t >= rt.job.dur) {
            const q = RL.clamp(Math.round(58 + 8 * (n - 1) + Math.random() * 8), 0, 95);
            S.listos.push({ rid: rt.job.rid, q: q });
            S.stats.cocinados++;
            RL.ganarXP(2);
            rt.job = null; rt.t = 0;
            RL.marcar('salon'); RL.marcar('cocina'); RL.marcar('tabs');
          }
        } else if (rt.t >= 1) {
          rt.t = 0;
          const sc = RL.sinCubrir();
          const ids = Object.keys(sc);
          for (let k = 0; k < ids.length; k++) {
            const rec = D.REC[ids[k]];
            if (!RL.faltan(rec).length) {
              RL.consumir(rec);
              rt.job = { rid: rec.id, t: 0, dur: 15 - 2.2 * (n - 1) };
              RL.marcar('cocina');
              break;
            }
          }
        }
      } else if (st.rol === 'cajero') {
        if (rt.t >= 6 - (n - 1)) {
          rt.t = 0;
          for (let i = 0; i < R.mesas.length; i++) {
            if (R.mesas[i] && R.mesas[i].estado === 'pagar') { RL.cobrar(i, { auto: true }); break; }
          }
        }
      } else if (st.rol === 'compras') {
        if (rt.t >= 14 - 2 * (n - 1)) {
          rt.t = 0;
          const sc = RL.sinCubrir(), cap = RL.capacidad();
          let gasto = 0;
          Object.keys(sc).forEach(function (rid) {
            const rec = D.REC[rid];
            Object.keys(rec.ing).forEach(function (iid) {
              const need = rec.ing[iid] * sc[rid] - RL.stock(iid);
              if (need <= 0) return;
              const cant = Math.min(need, cap - RL.stock(iid));
              const costo = Math.ceil(cant * RL.precioIng(iid) * 1.15);
              if (cant > 0 && S.monedas >= costo) {
                S.monedas -= costo; S.despensa[iid] = RL.stock(iid) + cant; gasto += costo;
              }
            });
          });
          if (gasto) { RL.toast('🛒 Compras repuso ingredientes (-' + gasto + ' 🪙)'); RL.marcar('hud'); RL.marcar('cocina'); }
        }
      }
    });
  }

  RL.simActiva = function () {
    const R = RL.R;
    return R && RL.S && !R.pausaManual && R.tab !== 'super' && R.tab !== 'juegos';
  };

  RL.tickSim = function (dt) {
    const S = RL.S, R = RL.R;
    R.spawnT -= dt;
    if (R.spawnT <= 0) {
      R.spawnT = intervaloSpawn();
      RL.spawnCliente();
    }
    for (let i = 0; i < S.mesas; i++) {
      const c = R.mesas[i];
      if (!c) continue;
      if (c.estado === 'esperando') {
        c.pac -= dt;
        if (c.pac <= 0) clienteSeVa(i, 'espera');
      } else if (c.estado === 'comiendo') {
        c.t -= dt;
        if (c.t <= 0) { c.estado = 'pagar'; c.pac = 45; c.pacMax = 45; prepararPago(c); RL.sfx.pop(); RL.marcar('salon'); RL.marcar('tabs'); }
      } else if (c.estado === 'pagar') {
        c.pac -= dt;
        if (c.pac <= 0) clienteSeVa(i, 'pago');
      }
    }
    tickStaff(dt);
  };

  /* ---------- Compras de mejoras ---------- */
  RL.precioMesa = function (n) { return n < 2 ? 0 : Math.round(70 * Math.pow(1.42, n - 2) / 5) * 5; };

  RL.comprarMesa = function () {
    const S = RL.S;
    if (S.mesas >= D.MAX_MESAS) return { ok: false, msg: 'Ya tienes todas las mesas.' };
    const zona = D.ZONAS[Math.floor(S.mesas / D.MESAS_POR_ZONA)];
    if (S.nivel < zona.nivel) return { ok: false, msg: zona.nombre + ' se abre en el nivel ' + zona.nivel + '.' };
    if (!RL.gastar(RL.precioMesa(S.mesas))) return { ok: false, msg: '' };
    S.mesas++;
    RL.sfx.ok(); RL.marcar('salon'); RL.guardar();
    return { ok: true, msg: '¡Mesa nueva en ' + zona.nombre + '!' };
  };

  RL.desbloquearReceta = function (id) {
    const S = RL.S, r = D.REC[id];
    if (S.recetas[id]) return { ok: false, msg: 'Ya la tienes.' };
    if (S.nivel < r.nivel) return { ok: false, msg: 'Necesitas nivel ' + r.nivel + '.' };
    if (!RL.gastar(r.desbloqueo)) return { ok: false, msg: '' };
    S.recetas[id] = true;
    RL.sfx.ok(); RL.guardar();
    return { ok: true, msg: '¡Receta nueva: ' + r.nombre + '!' };
  };

  RL.mejorarAparato = function (id) {
    const S = RL.S, lvl = S.mejoras[id];
    if (lvl >= 5) return { ok: false, msg: 'Ya está al máximo.' };
    if (S.nivel < D.APARATO_NIVEL[lvl]) return { ok: false, msg: 'Necesitas nivel ' + D.APARATO_NIVEL[lvl] + '.' };
    if (!RL.gastar(D.APARATO_COSTO[lvl])) return { ok: false, msg: '' };
    S.mejoras[id] = lvl + 1;
    RL.sfx.ok(); RL.guardar();
    return { ok: true, msg: D.APARATOS[id].niveles[lvl] + ' instalada.' };
  };

  RL.comprarDecor = function (cat, id) {
    const S = RL.S;
    const it = D.DECOR[cat].items.filter(function (x) { return x.id === id; })[0];
    if (!it) return { ok: false, msg: '' };
    if (!S.decorPoseido[id]) {
      if (S.nivel < it.nivel) return { ok: false, msg: 'Necesitas nivel ' + it.nivel + '.' };
      if (!RL.gastar(it.precio)) return { ok: false, msg: '' };
      S.decorPoseido[id] = 1;
    }
    S.decor[cat] = id;
    RL.sfx.ok(); RL.marcar('salon'); RL.guardar();
    return { ok: true, msg: it.n + ' puesto.' };
  };

  RL.costoContratar = function (rol) {
    const n = RL.S.equipo.filter(function (x) { return x.rol === rol; }).length;
    return Math.round(D.ROLES[rol].costo * Math.pow(1.8, n) / 5) * 5;
  };
  RL.contratar = function (rol) {
    const S = RL.S, R = D.ROLES[rol];
    const n = S.equipo.filter(function (x) { return x.rol === rol; }).length;
    if (S.nivel < R.nivelReq) return { ok: false, msg: 'Necesitas nivel ' + R.nivelReq + '.' };
    if (n >= R.max) return { ok: false, msg: 'Ya tienes el máximo de ' + R.n.toLowerCase() + 's.' };
    if (!RL.gastar(RL.costoContratar(rol))) return { ok: false, msg: '' };
    const av = {
      piel: RL.pick(D.COSM.piel).id, pelo: RL.pick(['corto', 'largo', 'mono']),
      colorPelo: RL.pick(D.COSM.colorPelo.slice(0, 4)).id,
      gorro: rol === 'cocinero' ? 'chef' : rol === 'compras' ? 'gorra' : 'ninguno',
      camisa: RL.pick(D.COSM.camisa.slice(0, 4)).id, delantal: RL.pick(D.COSM.delantal.slice(0, 4)).id,
      acc: rol === 'cajero' ? 'gafas' : 'ninguno'
    };
    const usados = S.equipo.map(function (x) { return x.nombre; });
    const libres = D.NOMBRES_STAFF.filter(function (x) { return usados.indexOf(x) < 0; });
    S.equipo.push({ id: S.idStaff++, rol: rol, nombre: RL.pick(libres.length ? libres : D.NOMBRES_STAFF), nivel: 1, av: av });
    RL.sfx.ok(); RL.guardar();
    return { ok: true, msg: '¡Nuevo ' + R.n.toLowerCase() + ' en el equipo!' };
  };
  RL.entrenar = function (id) {
    const S = RL.S;
    const st = S.equipo.filter(function (x) { return x.id === id; })[0];
    if (!st) return { ok: false, msg: '' };
    if (st.nivel >= D.STAFF_MAX_NIVEL) return { ok: false, msg: 'Ya está al máximo.' };
    const nx = st.nivel + 1;
    if (S.nivel < D.STAFF_NIVEL_REQ[nx]) return { ok: false, msg: 'Necesitas nivel ' + D.STAFF_NIVEL_REQ[nx] + '.' };
    if (!RL.gastar(D.STAFF_NIVEL_COSTO[nx])) return { ok: false, msg: '' };
    st.nivel = nx;
    RL.sfx.ok(); RL.guardar();
    return { ok: true, msg: st.nombre + ' subió a nivel ' + nx + '.' };
  };

  RL.tieneCosm = function (cat, id) {
    const it = opcion(cat, id);
    return it.precio === 0 || !!RL.S.cosmeticos[cat + ':' + id];
  };
  RL.elegirCosm = function (cat, id) {
    const S = RL.S, it = opcion(cat, id);
    if (!RL.tieneCosm(cat, id)) {
      if (!RL.gastar(it.precio)) return { ok: false, msg: '' };
      S.cosmeticos[cat + ':' + id] = 1;
    }
    S.avatar[cat] = id;
    RL.sfx.ok(); RL.marcar('hud'); RL.guardar();
    return { ok: true, msg: it.n + ' equipado.' };
  };
  RL.cosmOpcion = opcion;
})();
