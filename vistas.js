/* ===========================================================
   RESTAURANTE LOCO - Vistas: recetas, mejoras, equipo, perfil
   =========================================================== */
(function () {
  'use strict';
  const RL = window.RL, D = RL.D, $ = RL.$;

  function aviso(r) { if (r && r.msg) RL.toast(r.msg, r.ok ? 'ok' : 'mal'); }

  /* =========================== RECETAS =========================== */
  function renderRecetas() {
    const S = RL.S, R = RL.R;
    const cat = R.recCat || 'todas', fil = R.recFiltro || 'todas';
    let lista = D.REC_LISTA.slice().sort(function (a, b) { return a.nivel - b.nivel || a.nombre.localeCompare(b.nombre, 'es'); });
    if (cat !== 'todas') lista = lista.filter(function (r) { return r.cat === cat; });
    if (fil === 'mias') lista = lista.filter(function (r) { return S.recetas[r.id]; });
    else if (fil === 'disponibles') lista = lista.filter(function (r) { return !S.recetas[r.id] && S.nivel >= r.nivel; });
    const total = Object.keys(S.recetas).length;
    let html = '<div class="vista-cab"><h2>📖 Recetas</h2><span class="tag verde">Tienes ' + total + ' de ' + D.REC_LISTA.length + '</span></div>' +
      '<div class="filtros"><button class="chip ' + (fil === 'todas' ? 'on' : '') + '" data-act="recFiltro" data-id="todas" type="button">Todas</button>' +
      '<button class="chip ' + (fil === 'mias' ? 'on' : '') + '" data-act="recFiltro" data-id="mias" type="button">✅ Mis recetas</button>' +
      '<button class="chip ' + (fil === 'disponibles' ? 'on' : '') + '" data-act="recFiltro" data-id="disponibles" type="button">🔓 Para desbloquear</button></div>' +
      '<div class="filtros"><button class="chip ' + (cat === 'todas' ? 'on' : '') + '" data-act="recCat" data-id="todas" type="button">Todo</button>' +
      Object.keys(D.CATEGORIAS).map(function (k) {
        return '<button class="chip ' + (cat === k ? 'on' : '') + '" data-act="recCat" data-id="' + k + '" type="button">' + D.CATEGORIAS[k].emoji + ' ' + D.CATEGORIAS[k].nombre + '</button>';
      }).join('') + '</div><div class="grid c3">';
    html += lista.length ? lista.map(function (r) {
      const tiene = !!S.recetas[r.id], puede = S.nivel >= r.nivel;
      let accion;
      if (tiene) accion = '<button class="btn chico btn-turq" data-act="cocinar" data-id="' + r.id + '" type="button">Cocinar</button>';
      else if (puede) accion = '<button class="btn chico btn-mango" data-act="desbloquear" data-id="' + r.id + '" type="button">Desbloquear 🪙 ' + RL.fmt(r.desbloqueo) + '</button>';
      else accion = '<span class="tag gris">🔒 Nivel ' + r.nivel + '</span>';
      return '<div class="item-card ' + (!tiene && !puede ? 'bloq' : '') + '"><div class="fila entre"><span class="emo">' + r.emoji + '</span><span class="tag ' + (tiene ? 'verde' : 'gris') + '">' + (tiene ? 'Tuya' : D.CATEGORIAS[r.cat].nombre) + '</span></div>' +
        '<b style="line-height:1.1">' + RL.esc(r.nombre) + '</b><small class="muted">Vende a 🪙 ' + RL.fmt(r.precio) + ' · ' + r.pasos.length + ' pasos</small>' +
        '<div class="ings" style="display:flex;flex-wrap:wrap;gap:3px">' + Object.keys(r.ing).map(function (id) {
          return '<span class="ing-mini" title="' + RL.esc(D.ING[id].nombre) + '">' + D.ING[id].emoji + r.ing[id] + '</span>';
        }).join('') + '</div>' + accion + '</div>';
    }).join('') : '<p class="muted">No hay recetas con este filtro.</p>';
    $('#v-recetas').innerHTML = html + '</div>';
  }
  RL.vistas.recetas = { render: renderRecetas };
  RL.ACT.recCat = function (el) { RL.R.recCat = el.dataset.id; renderRecetas(); };
  RL.ACT.recFiltro = function (el) { RL.R.recFiltro = el.dataset.id; renderRecetas(); };
  RL.ACT.desbloquear = function (el) { aviso(RL.desbloquearReceta(el.dataset.id)); RL.marcar('cocina'); renderRecetas(); };

  /* =========================== MEJORAS =========================== */
  function renderMejoras() {
    const S = RL.S;
    const zonaSig = S.mesas < D.MAX_MESAS ? D.ZONAS[Math.floor(S.mesas / D.MESAS_POR_ZONA)] : null;
    let html = '<div class="vista-cab"><h2>🏗️ Mejoras</h2><span class="tag">Encanto del local: ' + RL.encanto() + '</span></div>';
    html += '<div class="card"><div class="fila entre"><div><h3>🪑 Mesas</h3><p class="muted">Tienes ' + S.mesas + ' de ' + D.MAX_MESAS + ' mesas. Más mesas, más clientes a la vez.</p></div>' +
      (zonaSig ? '<button class="btn btn-mango" data-act="comprarMesa" type="button"' + (S.nivel < zonaSig.nivel ? ' disabled' : '') + '>' +
        (S.nivel < zonaSig.nivel ? zonaSig.emoji + ' ' + zonaSig.nombre + ' (nivel ' + zonaSig.nivel + ')' : 'Comprar mesa 🪙 ' + RL.fmt(RL.precioMesa(S.mesas))) + '</button>' : '<span class="tag verde">¡Todas compradas!</span>') +
      '</div><div class="fila" style="margin-top:8px">' + D.ZONAS.map(function (z) {
        return '<span class="tag ' + (S.nivel >= z.nivel ? 'verde' : 'gris') + '">' + z.emoji + ' ' + z.nombre + (S.nivel >= z.nivel ? '' : ' · nivel ' + z.nivel) + '</span>';
      }).join('') + '</div></div>';

    html += '<h3 style="margin:16px 0 8px">Electrodomésticos</h3><div class="grid c2">' + Object.keys(D.APARATOS).map(function (id) {
      const a = D.APARATOS[id], lvl = S.mejoras[id];
      let accion;
      if (lvl >= 5) accion = '<span class="tag verde">Nivel máximo</span>';
      else if (S.nivel < D.APARATO_NIVEL[lvl]) accion = '<span class="tag gris">🔒 Nivel ' + D.APARATO_NIVEL[lvl] + ' del restaurante</span>';
      else accion = '<button class="btn chico btn-mango" data-act="mejorar" data-id="' + id + '" type="button">' + RL.esc(a.niveles[lvl]) + ' · 🪙 ' + RL.fmt(D.APARATO_COSTO[lvl]) + '</button>';
      return '<div class="item-card"><div class="fila entre"><span class="emo">' + a.emoji + '</span><div class="nivel-pips">' +
        [1, 2, 3, 4, 5].map(function (n) { return '<i class="' + (n <= lvl ? 'on' : '') + '"></i>'; }).join('') + '</div></div>' +
        '<b>' + RL.esc(a.niveles[lvl - 1]) + '</b><small class="muted">' + a.desc + (id === 'nevera' ? ' Capacidad: ' + RL.capacidad() + ' por ingrediente.' : '') + '</small>' + accion + '</div>';
    }).join('') + '</div>';

    html += '<h3 style="margin:16px 0 4px">Decoración</h3><p class="muted">Más encanto atrae clientes más rápido y mejora las propinas.</p>';
    Object.keys(D.DECOR).forEach(function (cat) {
      const g = D.DECOR[cat];
      html += '<div class="deco-grupo"><h3 style="font-size:1rem;margin-bottom:6px">' + g.emoji + ' ' + g.nombre + '</h3><div class="deco-opts">' + g.items.map(function (it) {
        const tengo = !!S.decorPoseido[it.id], en = S.decor[cat] === it.id, puede = S.nivel >= it.nivel;
        const muestra = it.css ? '<div class="muestra" style="background:' + it.css + '"></div>' : '<div class="muestra">' + (it.emoji || '—') + '</div>';
        const pie = en ? 'En uso' : tengo ? 'Poner' : !puede ? '🔒 Nivel ' + it.nivel : '🪙 ' + RL.fmt(it.precio);
        return '<button type="button" class="opt ' + (en ? 'on' : '') + ' ' + (!tengo && !puede ? 'bloq' : '') + '" data-act="decor" data-cat="' + cat + '" data-id="' + it.id + '">' + muestra +
          '<span>' + RL.esc(it.n) + '</span><small class="muted">Encanto +' + it.enc + '</small><b>' + pie + '</b></button>';
      }).join('') + '</div></div>';
    });
    $('#v-mejoras').innerHTML = html;
  }
  RL.vistas.mejoras = { render: renderMejoras };
  RL.ACT.mejorar = function (el) { aviso(RL.mejorarAparato(el.dataset.id)); renderMejoras(); RL.marcar('hud'); };
  RL.ACT.decor = function (el) { aviso(RL.comprarDecor(el.dataset.cat, el.dataset.id)); renderMejoras(); };

  /* ============================ EQUIPO ============================ */
  function statRol(rol, n) {
    if (rol === 'mesero') return 'Sirve un plato cada ' + (5.5 - 0.8 * (n - 1)).toFixed(1) + ' s';
    if (rol === 'cocinero') return 'Cocina un plato en ' + (15 - 2.2 * (n - 1)).toFixed(1) + ' s · calidad ~' + Math.min(95, 62 + 8 * (n - 1));
    if (rol === 'cajero') return 'Cobra cada ' + (6 - (n - 1)) + ' s (propina a la mitad)';
    return 'Repone cada ' + (14 - 2 * (n - 1)) + ' s con 15% de recargo';
  }
  function renderEquipo() {
    const S = RL.S;
    let html = '<div class="vista-cab"><h2>👥 Equipo</h2><span class="muted">Tu equipo trabaja solo mientras tú haces otras cosas.</span></div>';
    html += '<h3 style="margin:6px 0 8px">Contratar</h3><div class="grid c2">' + Object.keys(D.ROLES).map(function (k) {
      const r = D.ROLES[k], n = S.equipo.filter(function (x) { return x.rol === k; }).length;
      let accion;
      if (n >= r.max) accion = '<span class="tag verde">Equipo completo</span>';
      else if (S.nivel < r.nivelReq) accion = '<span class="tag gris">🔒 Nivel ' + r.nivelReq + '</span>';
      else accion = '<button class="btn chico btn-mango" data-act="contratar" data-id="' + k + '" type="button">Contratar 🪙 ' + RL.fmt(RL.costoContratar(k)) + '</button>';
      return '<div class="item-card"><div class="fila entre"><span class="emo">' + r.emoji + '</span><span class="tag">' + n + '/' + r.max + '</span></div><b>' + r.n + '</b><small class="muted">' + r.desc + '</small>' + accion + '</div>';
    }).join('') + '</div>';
    html += '<h3 style="margin:16px 0 8px">Tu personal</h3>';
    if (!S.equipo.length) html += '<div class="card centro muted">Aún no tienes personal. Contrata a tu primer mesero en el nivel 2.</div>';
    else {
      html += '<div class="grid c2">' + S.equipo.map(function (st) {
        const r = D.ROLES[st.rol], nx = st.nivel + 1;
        let accion;
        if (st.nivel >= D.STAFF_MAX_NIVEL) accion = '<span class="tag verde">Nivel máximo</span>';
        else if (S.nivel < D.STAFF_NIVEL_REQ[nx]) accion = '<span class="tag gris">🔒 Entrena en el nivel ' + D.STAFF_NIVEL_REQ[nx] + '</span>';
        else accion = '<button class="btn chico btn-turq" data-act="entrenar" data-id="' + st.id + '" type="button">Entrenar 🪙 ' + RL.fmt(D.STAFF_NIVEL_COSTO[nx]) + '</button>';
        return '<div class="card staff-card"><div class="staff-av">' + RL.avatarSVG(st.av) + '</div><div class="staff-info"><b style="font-family:var(--titulo);font-size:1.1rem">' + RL.esc(st.nombre) + '</b><br>' +
          '<span class="tag">' + r.emoji + ' ' + r.n + ' · nivel ' + st.nivel + '</span><br><small class="muted">' + statRol(st.rol, st.nivel) + '</small><div style="margin-top:6px">' + accion + '</div></div></div>';
      }).join('') + '</div>';
    }
    $('#v-equipo').innerHTML = html;
  }
  RL.vistas.equipo = { render: renderEquipo };
  RL.ACT.contratar = function (el) { aviso(RL.contratar(el.dataset.id)); renderEquipo(); };
  RL.ACT.entrenar = function (el) { aviso(RL.entrenar(parseInt(el.dataset.id, 10))); renderEquipo(); };

  /* ============================ PERFIL ============================ */
  function renderPerfil() {
    const S = RL.S;
    let html = '<div class="vista-cab"><h2>👤 Perfil</h2><span class="tag">Puntaje ⭐ ' + RL.fmt(S.puntaje) + '</span></div>';
    html += '<div class="perfil-grid"><div class="card centro"><div class="avatar-preview" id="av-prev">' + RL.avatarSVG(S.avatar) + '</div>' +
      '<h3 style="margin-top:10px">' + RL.esc(S.nombre) + '</h3><p class="muted">Chef de ' + RL.esc(S.restaurante) + '</p></div><div class="card"><h3>Tu personaje</h3>';
    Object.keys(D.COSM).forEach(function (cat) {
      html += '<div class="cosm-fila"><h4>' + D.COSM_NOMBRES[cat] + '</h4><div class="cosm-opts">' + D.COSM[cat].map(function (o) {
        const tengo = RL.tieneCosm(cat, o.id), en = S.avatar[cat] === o.id;
        return '<button type="button" class="cosm-opt ' + (en ? 'on' : '') + '" data-act="cosm" data-cat="' + cat + '" data-id="' + o.id + '">' +
          (o.c ? '<span class="col" style="background:' + o.c + '"></span>' : '') + RL.esc(o.n) + (tengo ? '' : ' <small>🪙' + o.precio + '</small>') + '</button>';
      }).join('') + '</div></div>';
    });
    html += '</div></div>';

    html += '<div class="card" style="margin-top:12px"><h3>Tu restaurante</h3><div class="fila" style="margin-top:8px"><input id="rest-nombre" class="input" style="flex:1;min-width:200px" maxlength="26" value="' + RL.esc(S.restaurante) + '" aria-label="Nombre del restaurante">' +
      '<button class="btn btn-turq" data-act="guardarRest" type="button">Guardar nombre</button></div></div>';

    const st = S.stats;
    html += '<div class="card" style="margin-top:12px"><h3>Estadísticas</h3><div class="stats-grid" style="margin-top:8px">' + [
      ['Clientes', st.clientes], ['Platos servidos', st.platos], ['Platos cocinados', st.cocinados], ['Cobros', st.cobros],
      ['Ventas', RL.fmt(st.ventas) + ' 🪙'], ['Propinas', RL.fmt(st.propinas) + ' 🪙'], ['Clientes perdidos', st.perdidos],
      ['Compras en el súper', st.compras], ['Minijuegos', st.minijuegos], ['Recetas', Object.keys(S.recetas).length]
    ].map(function (x) { return '<div class="stat"><small class="muted">' + x[0] + '</small><b>' + x[1] + '</b></div>'; }).join('') + '</div></div>';

    html += '<div class="card" style="margin-top:12px"><div class="fila entre"><h3>🏆 Ranking de jugadoras</h3><button class="btn chico" data-act="rankRefrescar" type="button">Actualizar</button></div>' +
      '<div id="rank-box" style="margin-top:8px"><p class="muted">Cargando...</p></div></div>';

    html += '<div class="card" style="margin-top:12px"><h3>Ajustes</h3><div class="fila" style="margin-top:8px">' +
      '<button class="btn" data-act="sonido" type="button">' + (S.sonido === false ? '🔇 Sonido apagado' : '🔊 Sonido encendido') + '</button>' +
      '<button class="btn" data-act="salirSesion" type="button">🚪 Cerrar sesión</button>' +
      '<button class="btn btn-papaya" data-act="reiniciar" type="button">Empezar de cero</button></div></div>';
    $('#v-perfil').innerHTML = html;
    cargarRanking();
  }

  function cargarRanking() {
    const box = $('#rank-box');
    if (!box) return;
    function pintar(filas, origen) {
      const el = $('#rank-box');
      if (!el) return;
      if (!filas || !filas.length) { el.innerHTML = '<p class="muted">Todavía no hay jugadoras en el ranking.</p>'; return; }
      el.innerHTML = '<table class="tabla-rank"><thead><tr><th>#</th><th>Jugadora</th><th>Nivel</th><th>Puntaje</th></tr></thead><tbody>' +
        filas.map(function (f, i) {
          return '<tr class="' + (f.clave === RL.S.clave ? 'yo' : '') + '"><td>' + (i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1) + '</td><td>' + RL.esc(f.nombre) + '<br><small class="muted">' + RL.esc(f.restaurante || '') + '</small></td><td>' + (f.nivel || 1) + '</td><td>' + RL.fmt(f.puntaje || 0) + '</td></tr>';
        }).join('') + '</tbody></table><p class="muted" style="margin-top:6px;font-size:.8rem">' + origen + '</p>';
    }
    if (RL.nube.activa) {
      RL.guardar(true);
      setTimeout(function () {
        RL.nubeRanking().then(function (filas) {
          if (filas) pintar(filas, '☁️ Ranking en línea de todas las jugadoras.');
          else pintar(RL.localLista().sort(function (a, b) { return b.puntaje - a.puntaje; }), '⚠️ Sin conexión. Mostrando jugadoras de este dispositivo.');
        });
      }, 400);
    } else {
      pintar(RL.localLista().sort(function (a, b) { return b.puntaje - a.puntaje; }), '💾 Solo jugadoras de este dispositivo. Conecta la nube para competir con tus amigas.');
    }
  }

  RL.vistas.perfil = { render: renderPerfil };
  RL.ACT.cosm = function (el) { aviso(RL.elegirCosm(el.dataset.cat, el.dataset.id)); renderPerfil(); };
  RL.ACT.guardarRest = function () {
    const v = $('#rest-nombre').value.trim().slice(0, 26);
    if (v.length < 2) { RL.toast('Escribe un nombre de al menos 2 letras', 'mal'); return; }
    RL.S.restaurante = v; RL.sfx.ok(); RL.marcar('hud'); RL.guardar(true);
    RL.toast('Nombre guardado', 'ok'); renderPerfil();
  };
  RL.ACT.rankRefrescar = function () { const b = $('#rank-box'); if (b) b.innerHTML = '<p class="muted">Cargando...</p>'; cargarRanking(); };
  RL.ACT.reiniciar = function () {
    RL.modal({
      titulo: '¿Empezar de cero?', html: '<p class="centro">Se borrarán tus monedas, recetas, mejoras y nivel. Esto no se puede deshacer.</p>',
      botones: [
        { txt: 'No, volver', cls: 'btn-turq' },
        {
          txt: 'Sí, borrar todo', cls: 'btn-papaya', fn: function () {
            const S = RL.S;
            RL.S = RL.nuevoEstado(S.nombre, S.clave);
            RL.guardar(true, true);
            setTimeout(function () { location.reload(); }, 300);
          }
        }
      ]
    });
  };
})();
