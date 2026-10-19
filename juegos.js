/* ===========================================================
   RESTAURANTE LOCO - Minijuegos y regalo diario
   =========================================================== */
(function () {
  'use strict';
  const RL = window.RL, D = RL.D, $ = RL.$;

  let parar = null;
  function pararJuego() { if (parar) { try { parar(); } catch (e) { /* nada */ } parar = null; } }

  const INFO = {
    corte: { emoji: '🔪', n: 'Corte rápido', d: 'Toca los ingredientes antes de que desaparezcan. ¡Evita los gusanos!', t: 30 },
    caja: { emoji: '🧾', n: 'Caja veloz', d: 'Da la devuelta exacta lo más rápido que puedas.', t: 45 },
    vuelo: { emoji: '🛩️', n: 'Pedidos voladores', d: 'Atrapa solo el pedido que te piden mientras vuela.', t: 30 }
  };

  /* ---------- Menú ---------- */
  function render() {
    pararJuego();
    const S = RL.S, root = $('#v-juegos');
    const hoyListo = S.regalo.ultimo === RL.hoy();
    root.innerHTML = '<div class="vista-cab"><h2>🎮 Minijuegos</h2><span class="muted">Ganan monedas y experiencia. El restaurante espera mientras juegas.</span></div>' +
      '<div class="grid c2">' + Object.keys(INFO).map(function (k) {
        const i = INFO[k];
        return '<div class="card juego-card"><div class="emo">' + i.emoji + '</div><h3>' + i.n + '</h3><p class="muted" style="margin:4px 0 8px">' + i.d + '</p>' +
          '<p>Tu récord: <b>' + (S.mini[k] || 0) + '</b> · ' + i.t + ' segundos</p>' +
          '<button class="btn btn-mango" style="margin-top:8px" data-act="jugar" data-id="' + k + '" type="button">¡Jugar!</button></div>';
      }).join('') +
      '<div class="card juego-card"><div class="emo">🎁</div><h3>Regalo diario</h3><p class="muted" style="margin:4px 0 8px">Entra cada día y la racha te da más premio.</p>' +
      '<p>Racha actual: <b>' + (S.regalo.racha || 0) + '</b> día(s)</p>' +
      '<button class="btn ' + (hoyListo ? '' : 'btn-lima') + '" style="margin-top:8px" data-act="regalo" type="button"' + (hoyListo ? ' disabled' : '') + '>' + (hoyListo ? 'Vuelve mañana' : 'Reclamar regalo') + '</button></div></div>';
  }

  function resultado(id, score, coins, xp, detalle) {
    const S = RL.S;
    const record = score > (S.mini[id] || 0);
    if (record) S.mini[id] = score;
    S.stats.minijuegos++;
    RL.ganar(coins);
    S.puntaje += Math.round(coins / 2);
    RL.ganarXP(xp);
    RL.sfx[coins > 0 ? 'coin' : 'bad']();
    RL.guardar();
    RL.modal({
      titulo: INFO[id].emoji + ' ¡Tiempo!',
      html: '<p class="centro" style="font-size:1.1rem">' + detalle + '</p>' +
        '<div class="centro" style="margin:10px 0"><span class="pill monedas">+' + RL.fmt(coins) + ' 🪙</span> <span class="pill">+' + xp + ' XP</span></div>' +
        (record ? '<p class="centro"><span class="tag verde">¡Nuevo récord: ' + score + '!</span></p>' : ''),
      botones: [
        { txt: 'Jugar otra vez', cls: 'btn-mango', fn: function () { RL.ACT.jugar({ dataset: { id: id } }); } },
        { txt: 'Volver', cls: 'btn', fn: render }
      ], cerrable: false
    });
  }

  /* ---------- Corte rápido ---------- */
  function juegoCorte() {
    const S = RL.S, root = $('#v-juegos');
    root.innerHTML = '<div class="vista-cab"><h2>🔪 Corte rápido</h2><button class="btn chico btn-papaya" data-act="juegosSalir" type="button">Salir</button></div>' +
      '<div class="arena-hud"><span>⏱ <b id="g-t">30</b></span><span>⭐ <b id="g-p">0</b></span><span>🔥 combo <b id="g-c">0</b></span></div>' +
      '<div class="arena" id="arena"></div>';
    const arena = $('#arena');
    const BUENOS = ['🍅', '🧅', '🥕', '🥔', '🍋', '🍓', '🥭', '🍍', '🍄', '🥑', '🫑', '🍎'];
    const T = INFO.corte.t;
    let score = 0, combo = 0, t0 = performance.now(), spawn = 0.3, ultimo = t0, activo = true, raf;
    const items = [];
    function crear() {
      const malo = Math.random() < 0.16;
      const el = document.createElement('div');
      el.className = 'corte-item';
      el.textContent = malo ? '🐛' : RL.pick(BUENOS);
      el.style.left = RL.rand(4, 84) + '%';
      el.style.top = RL.rand(6, 74) + '%';
      const it = { el: el, malo: malo, vida: RL.rand(1.1, 1.7) };
      el.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        if (!activo || it.hecho) return;
        it.hecho = true;
        el.classList.add('cortado');
        if (malo) { score = Math.max(0, score - 3); combo = 0; RL.sfx.bad(); arena.classList.add('sacudir'); setTimeout(function () { arena.classList.remove('sacudir'); }, 300); }
        else { score += 1 + Math.floor(combo / 4); combo++; RL.sfx.pop(); }
        hud();
        setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 360);
      });
      arena.appendChild(el);
      items.push(it);
    }
    function hud() {
      $('#g-p').textContent = score; $('#g-c').textContent = combo;
    }
    function loop(now) {
      if (!activo) return;
      const dt = (now - ultimo) / 1000; ultimo = now;
      const rest = T - (now - t0) / 1000;
      $('#g-t').textContent = Math.max(0, Math.ceil(rest));
      if (rest <= 0) { fin(); return; }
      spawn -= dt;
      if (spawn <= 0 && items.filter(function (i) { return !i.hecho; }).length < 6) {
        crear();
        spawn = Math.max(0.42, 0.8 - (now - t0) / 1000 * 0.012);
      }
      for (let i = items.length - 1; i >= 0; i--) {
        const it = items[i];
        if (it.hecho) { items.splice(i, 1); continue; }
        it.vida -= dt;
        if (it.vida <= 0) {
          if (!it.malo) { combo = 0; hud(); }
          if (it.el.parentNode) it.el.parentNode.removeChild(it.el);
          items.splice(i, 1);
        }
      }
      raf = requestAnimationFrame(loop);
    }
    function fin() {
      activo = false; parar = null;
      const coins = Math.round(score * (0.8 + 0.1 * S.nivel));
      resultado('corte', score, coins, Math.round(score * 0.6), 'Cortaste <b>' + score + '</b> puntos de ingredientes.');
    }
    raf = requestAnimationFrame(loop);
    parar = function () { activo = false; cancelAnimationFrame(raf); };
  }

  /* ---------- Caja veloz ---------- */
  function juegoCaja() {
    const S = RL.S, root = $('#v-juegos');
    const DEN = [1, 2, 5, 10, 20, 50];
    root.innerHTML = '<div class="vista-cab"><h2>🧾 Caja veloz</h2><button class="btn chico btn-papaya" data-act="juegosSalir" type="button">Salir</button></div>' +
      '<div class="caja-mini card"><div class="arena-hud"><span>⏱ <b id="cv-t">45</b></span><span>✅ <b id="cv-n">0</b></span></div>' +
      '<div class="ticket"><div class="linea"><span>Cuenta</span><b id="cv-cuenta"></b></div><div class="linea"><span>Pagó con</span><b id="cv-pago"></b></div><div class="linea total"><span>Devuelta</span><b>?</b></div></div>' +
      '<div class="suma-cambio">Entregado: <b id="cv-sum">0</b></div><div class="bandeja-cambio" id="cv-tray"></div>' +
      '<div class="denoms">' + DEN.map(function (d) { return '<button class="denom ' + (d <= 5 ? 'moneda' : 'billete') + '" data-d="' + d + '" type="button">' + d + '</button>'; }).join('') + '</div>' +
      '<div class="centro"><button class="btn chico" id="cv-clear" type="button">Limpiar</button></div><p class="centro muted" id="cv-msg" style="margin-top:6px">&nbsp;</p></div>';
    let tiempo = INFO.caja.t, rondas = 0, need = 0, sum = 0, activo = true;
    const tray = [];
    function nueva() {
      let cuenta, pago;
      do {
        cuenta = RL.randInt(3, 95);
        const op = [10, 20, 50, 100].filter(function (b) { return b > cuenta; });
        pago = op[Math.min(op.length - 1, Math.random() < 0.6 ? 0 : 1)];
      } while (pago - cuenta < 1);
      need = pago - cuenta; sum = 0; tray.length = 0;
      $('#cv-cuenta').textContent = '🪙 ' + cuenta; $('#cv-pago').textContent = '💵 ' + pago;
      pintar();
    }
    function pintar() {
      $('#cv-sum').textContent = sum;
      $('#cv-tray').innerHTML = tray.map(function (d) { return '<span class="denom ' + (d <= 5 ? 'moneda' : 'billete') + '">' + d + '</span>'; }).join('');
      $('#cv-n').textContent = rondas;
    }
    const msg = function (t) { const m = $('#cv-msg'); if (m) m.textContent = t; };
    function click(e) {
      const b = e.target.closest('.denom[data-d]');
      if (!b || !activo) return;
      const d = parseInt(b.dataset.d, 10);
      tray.push(d); sum += d; RL.sfx.pop();
      if (sum === need) { rondas++; RL.sfx.ok(); msg('¡Exacto!'); nueva(); }
      else if (sum > need) { tiempo -= 2; RL.sfx.bad(); msg('Te pasaste. -2 segundos'); sum = 0; tray.length = 0; pintar(); }
      else pintar();
    }
    root.addEventListener('click', click);
    $('#cv-clear').addEventListener('click', function () { sum = 0; tray.length = 0; pintar(); });
    nueva();
    const iv = setInterval(function () {
      if (!activo) return;
      tiempo -= 0.1;
      const t = $('#cv-t');
      if (t) t.textContent = Math.max(0, Math.ceil(tiempo));
      if (tiempo <= 0) {
        activo = false; clearInterval(iv); root.removeEventListener('click', click); parar = null;
        resultado('caja', rondas, rondas * (4 + S.nivel), rondas * 2, 'Atendiste <b>' + rondas + '</b> clientes sin equivocarte de más.');
      }
    }, 100);
    parar = function () { activo = false; clearInterval(iv); root.removeEventListener('click', click); };
  }

  /* ---------- Pedidos voladores ---------- */
  function juegoVuelo() {
    const S = RL.S, root = $('#v-juegos');
    const COMIDAS = ['🍔', '🍕', '🌭', '🍰', '🥟', '🍟', '🍩', '🌮'];
    root.innerHTML = '<div class="vista-cab"><h2>🛩️ Pedidos voladores</h2><button class="btn chico btn-papaya" data-act="juegosSalir" type="button">Salir</button></div>' +
      '<div class="arena-hud"><span>⏱ <b id="v-t">30</b></span><span>⭐ <b id="v-p">0</b></span><span>Atrapa: <span class="objetivo-vuelo" id="v-obj"></span></span></div>' +
      '<div class="arena" id="arena"></div>';
    const arena = $('#arena');
    const T = INFO.vuelo.t;
    let score = 0, objetivo = RL.pick(COMIDAS), t0 = performance.now(), ultimo = t0, spawn = 0.2, cambio = 7, activo = true, raf;
    const vol = [];
    $('#v-obj').textContent = objetivo;
    function crear() {
      const w = arena.clientWidth || 600, h = arena.clientHeight || 340;
      const izq = Math.random() < 0.5;
      const e = Math.random() < 0.38 ? objetivo : RL.pick(COMIDAS);
      const el = document.createElement('div');
      el.className = 'volador'; el.textContent = e;
      const v = { el: el, e: e, x: izq ? -50 : w + 10, y: RL.rand(6, h - 56), vx: (izq ? 1 : -1) * RL.rand(120, 230), w: w };
      el.addEventListener('pointerdown', function (ev) {
        ev.preventDefault();
        if (!activo || v.hecho) return;
        v.hecho = true;
        if (v.e === objetivo) { score++; RL.sfx.pop(); el.textContent = '✨'; }
        else { score = Math.max(0, score - 1); RL.sfx.bad(); el.textContent = '💥'; }
        $('#v-p').textContent = score;
        setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 250);
      });
      arena.appendChild(el);
      vol.push(v);
    }
    function loop(now) {
      if (!activo) return;
      const dt = (now - ultimo) / 1000; ultimo = now;
      const rest = T - (now - t0) / 1000;
      $('#v-t').textContent = Math.max(0, Math.ceil(rest));
      if (rest <= 0) { fin(); return; }
      spawn -= dt; cambio -= dt;
      if (cambio <= 0) { cambio = 7; objetivo = RL.pick(COMIDAS); $('#v-obj').textContent = objetivo; }
      if (spawn <= 0) { crear(); spawn = RL.rand(0.35, 0.65); }
      for (let i = vol.length - 1; i >= 0; i--) {
        const v = vol[i];
        if (v.hecho) { vol.splice(i, 1); continue; }
        v.x += v.vx * dt;
        v.el.style.transform = 'translate(' + v.x + 'px,' + v.y + 'px)';
        if (v.x < -80 || v.x > v.w + 80) { if (v.el.parentNode) v.el.parentNode.removeChild(v.el); vol.splice(i, 1); }
      }
      raf = requestAnimationFrame(loop);
    }
    function fin() {
      activo = false; parar = null;
      resultado('vuelo', score, Math.round(score * (2 + S.nivel * 0.2)), score, 'Atrapaste <b>' + score + '</b> pedidos al vuelo.');
    }
    raf = requestAnimationFrame(loop);
    parar = function () { activo = false; cancelAnimationFrame(raf); };
  }

  /* ---------- Regalo diario ---------- */
  function ayer() {
    const d = new Date(); d.setDate(d.getDate() - 1);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  RL.vistas.juegos = { render: render, salir: pararJuego };
  RL.ACT.juegosSalir = function () { pararJuego(); render(); };
  RL.ACT.jugar = function (el) {
    pararJuego();
    const id = el.dataset.id;
    if (id === 'corte') juegoCorte(); else if (id === 'caja') juegoCaja(); else if (id === 'vuelo') juegoVuelo();
  };
  RL.ACT.regalo = function () {
    const S = RL.S, hoy = RL.hoy();
    if (S.regalo.ultimo === hoy) { RL.toast('Ya reclamaste el regalo de hoy', 'mal'); return; }
    S.regalo.racha = S.regalo.ultimo === ayer() ? S.regalo.racha + 1 : 1;
    S.regalo.ultimo = hoy;
    const dia = ((S.regalo.racha - 1) % 7) + 1;
    const monedas = 30 + 10 * (dia - 1) + (dia === 7 ? 100 : 0);
    RL.ganar(monedas);
    let extra = '';
    if (dia === 7) {
      const cap = RL.capacidad();
      const ids = RL.shuffle(Object.keys(D.ING)).slice(0, 4);
      ids.forEach(function (id) { S.despensa[id] = Math.min(cap, RL.stock(id) + 3); });
      extra = '<p class="centro" style="margin-top:6px">Bono de la semana: ' + ids.map(function (id) { return D.ING[id].emoji + ' ' + D.ING[id].nombre + ' x3'; }).join(', ') + '</p>';
    }
    RL.sfx.coin();
    RL.guardar(true);
    RL.modal({
      titulo: '🎁 ¡Regalo diario!',
      html: '<div class="nivel-grande" style="font-size:3.4rem">+' + monedas + ' 🪙</div><p class="centro">Día <b>' + dia + '</b> de 7 de tu racha.</p>' + extra,
      botones: [{ txt: '¡Gracias!', cls: 'btn-mango', fn: render }]
    });
  };
})();
