/* ===========================================================
   RESTAURANTE LOCO - Supermercado caminable
   =========================================================== */
(function () {
  'use strict';
  const RL = window.RL, D = RL.D, $ = RL.$;

  const W = 720, H = 460, RADIO = 14, VEL = 170;
  const ORDEN = ['frutas', 'verduras', 'carnes', 'embutidos', 'mar', 'lacteos', 'panaderia', 'despensa', 'dulces', 'bebidas'];
  const ESTANTES = ORDEN.map(function (id, i) {
    return { id: id, x: 22 + (i % 5) * 140, y: i < 5 ? 64 : 214, w: 116, h: 64 };
  });
  const CAJA = { x: 500, y: 352, w: 200, h: 56 };
  const SOLIDOS = ESTANTES.concat([CAJA]);

  let activo = false, raf = 0, ultimo = 0, imgAv = null, sigPanel = '';
  let keys = {}, hold = {}, cleanupFns = [];
  const sup = { x: 70, y: 420, tx: null, near: null, stuck: 0 };

  function distRect(px, py, r) {
    const cx = RL.clamp(px, r.x, r.x + r.w), cy = RL.clamp(py, r.y, r.y + r.h);
    return Math.hypot(px - cx, py - cy);
  }
  function choca(x, y) {
    if (x < RADIO || x > W - RADIO || y < 40 || y > H - RADIO) return true;
    for (let i = 0; i < SOLIDOS.length; i++) if (distRect(x, y, SOLIDOS[i]) < RADIO) return true;
    return false;
  }

  /* ---------- Carrito ---------- */
  function cartTotal() {
    const c = RL.R.cart;
    return Math.ceil(Object.keys(c).reduce(function (s, id) { return s + c[id] * RL.precioIng(id); }, 0) - 1e-9);
  }
  function cartCount() {
    const c = RL.R.cart;
    return Object.keys(c).reduce(function (s, id) { return s + c[id]; }, 0);
  }
  function agregar(id, n) {
    const R = RL.R, cap = RL.capacidad();
    const actual = (R.cart[id] || 0) + RL.stock(id);
    const lugar = cap - actual;
    if (lugar <= 0) { RL.toast('Ya no cabe más ' + D.ING[id].nombre.toLowerCase() + ' en la despensa', 'mal'); RL.sfx.bad(); return; }
    R.cart[id] = (R.cart[id] || 0) + Math.min(n, lugar);
    RL.sfx.pop();
  }
  function quitar(id) {
    const R = RL.R;
    if (!R.cart[id]) return;
    R.cart[id]--;
    if (R.cart[id] <= 0) delete R.cart[id];
    RL.sfx.click();
  }

  /* ---------- Dibujo ---------- */
  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
  const INK = '#1E2A4A';
  function dibujar(ctx) {
    const S = RL.S;
    ctx.clearRect(0, 0, W, H);
    for (let ty = 0; ty < H; ty += 40) for (let tx = 0; tx < W; tx += 40) {
      ctx.fillStyle = ((tx + ty) / 40) % 2 ? '#E2F5F2' : '#F4FCFB';
      ctx.fillRect(tx, ty, 40, 40);
    }
    ctx.fillStyle = D.PASILLOS.bebidas.color; ctx.fillRect(0, 0, W, 34);
    ctx.fillStyle = INK; ctx.fillRect(0, 34, W, 3);
    ctx.fillStyle = '#fff'; ctx.font = '22px "Lilita One", system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('Supermercado Loco', W / 2, 18);
    // entrada
    ctx.fillStyle = '#FFC83D'; rr(ctx, 14, 408, 100, 42, 10); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = INK; ctx.font = '14px "Lilita One", system-ui, sans-serif'; ctx.fillText('Entrada', 64, 429);
    // estantes
    const oferta = S.oferta && S.oferta.hasta > Date.now() ? S.oferta.pasillo : '';
    ESTANTES.forEach(function (e) {
      const p = D.PASILLOS[e.id];
      ctx.fillStyle = p.color; rr(ctx, e.x, e.y, e.w, e.h, 12); ctx.fill();
      ctx.lineWidth = sup.near && sup.near.id === e.id ? 6 : 3;
      ctx.strokeStyle = sup.near && sup.near.id === e.id ? '#8B6CF6' : INK; ctx.stroke();
      ctx.font = '28px serif'; ctx.fillStyle = INK; ctx.fillText(p.emoji + p.emoji + p.emoji, e.x + e.w / 2, e.y + 24);
      ctx.font = '13px "Lilita One", system-ui, sans-serif';
      ctx.fillText(p.nombre.length > 16 ? p.nombre.slice(0, 15) + '…' : p.nombre, e.x + e.w / 2, e.y + 50);
      if (oferta === e.id) {
        ctx.fillStyle = '#FF6B57'; rr(ctx, e.x + e.w - 46, e.y - 12, 54, 22, 10); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.font = '13px "Lilita One", system-ui, sans-serif'; ctx.fillText('-30%', e.x + e.w - 19, e.y - 1);
      }
    });
    // caja
    ctx.fillStyle = '#FFC83D'; rr(ctx, CAJA.x, CAJA.y, CAJA.w, CAJA.h, 12); ctx.fill();
    ctx.lineWidth = sup.near && sup.near.id === 'caja' ? 6 : 3; ctx.strokeStyle = sup.near && sup.near.id === 'caja' ? '#8B6CF6' : INK; ctx.stroke();
    ctx.font = '30px serif'; ctx.fillStyle = INK; ctx.fillText('🧾', CAJA.x + 36, CAJA.y + 30);
    ctx.font = '16px "Lilita One", system-ui, sans-serif'; ctx.fillText('Caja', CAJA.x + 100, CAJA.y + 30);
    ctx.font = '34px serif'; ctx.fillText('👩‍💼', CAJA.x + 168, CAJA.y + 30);
    // destino
    if (sup.tx) { ctx.strokeStyle = '#8B6CF6'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(sup.tx.x, sup.tx.y, 9, 0, 6.3); ctx.stroke(); }
    // jugadora
    ctx.fillStyle = 'rgba(30,42,74,.25)'; ctx.beginPath(); ctx.ellipse(sup.x, sup.y + 12, 16, 6, 0, 0, 6.3); ctx.fill();
    if (imgAv && imgAv.complete && imgAv.naturalWidth) ctx.drawImage(imgAv, sup.x - 22, sup.y - 38, 44, 48);
    else { ctx.font = '30px serif'; ctx.fillText('🧑‍🍳', sup.x, sup.y - 8); }
    ctx.font = '22px serif'; ctx.fillText('🛒', sup.x + 17, sup.y + 7);
  }

  /* ---------- Movimiento ---------- */
  function mover(dt) {
    let dx = 0, dy = 0;
    if (keys.ArrowLeft || keys.a || hold.izq) dx -= 1;
    if (keys.ArrowRight || keys.d || hold.der) dx += 1;
    if (keys.ArrowUp || keys.w || hold.arriba) dy -= 1;
    if (keys.ArrowDown || keys.s || hold.abajo) dy += 1;
    if (dx || dy) sup.tx = null;
    else if (sup.tx) {
      const vx = sup.tx.x - sup.x, vy = sup.tx.y - sup.y, d = Math.hypot(vx, vy);
      if (d < 6) sup.tx = null; else { dx = vx / d; dy = vy / d; }
    }
    if (!dx && !dy) { sup.stuck = 0; return; }
    const len = Math.hypot(dx, dy); dx /= len; dy /= len;
    const px = sup.x, py = sup.y, paso = VEL * dt;
    const nx = sup.x + dx * paso; if (!choca(nx, sup.y)) sup.x = nx;
    const ny = sup.y + dy * paso; if (!choca(sup.x, ny)) sup.y = ny;
    if (sup.tx) {
      if (Math.hypot(sup.x - px, sup.y - py) < paso * 0.3) { sup.stuck += dt; if (sup.stuck > 0.35) { sup.tx = null; sup.stuck = 0; } }
      else sup.stuck = 0;
    }
  }
  function detectarCerca() {
    let mejor = null, md = 48;
    ESTANTES.forEach(function (e) { const d = distRect(sup.x, sup.y, e); if (d < md) { md = d; mejor = { tipo: 'estante', id: e.id }; } });
    const dc = distRect(sup.x, sup.y, CAJA);
    if (dc < md) mejor = { tipo: 'caja', id: 'caja' };
    sup.near = mejor;
  }

  /* ---------- Paneles ---------- */
  function lineaProducto(id, oferta) {
    const R = RL.R, ing = D.ING[id], cap = RL.capacidad();
    const pr = RL.precioIng(id), en = R.cart[id] || 0, st = RL.stock(id);
    const precioTxt = oferta ? '<span class="precio-oferta"><s>' + ing.precio + '</s>' + pr + '</span>' : String(pr);
    return '<div class="prod"><span class="e">' + ing.emoji + '</span><div class="info"><b>' + RL.esc(ing.nombre) + '</b>' +
      '<small>🪙 ' + precioTxt + ' · en despensa ' + st + '/' + cap + '</small></div>' +
      '<div class="cant"><button class="btn chico" data-act="cartMenos" data-id="' + id + '" type="button" aria-label="Quitar uno"' + (en ? '' : ' disabled') + '>−</button>' +
      '<b>' + en + '</b><button class="btn chico btn-mango" data-act="cartMas" data-id="' + id + '" type="button" aria-label="Agregar uno">+</button>' +
      '<button class="btn chico" data-act="cartMas5" data-id="' + id + '" type="button">+5</button></div></div>';
  }

  function panelCarritoLineas() {
    const c = RL.R.cart, ids = Object.keys(c);
    if (!ids.length) return '<p class="muted">El carrito está vacío.</p>';
    return ids.map(function (id) {
      return '<div class="prod"><span class="e">' + D.ING[id].emoji + '</span><div class="info"><b>' + RL.esc(D.ING[id].nombre) + '</b><small>' + c[id] + ' × 🪙 ' + RL.precioIng(id) + '</small></div>' +
        '<div class="cant"><button class="btn chico" data-act="cartMenos" data-id="' + id + '" type="button" aria-label="Quitar uno">−</button><b>' + c[id] + '</b>' +
        '<button class="btn chico btn-mango" data-act="cartMas" data-id="' + id + '" type="button" aria-label="Agregar uno">+</button></div></div>';
    }).join('');
  }

  function actualizarPanel() {
    const S = RL.S, R = RL.R, near = sup.near;
    const sig = (near ? near.id : '-') + '|' + JSON.stringify(R.cart) + '|' + cartCount() + '|' + Math.round(S.monedas) + '|' + JSON.stringify(S.despensa).length;
    if (sig === sigPanel) return;
    sigPanel = sig;
    const el = $('#sup-panel');
    if (!el) return;
    const total = cartTotal(), n = cartCount();
    let html = '';
    if (near && near.tipo === 'estante') {
      const p = D.PASILLOS[near.id];
      const oferta = S.oferta && S.oferta.hasta > Date.now() && S.oferta.pasillo === near.id;
      html += '<h3>' + p.emoji + ' ' + p.nombre + '</h3>';
      if (oferta) html += '<div class="oferta-banner">🏷️ Oferta: 30% menos en este pasillo</div>';
      html += '<div class="estante-panel">' + Object.keys(D.ING).filter(function (id) { return D.ING[id].pasillo === near.id; }).map(function (id) { return lineaProducto(id, oferta); }).join('') + '</div>';
    } else if (near && near.tipo === 'caja') {
      html += '<h3>🧾 Caja del súper</h3><div class="estante-panel">' + panelCarritoLineas() + '</div>' +
        '<div class="fila entre" style="margin-top:8px"><b style="font-family:var(--titulo);font-size:1.3rem">Total: ' + RL.fmt(total) + ' 🪙</b>' +
        '<span><button class="btn chico" data-act="vaciarCarrito" type="button"' + (n ? '' : ' disabled') + '>Vaciar</button> ' +
        '<button class="btn btn-mango" data-act="pagarCarrito" type="button"' + (n ? '' : ' disabled') + '>Pagar</button></span></div>';
    } else {
      html += '<h3>🛒 Tu carrito</h3><p class="muted" style="margin:4px 0 8px">Camina hasta un estante para ver sus productos. Paga en la caja (abajo a la derecha).</p>' +
        '<div class="estante-panel" style="max-height:200px">' + panelCarritoLineas() + '</div>' +
        '<div class="fila entre" style="margin-top:8px"><b>' + n + ' productos · ' + RL.fmt(total) + ' 🪙</b>' +
        '<button class="btn chico" data-act="vaciarCarrito" type="button"' + (n ? '' : ' disabled') + '>Vaciar</button></div>';
    }
    el.innerHTML = html;
    actualizarLista();
  }

  function actualizarLista() {
    const el = $('#sup-lista');
    if (!el) return;
    const R = RL.R, sc = RL.sinCubrir(), falta = {};
    Object.keys(sc).forEach(function (rid) {
      const rec = D.REC[rid];
      Object.keys(rec.ing).forEach(function (iid) { falta[iid] = (falta[iid] || 0) + rec.ing[iid] * sc[rid]; });
    });
    const filas = [];
    Object.keys(falta).forEach(function (iid) {
      const f = falta[iid] - RL.stock(iid) - (R.cart[iid] || 0);
      if (f > 0) filas.push('<div>' + D.ING[iid].emoji + ' <b>' + RL.esc(D.ING[iid].nombre) + '</b>: faltan ' + f + ' <span class="muted">(' + D.PASILLOS[D.ING[iid].pasillo].emoji + ' ' + D.PASILLOS[D.ING[iid].pasillo].nombre + ')</span></div>');
    });
    const oferta = RL.S.oferta;
    el.innerHTML = '<h3>📝 Lista del chef</h3><div class="lista-chef" style="margin-top:6px">' +
      (Object.keys(sc).length ? (filas.length ? filas.slice(0, 8).join('') : '<span>✅ Con tu carrito ya cubres los pedidos de ahora.</span>') : '<span class="muted">No hay pedidos esperando. Compra para tus próximas recetas.</span>') +
      '</div>' + (oferta && oferta.hasta > Date.now() ? '<p style="margin-top:8px">🏷️ Hoy hay oferta en <b>' + D.PASILLOS[oferta.pasillo].emoji + ' ' + D.PASILLOS[oferta.pasillo].nombre + '</b>.</p>' : '');
  }

  /* ---------- Ciclo de vida de la vista ---------- */
  function frame(now) {
    if (!activo) return;
    const dt = Math.min(0.05, (now - ultimo) / 1000 || 0.016);
    ultimo = now;
    mover(dt);
    detectarCerca();
    const cv = $('#super-canvas');
    if (cv) { const ctx = cv.getContext('2d'); if (ctx) dibujar(ctx); }
    actualizarPanel();
    raf = requestAnimationFrame(frame);
  }

  function escuchar(el, ev, fn, opts) { el.addEventListener(ev, fn, opts); cleanupFns.push(function () { el.removeEventListener(ev, fn, opts); }); }

  function render() {
    const S = RL.S;
    salir();
    if (!S.oferta || S.oferta.hasta < Date.now()) S.oferta = { pasillo: RL.pick(ORDEN), hasta: Date.now() + 10 * 60 * 1000 };
    $('#v-super').innerHTML = '<div class="vista-cab"><h2>🛒 Supermercado</h2><span class="muted">Camina con las flechas, WASD, los botones o tocando el mapa.</span></div>' +
      '<div class="super-wrap"><div><div class="canvas-caja"><canvas id="super-canvas" width="' + W + '" height="' + H + '"></canvas></div>' +
      '<div class="dpad"><button class="btn arriba" data-dir="arriba" type="button" aria-label="Arriba">⬆️</button><button class="btn izq" data-dir="izq" type="button" aria-label="Izquierda">⬅️</button>' +
      '<button class="btn abajo" data-dir="abajo" type="button" aria-label="Abajo">⬇️</button><button class="btn der" data-dir="der" type="button" aria-label="Derecha">➡️</button></div></div>' +
      '<div><div class="card" id="sup-panel"></div><div class="card" id="sup-lista"></div></div></div>';
    try {
      imgAv = new Image();
      imgAv.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(RL.avatarSVG(S.avatar));
    } catch (e) { imgAv = null; }
    sigPanel = ''; keys = {}; hold = {}; sup.tx = null; sup.near = null;
    const cv = $('#super-canvas');
    escuchar(cv, 'pointerdown', function (e) {
      const r = cv.getBoundingClientRect();
      sup.tx = { x: RL.clamp((e.clientX - r.left) * W / r.width, 20, W - 20), y: RL.clamp((e.clientY - r.top) * H / r.height, 44, H - 20) };
      sup.stuck = 0;
    });
    RL.$$('.dpad .btn').forEach(function (b) {
      const dir = b.dataset.dir;
      escuchar(b, 'pointerdown', function (e) { e.preventDefault(); hold[dir] = true; });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { escuchar(b, ev, function () { hold[dir] = false; }); });
    });
    escuchar(document, 'keydown', function (e) {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'a', 'd', 'w', 's'].indexOf(k) < 0) return;
      const t = e.target && e.target.tagName;
      if (t === 'INPUT' || t === 'TEXTAREA') return;
      if (k.indexOf('Arrow') === 0) e.preventDefault();
      keys[k] = true;
    });
    escuchar(document, 'keyup', function (e) { keys[e.key.length === 1 ? e.key.toLowerCase() : e.key] = false; });
    activo = true; ultimo = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function salir() {
    activo = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    cleanupFns.forEach(function (f) { f(); });
    cleanupFns = [];
    keys = {}; hold = {};
  }

  RL.vistas.super = { render: render, salir: salir, estado: sup };

  RL.ACT.cartMas = function (el) { agregar(el.dataset.id, 1); };
  RL.ACT.cartMas5 = function (el) { agregar(el.dataset.id, 5); };
  RL.ACT.cartMenos = function (el) { quitar(el.dataset.id); };
  RL.ACT.vaciarCarrito = function () { RL.R.cart = {}; RL.sfx.click(); };
  RL.ACT.pagarCarrito = function () {
    const S = RL.S, R = RL.R;
    if (!sup.near || sup.near.tipo !== 'caja') { RL.toast('Acércate a la caja para pagar', 'mal'); return; }
    const n = cartCount();
    if (!n) return;
    const total = cartTotal();
    if (!RL.gastar(total)) return;
    Object.keys(R.cart).forEach(function (id) { S.despensa[id] = RL.stock(id) + R.cart[id]; });
    S.stats.compras++;
    RL.ganarXP(2 + Math.round(n / 5));
    R.cart = {};
    RL.sfx.coin();
    RL.toast('Compra lista: ' + n + ' productos por ' + RL.fmt(total) + ' 🪙', 'ok');
    RL.marcar('cocina');
    RL.guardar();
  };
})();
