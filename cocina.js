/* ===========================================================
   RESTAURANTE LOCO - Cocina interactiva paso a paso
   =========================================================== */
(function () {
  'use strict';
  const RL = window.RL, D = RL.D, $ = RL.$;

  const PASO = {
    cortar:   { emoji: '🔪', n: 'Cortar' },
    sarten:   { emoji: '🍳', n: 'Sartén' },
    freidora: { emoji: '🍟', n: 'Freír' },
    horno:    { emoji: '♨️', n: 'Hornear' },
    hervir:   { emoji: '🍲', n: 'Hervir' },
    mezclar:  { emoji: '🥄', n: 'Mezclar' },
    licuar:   { emoji: '🥤', n: 'Licuar' },
    armar:    { emoji: '🍽️', n: 'Armar' }
  };
  const GARNISH = [
    { key: 'g_hierbas', e: '🌿', n: 'Hierbas' }, { key: 'g_limon', e: '🍋', n: 'Limón' },
    { key: 'g_tomate', e: '🍅', n: 'Tomate' }, { key: 'g_sal', e: '🧂', n: 'Sal' }, { key: 'g_lechuga', e: '🥬', n: 'Lechuga' }
  ];

  let limpiar = null;
  function limpiarPaso() { if (limpiar) { try { limpiar(); } catch (e) { /* nada */ } limpiar = null; } }

  function textoPuntaje(s) {
    return s >= 90 ? '¡Perfecto!' : s >= 70 ? '¡Muy bien!' : s >= 45 ? 'Bien' : 'Uy...';
  }
  function flotante(area, s, extra) {
    const f = document.createElement('div');
    f.className = 'res-flotante';
    f.textContent = (extra || textoPuntaje(s)) + ' ' + s;
    area.appendChild(f);
    setTimeout(function () { if (f.parentNode) f.parentNode.removeChild(f); }, 850);
  }
  function titulos(t, a) {
    const h = $('#paso-titulo'), p = $('#paso-ayuda');
    if (h) h.textContent = t;
    if (p) p.textContent = a;
  }
  function teclaEspacio(fn) {
    function kd(e) {
      if (e.code === 'Space' || e.key === 'Enter') { e.preventDefault(); if (!e.repeat) fn(e); }
    }
    document.addEventListener('keydown', kd);
    return function () { document.removeEventListener('keydown', kd); };
  }

  /* ---------- Paso: cortar ---------- */
  function pasoCortar(area, paso, rec, fin) {
    const lvl = RL.ap('cuchillos'), info = D.ING[paso.ing];
    const half = 0.09 + 0.012 * (lvl - 1), period = 1300 * (1 + 0.1 * (lvl - 1));
    titulos('Cortar: ' + info.nombre, 'Toca ¡Cortar! cuando la aguja esté en la zona verde. Son 3 cortes.');
    area.innerHTML = '<div class="ing-grande" id="c-ing">' + info.emoji + '</div>' +
      '<div class="medidor"><div class="zona-ok" id="c-zona"></div><div class="aguja" id="c-ag"></div></div>' +
      '<div class="pips" id="c-pips">○○○</div>' +
      '<button class="btn btn-papaya enorme" id="c-btn" type="button">🔪 ¡Cortar!</button>';
    const zona = $('#c-zona'), ag = $('#c-ag'), ing = $('#c-ing'), pips = $('#c-pips');
    let centro, cortes = 0, activo = true, raf;
    const scores = [], t0 = performance.now();
    function nuevaZona() {
      centro = RL.rand(0.22, 0.78);
      zona.style.left = ((centro - half) * 100) + '%';
      zona.style.width = (half * 200) + '%';
    }
    function pos(now) { const x = ((now - t0) / period) % 2; return x < 1 ? x : 2 - x; }
    function loop(now) { if (!activo) return; ag.style.left = (pos(now) * 100) + '%'; raf = requestAnimationFrame(loop); }
    nuevaZona();
    raf = requestAnimationFrame(loop);
    function cortar() {
      if (!activo) return;
      const d = Math.abs(pos(performance.now()) - centro);
      let s = d <= half ? 100 - (d / half) * 18 : Math.max(8, 78 - (d - half) * 220);
      s = Math.round(s);
      scores.push(s); cortes++;
      RL.sfx.pop();
      ing.classList.remove('pop'); void ing.offsetWidth; ing.classList.add('pop');
      pips.textContent = '●'.repeat(cortes) + '○'.repeat(3 - cortes);
      flotante(area, s);
      if (cortes >= 3) {
        activo = false; cancelAnimationFrame(raf);
        const avg = Math.round(scores.reduce(function (a, b) { return a + b; }, 0) / 3);
        setTimeout(function () { fin(avg); }, 450);
      } else nuevaZona();
    }
    $('#c-btn').addEventListener('click', cortar);
    const quitar = teclaEspacio(cortar);
    return function () { activo = false; cancelAnimationFrame(raf); quitar(); };
  }

  /* ---------- Pasos de calor: sartén, freidora, horno, hervir ---------- */
  const CALOR = {
    sarten:   { emoji: '🍳', dur: 4200, app: 'estufa', tit: 'Cocinar en el sartén' },
    freidora: { emoji: '🍟', dur: 3000, app: 'freidora', tit: 'Freír' },
    horno:    { emoji: '♨️', dur: 6200, app: 'horno', tit: 'Hornear' },
    hervir:   { emoji: '🍲', dur: 5200, app: 'estufa', tit: 'Hervir' }
  };
  function pasoCalor(tipo) {
    return function (area, paso, rec, fin) {
      const cfg = CALOR[tipo], lvl = RL.ap(cfg.app), info = D.ING[paso.ing];
      const dur = cfg.dur * (1 + 0.09 * (lvl - 1)), centro = 0.74, half = 0.075 + 0.013 * (lvl - 1);
      titulos(cfg.tit + ': ' + info.nombre, 'Mira cómo se calienta y toca ¡Sacar! cuando la barra esté en la zona verde.');
      area.innerHTML = '<div class="ing-grande sizzle" id="h-ing">' + info.emoji + '</div>' +
        '<div class="medidor"><div class="zona-ok" style="left:' + ((centro - half) * 100) + '%;width:' + (half * 200) + '%"></div><div class="relleno" id="h-fill" style="width:0"></div></div>' +
        '<button class="btn btn-papaya enorme" id="h-btn" type="button">¡Sacar!</button>';
      const fill = $('#h-fill'), ing = $('#h-ing');
      let activo = true, raf;
      const t0 = performance.now();
      function terminar(s, quemado) {
        activo = false; cancelAnimationFrame(raf);
        ing.classList.remove('sizzle');
        if (quemado) ing.textContent = '🔥';
        RL.sfx[quemado ? 'bad' : 'pop']();
        flotante(area, s, quemado ? '¡Se quemó!' : null);
        setTimeout(function () { fin(s); }, 650);
      }
      function loop(now) {
        if (!activo) return;
        const p = (now - t0) / dur;
        fill.style.width = Math.min(100, p * 100) + '%';
        ing.style.filter = 'brightness(' + (1 - 0.55 * Math.min(1, p)) + ')';
        if (p >= 1) { terminar(5, true); return; }
        raf = requestAnimationFrame(loop);
      }
      raf = requestAnimationFrame(loop);
      function sacar() {
        if (!activo) return;
        const p = (performance.now() - t0) / dur, d = Math.abs(p - centro);
        let s = d <= half ? 100 - (d / half) * 15 : Math.max(10, 80 - (d - half) * 230);
        terminar(Math.round(s), false);
      }
      $('#h-btn').addEventListener('click', sacar);
      const quitar = teclaEspacio(sacar);
      return function () { activo = false; cancelAnimationFrame(raf); quitar(); };
    };
  }

  /* ---------- Paso: mezclar ---------- */
  function pasoMezclar(area, paso, rec, fin) {
    const info = D.ING[paso.ing], N = 14, T = 7000;
    titulos('Mezclar: ' + info.nombre, 'Toca ¡Mezclar! lo más rápido que puedas (' + N + ' veces).');
    area.innerHTML = '<div class="ing-grande" id="m-ing">' + info.emoji + '</div>' +
      '<div style="width:100%"><div class="barra"><i id="m-prog" style="width:0"></i></div>' +
      '<div class="barra" style="margin-top:6px;height:8px"><i id="m-tiempo" style="width:100%;background:var(--mango)"></i></div></div>' +
      '<button class="btn btn-uva enorme" id="m-btn" type="button">🥄 ¡Mezclar!</button>';
    let cuenta = 0, t0 = 0, activo = true, raf;
    const ing = $('#m-ing'), prog = $('#m-prog'), tiempo = $('#m-tiempo');
    function cerrar(s) {
      activo = false; cancelAnimationFrame(raf);
      flotante(area, s);
      setTimeout(function () { fin(s); }, 500);
    }
    function loop(now) {
      if (!activo) return;
      const r = 1 - (now - t0) / T;
      tiempo.style.width = Math.max(0, r * 100) + '%';
      if (r <= 0) { cerrar(Math.round(25 + 55 * cuenta / N)); return; }
      raf = requestAnimationFrame(loop);
    }
    function tap() {
      if (!activo) return;
      if (!t0) { t0 = performance.now(); raf = requestAnimationFrame(loop); }
      cuenta++;
      RL.sfx.pop();
      ing.style.transform = 'rotate(' + (cuenta % 2 ? 14 : -14) + 'deg) scale(1.1)';
      prog.style.width = Math.min(100, cuenta / N * 100) + '%';
      if (cuenta >= N) {
        const usado = (performance.now() - t0) / T;
        cerrar(Math.round(RL.clamp(100 - usado * 25, 75, 100)));
      }
    }
    $('#m-btn').addEventListener('click', tap);
    const quitar = teclaEspacio(tap);
    return function () { activo = false; cancelAnimationFrame(raf); quitar(); };
  }

  /* ---------- Paso: licuar (mantener presionado) ---------- */
  function pasoLicuar(area, paso, rec, fin) {
    const lvl = RL.ap('licuadora'), info = D.ING[paso.ing];
    const half = 0.08 + 0.015 * (lvl - 1), centro = 0.78, tLleno = 1900 * (1 + 0.08 * (lvl - 1));
    titulos('Licuar: ' + info.nombre, 'Mantén presionado el botón y suéltalo cuando la barra esté en la zona verde.');
    area.innerHTML = '<div class="ing-grande" id="l-ing">' + info.emoji + '</div>' +
      '<div class="medidor"><div class="zona-ok" style="left:' + ((centro - half) * 100) + '%;width:' + (half * 200) + '%"></div><div class="relleno" id="l-fill" style="width:0"></div></div>' +
      '<button class="btn btn-turq enorme" id="l-btn" type="button" style="touch-action:none;user-select:none">🥤 Mantén presionado</button>';
    const fill = $('#l-fill'), ing = $('#l-ing'), btn = $('#l-btn');
    let activo = true, apretando = false, t0 = 0, raf;
    function terminar(s, derrame) {
      activo = false; apretando = false; cancelAnimationFrame(raf);
      ing.classList.remove('sizzle');
      RL.sfx[derrame ? 'bad' : 'pop']();
      flotante(area, s, derrame ? '¡Se derramó!' : null);
      setTimeout(function () { fin(s); }, 600);
    }
    function loop(now) {
      if (!activo || !apretando) return;
      const p = (now - t0) / tLleno;
      fill.style.width = Math.min(100, p * 100) + '%';
      if (p >= 1) { terminar(10, true); return; }
      raf = requestAnimationFrame(loop);
    }
    function empezar() {
      if (!activo || apretando) return;
      apretando = true; t0 = performance.now(); ing.classList.add('sizzle');
      raf = requestAnimationFrame(loop);
    }
    function soltar() {
      if (!activo || !apretando) return;
      const p = (performance.now() - t0) / tLleno, d = Math.abs(p - centro);
      const s = d <= half ? 100 - (d / half) * 15 : Math.max(10, 80 - (d - half) * 230);
      terminar(Math.round(s), false);
    }
    btn.addEventListener('pointerdown', function (e) { try { btn.setPointerCapture(e.pointerId); } catch (x) { /* nada */ } empezar(); });
    btn.addEventListener('pointerup', soltar);
    btn.addEventListener('pointercancel', soltar);
    function kd(e) { if (e.code === 'Space') { e.preventDefault(); if (!e.repeat) empezar(); } }
    function ku(e) { if (e.code === 'Space') { e.preventDefault(); soltar(); } }
    document.addEventListener('keydown', kd); document.addEventListener('keyup', ku);
    return function () { activo = false; cancelAnimationFrame(raf); document.removeEventListener('keydown', kd); document.removeEventListener('keyup', ku); };
  }

  /* ---------- Paso: armar el plato ---------- */
  function pasoArmar(area, paso, rec, fin) {
    const ids = Object.keys(rec.ing);
    let target = ids.slice(0, Math.max(3, Math.min(5, ids.length))).map(function (id) {
      return { key: id, e: D.ING[id].emoji, n: D.ING[id].nombre };
    });
    if (target.length < 3) {
      const extra = RL.shuffle(GARNISH);
      for (let i = 0; target.length < 3; i++) target.push(extra[i]);
    }
    const claves = target.map(function (t) { return t.key; });
    const emojisObjetivo = target.map(function (t) { return t.e; });
    const todos = Object.keys(D.ING).filter(function (id) {
      return claves.indexOf(id) < 0 && ids.indexOf(id) < 0 && emojisObjetivo.indexOf(D.ING[id].emoji) < 0;
    });
    const decoys = RL.shuffle(todos).slice(0, 2).map(function (id) { return { key: id, e: D.ING[id].emoji, n: D.ING[id].nombre }; });
    const bandeja = RL.shuffle(target.concat(decoys));
    const memoria = rec.nivel >= 5;
    titulos('Armar el plato', memoria ? 'Memoriza el orden: se esconde en unos segundos. Toca los ingredientes en ese orden.' : 'Toca los ingredientes en el orden indicado.');
    area.innerHTML = '<div class="objetivo-armar" id="a-obj">' + target.map(function (t, i) {
      return '<div class="slot' + (i === 0 ? ' siguiente' : '') + '" data-i="' + i + '">' + t.e + '<small>' + RL.esc(t.n) + '</small></div>';
    }).join('') + '</div><div class="bandeja-armar" id="a-tray">' + bandeja.map(function (t) {
      return '<button type="button" class="item-armar" data-k="' + t.key + '">' + t.e + '<small>' + RL.esc(t.n) + '</small></button>';
    }).join('') + '</div>';
    let pos = 0, err = 0, activo = true, oculto = false;
    const slots = RL.$$('.slot', area);
    const timer = memoria ? setTimeout(function () {
      oculto = true;
      slots.forEach(function (s, i) { if (i >= pos) s.textContent = '❔'; });
    }, 2800) : null;
    $('#a-tray').addEventListener('click', function (ev) {
      const b = ev.target.closest('.item-armar');
      if (!b || !activo || b.classList.contains('usado')) return;
      if (b.dataset.k === claves[pos]) {
        b.classList.add('usado');
        slots[pos].innerHTML = target[pos].e + '<small>' + RL.esc(target[pos].n) + '</small>';
        slots[pos].classList.remove('siguiente'); slots[pos].classList.add('listo');
        pos++; RL.sfx.pop();
        if (pos >= claves.length) {
          activo = false;
          const s = Math.max(25, 100 - 14 * err);
          flotante(area, s);
          setTimeout(function () { fin(s); }, 550);
        } else if (!oculto) slots[pos].classList.add('siguiente');
      } else {
        err++; RL.sfx.bad();
        b.classList.remove('mal'); void b.offsetWidth; b.classList.add('mal');
      }
    });
    return function () { activo = false; if (timer) clearTimeout(timer); };
  }

  const PASOS = {
    cortar: pasoCortar, sarten: pasoCalor('sarten'), freidora: pasoCalor('freidora'), horno: pasoCalor('horno'),
    hervir: pasoCalor('hervir'), mezclar: pasoMezclar, licuar: pasoLicuar, armar: pasoArmar
  };

  /* ---------- Flujo de cocinado ---------- */
  RL.iniciarCocina = function (rid) {
    const R = RL.R, rec = D.REC[rid];
    if (R.cooking) { RL.toast('Ya estás cocinando algo', 'mal'); RL.irTab('cocina'); return false; }
    const f = RL.faltan(rec);
    if (f.length) {
      RL.sfx.bad();
      RL.toast('Te falta: ' + f.map(function (x) { return D.ING[x.id].emoji + ' ' + D.ING[x.id].nombre + ' x' + x.falta; }).join(', '), 'mal');
      return false;
    }
    RL.consumir(rec);
    R.cooking = { rid: rid, i: 0, scores: [] };
    R.cocinaResultado = null;
    RL.marcar('hud');
    RL.irTab('cocina');
    render();
    return true;
  };

  function finPaso(st, s) {
    const R = RL.R;
    if (R.cooking !== st) return;
    st.scores.push(s);
    st.i++;
    render();
  }

  function terminarPlato() {
    const S = RL.S, R = RL.R, st = R.cooking, rec = D.REC[st.rid];
    const q = Math.round(st.scores.reduce(function (a, b) { return a + b; }, 0) / st.scores.length);
    S.listos.push({ rid: st.rid, q: q });
    S.stats.cocinados++;
    RL.ganarXP(2 + Math.round(q / 20));
    R.cooking = null;
    R.cocinaResultado = { rid: st.rid, q: q };
    RL.sfx.ok();
    if (RL.autoServir) RL.autoServir();
    RL.marcar('salon'); RL.marcar('tabs'); RL.marcar('hud');
    RL.guardar();
    return rec;
  }

  function renderEstacion(root) {
    const R = RL.R, st = R.cooking, rec = D.REC[st.rid];
    if (st.i >= rec.pasos.length) { terminarPlato(); render(); return; }
    root.innerHTML = '<div class="vista-cab"><h2>' + rec.emoji + ' ' + RL.esc(rec.nombre) + '</h2>' +
      '<button class="btn chico btn-papaya" data-act="cancelarCocina" type="button">Cancelar</button></div>' +
      '<div class="paso-rail">' + rec.pasos.map(function (p, i) {
        return '<span class="paso-dot ' + (i < st.i ? 'hecho' : i === st.i ? 'actual' : '') + '">' + PASO[p.tipo].emoji + ' ' + PASO[p.tipo].n + '</span>';
      }).join('') + '</div>' +
      '<div class="estacion"><h3 id="paso-titulo"></h3><p class="muted" id="paso-ayuda"></p><div class="estacion-area" id="paso-area"></div></div>';
    const paso = rec.pasos[st.i];
    limpiar = PASOS[paso.tipo]($('#paso-area'), paso, rec, function (s) { finPaso(st, s); });
  }

  function renderResultado(root) {
    const res = RL.R.cocinaResultado, rec = D.REC[res.rid];
    const otro = !RL.faltan(rec).length;
    const sc = RL.sinCubrir();
    const sig = Object.keys(sc).filter(function (id) { return !RL.faltan(D.REC[id]).length; })[0];
    const sigBtn = sig ? '<button class="btn btn-mango" data-act="cocinar" data-id="' + sig + '" type="button">Siguiente pedido ' + D.REC[sig].emoji + ' <kbd class="atajo">Enter</kbd></button>' : '';
    root.innerHTML = '<div class="estacion"><div class="resultado-plato">' + rec.emoji + '</div>' +
      '<h2 style="margin-top:6px">' + RL.esc(rec.nombre) + '</h2>' +
      '<p class="estrellas" style="font-size:1.8rem;margin:4px 0">' + RL.estrellasTxt(res.q) + '</p>' +
      '<p>Calidad <b>' + res.q + '</b> · vale <b>' + RL.fmt(RL.precioPlato(rec.id, res.q)) + ' 🪙</b></p>' +
      '<p class="muted" style="margin-top:4px">' + (RL.S.autoServir === false ? 'El plato ya está en el pase, listo para servir.' : 'Se sirve solo a la mesa que lo pidió.') + '</p>' +
      '<div class="modal-acciones">' +
      sigBtn +
      '<button class="btn ' + (sigBtn ? '' : 'btn-mango') + '" data-act="cocinar" data-id="' + rec.id + '" type="button"' + (otro ? '' : ' disabled') + '>Otro igual' + (sigBtn ? '' : ' <kbd class="atajo">Enter</kbd>') + '</button>' +
      '<button class="btn btn-turq" data-act="tab" data-id="salon" type="button">Ir al salón</button>' +
      '<button class="btn" data-act="cocinaMenu" type="button">Más recetas</button></div></div>';
  }

  /* ---------- Menú de la cocina ---------- */
  function renderMenu(root) {
    const S = RL.S, R = RL.R;
    const sc = RL.sinCubrir();
    const idsPend = Object.keys(sc);
    if (!R.cocinaCat) R.cocinaCat = idsPend.length ? 'pend' : 'todas';
    const cat = R.cocinaCat;
    let recetas = RL.recetasPropias();
    if (cat === 'pend') recetas = recetas.filter(function (r) { return sc[r.id]; });
    else if (cat !== 'todas') recetas = recetas.filter(function (r) { return r.cat === cat; });

    recetas = recetas.slice().sort(function (a, b) { return (RL.faltan(a).length ? 1 : 0) - (RL.faltan(b).length ? 1 : 0); });
    let jobs = [];
    S.equipo.forEach(function (st) {
      const rt = R.staffRT[st.id];
      if (st.rol === 'cocinero' && rt && rt.job) jobs.push(st.nombre + ' cocina ' + D.REC[rt.job.rid].emoji + ' ' + D.REC[rt.job.rid].nombre + ' (' + Math.min(100, Math.round(rt.job.t / rt.job.dur * 100)) + '%)');
    });

    let html = '<div class="vista-cab"><h2>👩‍🍳 Cocina</h2><span class="muted">Elige qué cocinar. Tú pones el punto.</span></div>';
    html += '<div class="card"><h3>Pedidos sin plato</h3><div class="fila" style="margin-top:6px">' +
      (idsPend.length ? idsPend.map(function (rid) {
        const r = D.REC[rid];
        return '<div class="comanda"><span class="e">' + r.emoji + '</span><span>' + RL.esc(r.nombre) + ' <b>x' + sc[rid] + '</b></span>' +
          '<button class="btn chico btn-mango" data-act="cocinar" data-id="' + rid + '" type="button">Cocinar</button></div>';
      }).join('') : '<span class="muted">No hay pedidos esperando. Cocina por adelantado o espera clientes.</span>') +
      '</div>' + (jobs.length ? '<p class="muted" style="margin-top:8px">' + jobs.map(RL.esc).join(' · ') + '</p>' : '') + '</div>';

    html += '<div class="card"><h3>Pase (platos listos)</h3><div class="listos-estante" style="margin-top:6px">' +
      (S.listos.length ? S.listos.map(function (p) {
        const r = D.REC[p.rid];
        return '<div class="plato-listo" title="' + RL.esc(r.nombre) + '">' + r.emoji + '<small class="estrellas">' + RL.estrellasTxt(p.q) + '</small></div>';
      }).join('') : '<span class="muted">Vacío por ahora.</span>') + '</div></div>';

    html += '<div class="filtros" style="margin-top:12px">' +
      '<button class="chip ' + (cat === 'pend' ? 'on' : '') + '" data-act="cocinaCat" data-id="pend" type="button">🔔 Pedidos</button>' +
      '<button class="chip ' + (cat === 'todas' ? 'on' : '') + '" data-act="cocinaCat" data-id="todas" type="button">Todas</button>' +
      Object.keys(D.CATEGORIAS).map(function (k) {
        return '<button class="chip ' + (cat === k ? 'on' : '') + '" data-act="cocinaCat" data-id="' + k + '" type="button">' + D.CATEGORIAS[k].emoji + ' ' + D.CATEGORIAS[k].nombre + '</button>';
      }).join('') + '</div>';

    html += '<div class="grid c3">' + (recetas.length ? recetas.map(function (r) {
      const f = RL.faltan(r), faltan = {};
      f.forEach(function (x) { faltan[x.id] = x.falta; });
      return '<div class="receta-card ' + (f.length ? 'falta' : '') + '"><div class="fila entre"><span class="emo">' + r.emoji + '</span><span class="tag verde">' + RL.fmt(r.precio) + ' 🪙</span></div>' +
        '<b style="line-height:1.1">' + RL.esc(r.nombre) + '</b>' +
        '<div class="ings">' + Object.keys(r.ing).map(function (id) {
          return '<span class="ing-mini ' + (faltan[id] ? 'no' : '') + '" title="' + RL.esc(D.ING[id].nombre) + '">' + D.ING[id].emoji + r.ing[id] + '</span>';
        }).join('') + '</div>' +
        '<button class="btn chico ' + (f.length ? '' : 'btn-mango') + '" data-act="cocinar" data-id="' + r.id + '" type="button">' + (f.length ? 'Faltan ingredientes' : 'Cocinar') + '</button></div>';
    }).join('') : '<p class="muted">No hay recetas en esta lista.</p>') + '</div>';
    root.innerHTML = html;
  }

  function render() {
    const root = $('#v-cocina'), R = RL.R;
    limpiarPaso();
    if (R.cooking) renderEstacion(root);
    else if (R.cocinaResultado) renderResultado(root);
    else renderMenu(root);
  }

  RL.vistas.cocina = {
    render: render,
    salir: limpiarPaso,
    refrescar: function () { if (!RL.R.cooking && !RL.R.cocinaResultado) render(); }
  };

  RL.ACT.cocinar = function (el) { RL.iniciarCocina(el.dataset.id); };
  RL.ACT.cocinaCat = function (el) { RL.R.cocinaCat = el.dataset.id; RL.R.cocinaResultado = null; render(); };
  RL.ACT.cocinaMenu = function () { RL.R.cocinaResultado = null; render(); };
  RL.ACT.cancelarCocina = function () {
    RL.modal({
      titulo: '¿Cancelar este plato?', html: '<p class="centro">Perderás los ingredientes que ya usaste.</p>',
      botones: [
        { txt: 'Seguir cocinando', cls: 'btn-turq' },
        { txt: 'Sí, cancelar', cls: 'btn-papaya', fn: function () { limpiarPaso(); RL.R.cooking = null; RL.marcar('cocina'); render(); } }
      ]
    });
  };
})();
