/* ===========================================================
   RESTAURANTE LOCO - Interfaz principal: login, HUD, pestañas,
   salón, caja registradora y bucle del juego
   =========================================================== */
(function () {
  'use strict';
  const RL = window.RL, D = RL.D, $ = RL.$;

  const TABS = [
    { id: 'salon', ic: '🍽️', n: 'Salón' }, { id: 'cocina', ic: '👩‍🍳', n: 'Cocina' },
    { id: 'super', ic: '🛒', n: 'Súper' }, { id: 'recetas', ic: '📖', n: 'Recetas' },
    { id: 'mejoras', ic: '🏗️', n: 'Mejoras' }, { id: 'equipo', ic: '👥', n: 'Equipo' },
    { id: 'juegos', ic: '🎮', n: 'Juegos' }, { id: 'perfil', ic: '👤', n: 'Perfil' }
  ];

  RL.refrescar = function () {
    const v = RL.vistas[RL.R.tab];
    if (v && v.render) v.render();
  };

  function autoOn() { return RL.S && RL.S.autoServir !== false; }

  /* Sirve solo cada plato listo a la mesa que lo espera (más calidad primero) */
  function autoServir() {
    const R = RL.R, S = RL.S;
    if (!autoOn() || !S.listos.length) return 0;
    let n = 0;
    for (let i = 0; i < R.mesas.length; i++) {
      const c = R.mesas[i];
      if (!c || c.estado !== 'esperando') continue;
      for (let k = 0; k < c.pedido.length; k++) if (!c.pedido[k].ok && RL.servir(i, k, true)) n++;
    }
    if (n) RL.sfx.ok();
    return n;
  }
  RL.autoServir = autoServir;

  /* ---------- HUD ---------- */
  function renderHUD() {
    const S = RL.S, R = RL.R;
    R.dirty.hud = false;
    const need = S.nivel >= D.MAX_NIVEL ? 1 : RL.xpNecesaria(S.nivel);
    const pct = S.nivel >= D.MAX_NIVEL ? 100 : Math.min(100, S.xp / need * 100);
    const sync = RL.nube.activa
      ? (RL.nube.estado === 'error' ? '⚠️ sin conexión, guardado aquí' : '☁️ en la nube')
      : '💾 en este dispositivo';
    $('#hud').innerHTML =
      '<button class="hud-yo" data-act="tab" data-id="perfil" type="button" aria-label="Mi perfil"><span class="hud-avatar">' + RL.avatarSVG(S.avatar) + '</span>' +
      '<span style="min-width:0"><span class="hud-nombre" style="display:block">' + RL.esc(S.nombre) + '</span><span class="hud-rest" style="display:block">' + RL.esc(S.restaurante) + '</span></span></button>' +
      '<div class="hud-nivel"><span class="insignia" aria-label="Nivel ' + S.nivel + '"><b>' + S.nivel + '</b></span><div class="hud-nivel-top"><span>Nivel ' + S.nivel + '</span><span>' + (S.nivel >= D.MAX_NIVEL ? 'Máximo' : S.xp + '/' + need + ' XP') + '</span></div>' +
      '<div class="barra xp"><i style="width:' + pct + '%"></i></div></div>' +
      '<div class="hud-stats"><span class="pill monedas" id="pill-monedas">🪙 ' + RL.fmt(S.monedas) + '</span><span class="pill">⭐ ' + RL.fmt(S.puntaje) + '</span><span class="sync">' + sync + '</span></div>' +
      '<div class="hud-btns"><button class="btn icon-btn" data-act="pausa" type="button" aria-label="Pausar" title="Pausar">' + (R.pausaManual ? '▶️' : '⏸') + '</button>' +
      '<button class="btn icon-btn' + (autoOn() ? ' on' : '') + '" data-act="auto" type="button" aria-label="Servir solo" title="Servir solo los platos listos (A)">⚡</button>' +
      '<button class="btn icon-btn" data-act="sonido" type="button" aria-label="Sonido" title="Sonido">' + (S.sonido === false ? '🔇' : '🔊') + '</button></div>';
    if (RL.pulso) {
      const p = $('#pill-monedas');
      if (p) { p.classList.add('pulso'); setTimeout(function () { if (p) p.classList.remove('pulso'); }, 420); }
      RL.pulso = null;
    }
    actualizarAvisoPausa();
  }

  function actualizarAvisoPausa() {
    const R = RL.R, a = $('#aviso-pausa');
    if (!a) return;
    if (R.pausaManual) { a.textContent = '⏸ Juego en pausa. Toca ▶️ para seguir.'; a.classList.remove('oculto'); }
    else if (R.tab === 'super' || R.tab === 'juegos') { a.textContent = '⏸ El restaurante está en pausa mientras compras o juegas.'; a.classList.remove('oculto'); }
    else a.classList.add('oculto');
  }

  /* ---------- Pestañas ---------- */
  function badgeTab(id) {
    const R = RL.R;
    if (id === 'salon') return R.mesas.filter(function (c) { return c && c.estado === 'pagar'; }).length;
    if (id === 'cocina') return Object.keys(RL.sinCubrir()).reduce(function (s, k) { return s + RL.sinCubrir()[k]; }, 0);
    return 0;
  }
  function renderTabs() {
    const R = RL.R;
    R.dirty.tabs = false;
    const badges = TABS.map(function (t) { return badgeTab(t.id); });
    const sig = R.tab + '|' + badges.join(',');
    if (R.tabSig === sig) return;
    R.tabSig = sig;
    $('#tabs').innerHTML = TABS.map(function (t, k) {
      const b = badges[k];
      return '<button class="tab ' + (R.tab === t.id ? 'activa' : '') + '" data-act="tab" data-id="' + t.id + '" type="button" title="' + t.n + ' (tecla ' + (k + 1) + ')"><span class="ic">' + t.ic + '</span>' + t.n +
        '<kbd class="atajo">' + (k + 1) + '</kbd>' + (b > 0 ? '<span class="punto">' + b + '</span>' : '') + '</button>';
    }).join('');
  }

  RL.irTab = function (id) {
    const R = RL.R;
    const prev = R.tab;
    const vp = RL.vistas[prev];
    if (vp && vp.salir) vp.salir();
    R.tab = id;
    RL.$$('.vista').forEach(function (v) { v.classList.toggle('oculto', v.id !== 'v-' + id); });
    renderTabs(); actualizarAvisoPausa();
    const v = RL.vistas[id];
    if (v && v.render) v.render();
    if (id === 'salon') R.dirty.salon = true;
    window.scrollTo(0, 0);
  };

  /* ---------- Salón ---------- */
  const MOODS = ['😡', '😟', '🙂', '😄'];
  function moodDe(c) {
    if (c.estado === 'comiendo') return '😋';
    const r = c.pac / c.pacMax;
    return r > 0.6 ? MOODS[3] : r > 0.35 ? MOODS[2] : r > 0.15 ? MOODS[1] : MOODS[0];
  }

  function htmlCliente(i, c) {
    const T = RL.TIPOS[c.tipo];
    const tag = c.tipo === 'normal' ? '' : '<span class="tag ' + (c.tipo === 'vip' ? 'vip' : c.tipo === 'apurado' ? 'rojo' : 'verde') + '">' + T.n + '</span>';
    let cuerpo;
    if (c.estado === 'esperando') {
      cuerpo = '<div class="pedido">' + c.pedido.map(function (it, k) {
        const r = D.REC[it.rid], listo = !it.ok && RL.hayPlato(it.rid);
        return '<button type="button" class="plato ' + (it.ok ? 'ok' : listo ? 'listo' : '') + '" data-act="servirItem" data-mesa="' + i + '" data-item="' + k + '"' + (it.ok ? ' disabled' : '') + ' title="' + RL.esc(r.nombre) + '">' + r.emoji + '<small>' + RL.esc(r.nombre) + '</small></button>';
      }).join('') + '</div>';
    } else if (c.estado === 'comiendo') {
      cuerpo = '<div class="disfruta">😋<small>Comiendo</small></div>';
    } else {
      cuerpo = '<button class="btn chico btn-mango cobra" data-act="cobrar" data-mesa="' + i + '" type="button">💰 ' + RL.fmt(c.cuenta) + '</button>';
    }
    return '<span class="num-mesa">Mesa ' + (i + 1) + '</span>' + tag +
      '<div class="burbuja ' + c.estado + '"><div class="burbuja-cuerpo">' + cuerpo + '</div><div class="pac vert"><i></i></div></div>' +
      '<div class="mesa-top"><span class="cliente">' + c.emoji + '</span><span class="mood">' + moodDe(c) + '</span></div>' +
      RL.mesaSVG(c.estado);
  }

  function sigMesa(i) {
    const S = RL.S, c = RL.R.mesas[i];
    if (i < S.mesas) {
      if (!c) return 'libre' + i;
      return [c.id, c.estado, c.pedido.map(function (it) { return it.ok ? 2 : RL.hayPlato(it.rid) ? 1 : 0; }).join(''), c.cuenta].join('|');
    }
    if (i === S.mesas) return 'comprar' + RL.precioMesa(i) + (S.monedas >= RL.precioMesa(i) ? 'si' : 'no') + S.nivel;
    return 'bloq' + i;
  }

  function actualizarMesa(i) {
    const S = RL.S, c = RL.R.mesas[i], el = document.getElementById('mesa-' + i);
    if (!el) return;
    const sig = sigMesa(i);
    if (el.dataset.sig === sig) return;
    el.dataset.sig = sig;
    if (i < S.mesas) {
      if (!c) { el.className = 'mesa vacia'; el.innerHTML = '<span class="num-mesa">Mesa ' + (i + 1) + '</span>' + RL.mesaSVG('libre'); }
      else { el.className = 'mesa' + (c.estado === 'pagar' ? ' pagar' : ''); el.innerHTML = htmlCliente(i, c); }
    } else if (i === S.mesas) {
      const p = RL.precioMesa(i);
      el.className = 'mesa vacia';
      el.innerHTML = '<div class="mesa-nueva">' + RL.mesaSVG('libre') + '<button class="btn chico btn-mango" data-act="comprarMesa" type="button"' + (S.monedas >= p ? '' : ' style="opacity:.75"') + '>➕ Mesa · 🪙 ' + RL.fmt(p) + '</button></div>';
    } else {
      el.className = 'mesa vacia bloq'; el.innerHTML = '<span class="candado">🔒</span>' + RL.mesaSVG('libre');
    }
  }

  function textoPista() {
    const R = RL.R;
    const pagar = R.mesas.filter(function (c) { return c && c.estado === 'pagar'; }).length;
    let servibles = 0, esperando = 0;
    R.mesas.forEach(function (c) {
      if (c && c.estado === 'esperando') { esperando++; c.pedido.forEach(function (it) { if (!it.ok && RL.hayPlato(it.rid)) servibles++; }); }
    });
    const sc = RL.sinCubrir(), sin = Object.keys(sc).reduce(function (s, k) { return s + sc[k]; }, 0);
    if (pagar) return '💰 <b>' + pagar + '</b> mesa' + (pagar > 1 ? 's' : '') + ' esperan para pagar. Toca <b>Cobrar</b>.';
    if (servibles) return '🍽️ Tienes platos listos. Toca el plato verde en la mesa para servirlo.';
    if (sin) return '👩‍🍳 Faltan <b>' + sin + '</b> plato' + (sin > 1 ? 's' : '') + ' por cocinar. Ve a la cocina.';
    if (esperando) return '⏳ Tus cocineros están preparando los pedidos.';
    return RL.S.equipo.length ? '✨ Todo en orden. Esperando clientes.' : '✨ Esperando clientes. Cocina por adelantado o compra ingredientes.';
  }

  function aplicarDecor() {
    const S = RL.S;
    const pared = $('#s-pared'), suelo = $('#s-suelo');
    if (!pared || !suelo) return;
    const get = function (cat) { return D.DECOR[cat].items.filter(function (x) { return x.id === S.decor[cat]; })[0]; };
    const tema = RL.tema();
    const pI = get('pared'), sI = get('piso');
    pared.style.background = pI.precio ? pI.css : tema.pared;
    suelo.style.background = sI.precio ? sI.css : tema.piso;
    pared.style.setProperty('--zocalo', tema.zocalo);
    pared.style.setProperty('--marco', tema.marco);
    pared.style.setProperty('--cielo', tema.cielo);
    const deco = [get('cuadros'), get('luces'), get('plantas')].map(function (it) {
      return it.emoji ? '<span class="deco">' + it.emoji + '</span>' : '';
    }).join('');
    pared.innerHTML = RL.ventanaHTML() + '<span class="deco-centro">' + (deco || '<span class="deco muted" style="font-size:.9rem">Decora tu local en Mejoras</span>') + '</span>' + RL.ventanaHTML();
  }

  function listosHTML() {
    const S = RL.S;
    return S.listos.length ? S.listos.map(function (p) {
      const r = D.REC[p.rid];
      return '<div class="plato-listo" title="' + RL.esc(r.nombre) + '">' + r.emoji + '<small class="estrellas">' + RL.estrellasTxt(p.q) + '</small></div>';
    }).join('') : '<span class="muted">No hay platos listos. Cocínalos en la cocina.</span>';
  }

  function renderSalon() {
    const S = RL.S;
    let html = '<div class="pista"><span id="s-pista"></span><span class="fila"><button class="btn chico btn-lima" data-act="servirTodo" type="button">Servir todo <kbd class="atajo">S</kbd></button>' +
      '<button class="btn chico btn-mango" data-act="cobrarRapido" type="button">Cobro rápido <kbd class="atajo">Q</kbd></button>' +
      '<button class="btn chico" data-act="tab" data-id="cocina" type="button">Cocinar <kbd class="atajo">2</kbd></button></span></div>' +
      '<div class="salon-escena"><div class="salon-pared" id="s-pared"></div><div class="salon-suelo" id="s-suelo">';
    D.ZONAS.forEach(function (z) {
      if (S.nivel < z.nivel) {
        html += '<div class="zona"><div class="zona-bloq">' + z.emoji + ' <b>' + z.nombre + '</b><br><small>Se abre en el nivel ' + z.nivel + '</small></div></div>';
      } else {
        html += '<div class="zona"><div class="zona-cab">' + z.emoji + ' ' + z.nombre + '</div><div class="mesas">';
        for (let k = 0; k < D.MESAS_POR_ZONA; k++) {
          const i = z.id * D.MESAS_POR_ZONA + k;
          html += '<div class="mesa vacia" id="mesa-' + i + '"></div>';
        }
        html += '</div></div>';
      }
    });
    html += '</div></div><div class="salon-pie"><div class="card"><h3>🧾 Caja registradora</h3><p id="s-caja" class="muted" style="margin:6px 0 8px"></p>' +
      '<button class="btn btn-mango" data-act="atenderCaja" type="button">Atender la caja <kbd class="atajo">C</kbd></button></div>' +
      '<div class="card"><h3>Pase de platos listos</h3><div class="listos-estante" id="s-listos" style="margin-top:6px"></div></div></div>';
    $('#v-salon').innerHTML = html;
    aplicarDecor();
    RL.R.dirty.salon = true;
    actualizarSalon();
  }

  function actualizarSalon() {
    const R = RL.R;
    R.dirty.salon = false;
    for (let i = 0; i < D.MAX_MESAS; i++) actualizarMesa(i);
    const lis = $('#s-listos');
    if (lis) { const h = listosHTML(); if (lis.dataset.h !== h) { lis.dataset.h = h; lis.innerHTML = h; } }
    liveSalon();
  }

  function liveSalon() {
    const R = RL.R, S = RL.S;
    const p = $('#s-pista');
    if (p) { const t = textoPista(); if (p.dataset.t !== t) { p.dataset.t = t; p.innerHTML = t; } }
    const cj = $('#s-caja');
    if (cj) {
      const n = R.mesas.filter(function (c) { return c && c.estado === 'pagar'; }).length;
      cj.textContent = n ? n + ' cliente' + (n > 1 ? 's' : '') + ' esperando para pagar.' : 'No hay nadie esperando para pagar.';
    }
    for (let i = 0; i < S.mesas; i++) {
      const c = R.mesas[i], el = document.getElementById('mesa-' + i);
      if (!c || !el) continue;
      const barra = el.querySelector('.pac'), fill = el.querySelector('.pac > i'), mood = el.querySelector('.mood');
      if (fill) {
        const r = RL.clamp(c.pac / c.pacMax, 0, 1);
        fill.style.height = (r * 100) + '%';
        barra.className = 'pac vert' + (r < 0.25 ? ' baja' : r < 0.5 ? ' med' : '');
      }
      if (mood) { const m = moodDe(c); if (mood.textContent !== m) mood.textContent = m; }
    }
  }

  RL.vistas.salon = { render: renderSalon, live: liveSalon, actualizar: actualizarSalon };

  /* ---------- Caja registradora ---------- */
  const DEN = [1, 2, 5, 10, 20, 50, 100, 200];
  function abrirCaja(i) {
    const R = RL.R, c = R.mesas[i];
    if (!c || c.estado !== 'pagar') return;
    if (RL.hayModal()) { RL.toast('Cierra la ventana abierta primero', 'mal'); return; }
    const need = RL.devueltaNecesaria(c), pago = c.pago;
    const lineas = c.pedido.map(function (it) {
      const r = D.REC[it.rid];
      return '<div class="linea"><span>' + r.emoji + ' ' + RL.esc(r.nombre) + ' <span class="estrellas">' + RL.estrellasTxt(it.q) + '</span></span><b>' + RL.fmt(RL.precioPlato(it.rid, it.q)) + '</b></div>';
    }).join('');
    const ticket = '<div class="ticket">' + lineas + '<div class="linea total"><span>Total</span><b>🪙 ' + RL.fmt(c.cuenta) + '</b></div></div>';
    const vive = function () { return R.mesas[i] === c && c.estado === 'pagar'; };

    if (pago.modo !== 'efectivo') {
      const tarjeta = pago.modo === 'tarjeta';
      RL.modal({
        titulo: 'Mesa ' + (i + 1) + ' · ' + c.emoji,
        html: ticket + (tarjeta ? '<div class="tarjeta-pos">💳</div><p class="centro">Paga con tarjeta.</p>' : '<p class="centro" style="margin-top:10px;font-size:1.1rem">💵 Pagó justo <b>' + RL.fmt(pago.dado) + '</b>. No hay devuelta.</p>'),
        botones: [
          { txt: 'Más tarde', cls: 'btn' },
          { txt: tarjeta ? 'Cobrar con tarjeta' : 'Recibir pago', cls: 'btn-mango', fn: function () { if (vive()) RL.cobrar(i, { perfecto: true }); } }
        ]
      });
      return;
    }

    const tray = [];
    let suma = 0;
    const box = RL.modal({
      titulo: 'Mesa ' + (i + 1) + ' · ' + c.emoji,
      html: ticket + '<div class="ecuacion"><span>Pagó 💵 ' + RL.fmt(pago.dado) + '</span><span>Cuenta 🪙 ' + RL.fmt(c.cuenta) + '</span><span class="interrogante">Devuelta ❓</span></div>' +
        '<div class="suma-cambio">Entregas: <b id="cj-sum">0</b></div><div class="bandeja-cambio" id="cj-tray"></div>' +
        '<div class="denoms">' + DEN.map(function (d) { return '<button class="denom ' + (d <= 5 ? 'moneda' : 'billete') + '" data-d="' + d + '" type="button">' + d + '</button>'; }).join('') + '</div>' +
        '<p class="centro muted" id="cj-msg">Resta lo que pagó menos la cuenta y arma la devuelta exacta.</p>',
      botones: [
        { txt: 'Limpiar', cls: 'btn', cerrar: false, fn: function () { tray.length = 0; suma = 0; pintar(); } },
        { txt: 'Más tarde', cls: 'btn' },
        {
          txt: 'Entregar devuelta', cls: 'btn-mango', cerrar: false, fn: function () {
            if (!vive()) { RL.cerrarModal(); RL.toast('El cliente ya se fue', 'mal'); return; }
            if (suma === need) { RL.cerrarModal(); RL.cobrar(i, { perfecto: true }); return; }
            RL.sfx.bad();
            c.pac = Math.max(1, c.pac - 4);
            const m = $('#cj-msg');
            if (m) m.textContent = suma < need ? 'Faltan ' + (need - suma) + ' para completar la devuelta.' : 'Te pasaste por ' + (suma - need) + '. Limpia y vuelve a armarla.';
            if (suma > need) { tray.length = 0; suma = 0; pintar(); }
          }
        }
      ]
    });
    function pintar() {
      const s = $('#cj-sum'), t = $('#cj-tray');
      if (s) s.textContent = suma;
      if (t) t.innerHTML = tray.map(function (d, k) { return '<button class="denom ' + (d <= 5 ? 'moneda' : 'billete') + '" data-q="' + k + '" type="button" title="Quitar">' + d + '</button>'; }).join('');
    }
    if (box) {
      box.addEventListener('click', function (e) {
        const add = e.target.closest('.denom[data-d]');
        const quitar = e.target.closest('.denom[data-q]');
        if (add) { const d = parseInt(add.dataset.d, 10); tray.push(d); suma += d; RL.sfx.pop(); pintar(); }
        else if (quitar) { const k = parseInt(quitar.dataset.q, 10); suma -= tray[k]; tray.splice(k, 1); RL.sfx.click(); pintar(); }
      });
    }
  }

  /* ---------- Acciones globales ---------- */
  RL.ACT.tab = function (el) { RL.sfx.click(); RL.irTab(el.dataset.id); };
  RL.ACT.pausa = function () { RL.R.pausaManual = !RL.R.pausaManual; RL.marcar('hud'); };
  RL.ACT.sonido = function () { RL.S.sonido = RL.S.sonido === false; RL.sfx.click(); RL.marcar('hud'); RL.guardar(); };
  RL.ACT.servirItem = function (el) {
    const i = parseInt(el.dataset.mesa, 10), k = parseInt(el.dataset.item, 10);
    const c = RL.R.mesas[i];
    if (!c) return;
    if (!RL.servir(i, k)) {
      RL.sfx.bad();
      RL.toast('Aún no tienes ' + D.REC[c.pedido[k].rid].nombre.toLowerCase() + ' listo. ¡A la cocina!', 'mal');
      RL.R.cocinaCat = 'pend';
      RL.irTab('cocina');
    }
  };
  RL.ACT.servirTodo = function () {
    const R = RL.R;
    let n = 0;
    for (let i = 0; i < R.mesas.length; i++) {
      const c = R.mesas[i];
      if (!c || c.estado !== 'esperando') continue;
      for (let k = 0; k < c.pedido.length; k++) if (!c.pedido[k].ok && RL.servir(i, k, true)) n++;
    }
    if (n) { RL.sfx.ok(); RL.toast('Serviste ' + n + ' plato' + (n > 1 ? 's' : ''), 'ok'); }
    else RL.toast('No hay platos listos que coincidan con los pedidos', 'mal');
  };
  RL.ACT.auto = function () {
    RL.S.autoServir = !autoOn();
    RL.sfx.click(); RL.marcar('hud');
    RL.toast(autoOn() ? '⚡ Los platos listos se sirven solos' : 'Servicio manual: tú sirves cada plato', 'ok');
    if (autoOn()) autoServir();
    RL.guardar();
  };
  /* Cobra de una vez las mesas que pagan con tarjeta o justo (no necesitan devuelta) */
  RL.ACT.cobrarRapido = function () {
    const R = RL.R;
    let n = 0, ef = 0;
    for (let i = 0; i < R.mesas.length; i++) {
      const c = R.mesas[i];
      if (!c || c.estado !== 'pagar') continue;
      if (c.pago.modo !== 'efectivo') { RL.cobrar(i, { perfecto: true }); n++; } else ef++;
    }
    if (n) { RL.sfx.ok(); RL.toast('Cobraste ' + n + ' mesa' + (n > 1 ? 's' : '') + (ef ? ' · ' + ef + ' en efectivo esperan devuelta' : ''), 'ok'); }
    else if (ef) RL.ACT.atenderCaja();
    else RL.toast('Nadie espera para pagar', '');
  };
  RL.ACT.cobrar = function (el) { abrirCaja(parseInt(el.dataset.mesa, 10)); };
  RL.ACT.atenderCaja = function () {
    const R = RL.R;
    for (let i = 0; i < R.mesas.length; i++) if (R.mesas[i] && R.mesas[i].estado === 'pagar') { abrirCaja(i); return; }
    RL.toast('Nadie espera para pagar', '');
  };
  RL.ACT.comprarMesa = function () {
    const r = RL.comprarMesa();
    if (r.msg) RL.toast(r.msg, r.ok ? 'ok' : 'mal');
    if (r.ok && RL.R.tab === 'mejoras') RL.refrescar();
  };

  /* ---------- Inicio de sesión y arranque ---------- */
  function tutorial() {
    RL.modal({
      titulo: '¡Bienvenida a tu restaurante!',
      html: '<div class="card"><p><b>1.</b> Llegan clientes al <b>Salón</b> y piden platos.</p>' +
        '<p><b>2.</b> Ve a la <b>Cocina</b> y prepara cada plato paso a paso.</p>' +
        '<p><b>3.</b> Vuelve al Salón, toca el plato verde para <b>servir</b> y luego <b>cobra</b> en la caja.</p>' +
        '<p><b>4.</b> Si se acaban los ingredientes, camina por el <b>Súper</b>.</p>' +
        '<p><b>5.</b> Con las monedas compra recetas, mesas, decoración y contrata equipo.</p>' +
        '<p><b>6.</b> En <b>Juegos</b> ganas monedas extra.</p></div>',
      botones: [{ txt: '¡Empezar!', cls: 'btn-mango' }]
    });
    RL.S.tutorial = true;
  }

  function mostrarJuego() {
    $('#login').classList.add('oculto');
    $('#game').classList.remove('oculto');
    renderHUD(); renderTabs();
    RL.R.tab = 'salon';
    RL.irTab('salon');
    if (!RL.S.tutorial) tutorial();
    RL.guardar(true);
  }

  function entrar(nombre) {
    const err = $('#login-error'), btn = $('#login-form button');
    nombre = nombre.trim().replace(/\s+/g, ' ');
    if (nombre.length < 2) { err.textContent = 'Escribe un nombre de al menos 2 letras.'; return; }
    err.textContent = '';
    btn.disabled = true; btn.textContent = 'Cargando tu restaurante...';
    RL.sfx.click();
    RL.cargarJugadora(nombre).then(function (s) {
      RL.S = s;
      RL.crearRuntime();
      if (!s.personalizado && RL.crear) RL.crear.abrir(mostrarJuego);
      else mostrarJuego();
    }).catch(function () {
      err.textContent = 'No se pudo cargar. Intenta otra vez.';
    }).then(function () { btn.disabled = false; btn.textContent = '¡Entrar a mi restaurante!'; });
  }

  function iniciarLogin() {
    $('#login-form').addEventListener('submit', function (e) { e.preventDefault(); entrar($('#login-nombre').value); });
    const lista = RL.localLista();
    const cont = $('#login-locales');
    if (lista.length) {
      cont.innerHTML = '<div class="muted" style="width:100%;font-size:.85rem">Jugadoras en este dispositivo:</div>' + lista.slice(0, 8).map(function (j) {
        return '<button type="button" class="chip" data-nombre="' + RL.esc(j.nombre) + '">' + RL.esc(j.nombre) + ' · nivel ' + (j.nivel || 1) + '</button>';
      }).join('');
      cont.addEventListener('click', function (e) {
        const b = e.target.closest('[data-nombre]');
        if (b) entrar(b.dataset.nombre);
      });
    }
    $('#login-nube').textContent = RL.nube.activa ? '☁️ Tu progreso se guarda en la nube.' : '💾 Tu progreso se guarda en este dispositivo.';
  }

  /* ---------- Bucle principal ---------- */
  let ultimo = performance.now();
  function bucle(now) {
    requestAnimationFrame(bucle);
    const S = RL.S, R = RL.R;
    let dt = (now - ultimo) / 1000;
    ultimo = now;
    if (!S || !R || dt <= 0) return;
    if (dt > 0.5) dt = 0.5;
    if (RL.simActiva()) RL.tickSim(dt);
    R.autoT = (R.autoT || 0) + dt;
    if (R.autoT >= 0.5) { R.autoT = 0; if (RL.simActiva()) autoServir(); }
    R.liveT = (R.liveT || 0) + dt;
    if (R.liveT >= 0.2) {
      R.liveT = 0;
      if (R.tab === 'salon') liveSalon();
      else if (R.tab === 'cocina' && RL.vistas.cocina.live) RL.vistas.cocina.live();
      R.dirty.tabs = true;
    }
    if (R.dirty.hud) renderHUD();
    if (R.dirty.tabs) renderTabs();
    if (R.dirty.salon && R.tab === 'salon') actualizarSalon();
    if (R.dirty.cocina && R.tab === 'cocina') { R.dirty.cocina = false; if (RL.vistas.cocina.refrescar) RL.vistas.cocina.refrescar(); }
    R.guardaT += dt;
    if (R.guardaT >= 12) { R.guardaT = 0; RL.guardar(); }
  }

  /* ---------- Atajos de teclado ---------- */
  function atajos(e) {
    const R = RL.R;
    if (!RL.S || !R || e.ctrlKey || e.metaKey || e.altKey) return;
    const tg = e.target && e.target.tagName;
    if (tg === 'INPUT' || tg === 'TEXTAREA' || tg === 'SELECT') return;
    const k = e.key;
    /* dentro de la caja: 1-8 agregan billetes, Retroceso quita, Enter entrega */
    const bandeja = document.getElementById('cj-tray');
    if (RL.hayModal()) {
      if (!bandeja) return;
      if (/^[1-8]$/.test(k)) {
        const b = document.querySelector('.denom[data-d="' + DEN[parseInt(k, 10) - 1] + '"]');
        if (b) { e.preventDefault(); b.click(); }
      } else if (k === 'Backspace') {
        const q = bandeja.querySelectorAll('.denom[data-q]');
        if (q.length) { e.preventDefault(); q[q.length - 1].click(); }
      } else if (k === 'Enter') {
        const bs = document.querySelectorAll('#modal .btn-mango');
        if (bs.length) { e.preventDefault(); bs[bs.length - 1].click(); }
      }
      return;
    }
    if (R.cooking) return; /* durante los pasos de cocina Espacio/Enter son del minijuego */
    if (R.tab === 'super' || R.tab === 'juegos') return; /* esos modos usan flechas y toques */
    if (/^[1-8]$/.test(k)) { RL.sfx.click(); RL.irTab(TABS[parseInt(k, 10) - 1].id); return; }
    const l = k.toLowerCase();
    if (l === 's') RL.ACT.servirTodo();
    else if (l === 'c') RL.ACT.atenderCaja();
    else if (l === 'q') RL.ACT.cobrarRapido();
    else if (l === 'a') RL.ACT.auto();
    else if (l === 'p') RL.ACT.pausa();
    else if (k === 'Enter' && R.tab === 'cocina' && R.cocinaResultado) {
      const b = document.querySelector('#v-cocina .btn-mango:not(:disabled)');
      if (b) { e.preventDefault(); b.click(); }
    } else return;
  }

  function arrancar() {
    RL.initModal();
    iniciarLogin();
    document.addEventListener('click', function (e) {
      const el = e.target.closest('[data-act]');
      if (!el || el.disabled) return;
      const fn = RL.ACT[el.dataset.act];
      if (fn && RL.S) fn(el, e);
    });
    /* tocar cualquier parte de una mesa que espera pago abre la caja */
    document.addEventListener('click', function (e) {
      if (!RL.S || e.target.closest('[data-act]')) return;
      const m = e.target.closest('.mesa.pagar');
      if (m) abrirCaja(parseInt(m.id.replace('mesa-', ''), 10));
    });
    document.addEventListener('keydown', atajos);
    document.addEventListener('visibilitychange', function () { if (document.hidden && RL.S) RL.guardar(true, true); });
    window.addEventListener('pagehide', function () { if (RL.S) RL.guardar(true, true); });
    requestAnimationFrame(bucle);
  }

  RL.ACT.salirSesion = function () {
    RL.modal({
      titulo: '¿Cerrar sesión?', html: '<p class="centro">Tu progreso queda guardado. Puedes volver a entrar con tu nombre.</p>',
      botones: [
        { txt: 'Seguir jugando', cls: 'btn-turq' },
        { txt: 'Cerrar sesión', cls: 'btn-papaya', fn: function () { RL.guardar(true, true); setTimeout(function () { location.reload(); }, 250); } }
      ]
    });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
