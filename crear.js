/* ===========================================================
   RESTAURANTE LOCO - Asistente inicial de personalización
   Primero la jugadora elige CÓMO quiere personalizar:
   armarlo ella, estilos listos, sorpresa o dejarlo para después.
   =========================================================== */
(function () {
  'use strict';
  const RL = window.RL, D = RL.D, $ = RL.$;

  const GRATIS = function (cat) { return D.COSM[cat].filter(function (o) { return o.precio === 0; }); };
  const GRUPOS = [
    { t: 'Tu personaje', cats: ['piel', 'pelo', 'colorPelo'] },
    { t: 'Tu ropa', cats: ['camisa', 'delantal'] }
  ];
  const NOMBRES_REST = ['El Fogón de {n}', 'Sabor Caribe de {n}', 'La Cocina de {n}', 'Casa {n}', 'Bistró {n}', 'Arepas de {n}', 'Mar y Sabor de {n}'];

  const PRESETS = [
    { n: 'Acogedor', tema: 'madera', rest: 'El Fogón de {n}', av: { piel: 'p2', pelo: 'largo', colorPelo: 'castano', gorro: 'ninguno', camisa: 'c1', delantal: 'd1', acc: 'ninguno' } },
    { n: 'Caribe', tema: 'caribe', rest: 'Sabor Caribe de {n}', av: { piel: 'p4', pelo: 'corto', colorPelo: 'negro', gorro: 'ninguno', camisa: 'c3', delantal: 'd2', acc: 'ninguno' } },
    { n: 'Moderno', tema: 'moderno', rest: 'Bistró {n}', av: { piel: 'p1', pelo: 'largo', colorPelo: 'rubio', gorro: 'ninguno', camisa: 'c4', delantal: 'd4', acc: 'ninguno' } },
    { n: 'Carnaval', tema: 'carnaval', rest: 'Cocina Carnaval', av: { piel: 'p5', pelo: 'corto', colorPelo: 'pelirrojo', gorro: 'ninguno', camisa: 'c2', delantal: 'd1', acc: 'ninguno' } },
    { n: 'Dulce', tema: 'madera', rest: 'Dulces de {n}', av: { piel: 'p3', pelo: 'largo', colorPelo: 'negro', gorro: 'ninguno', camisa: 'c3', delantal: 'd3', acc: 'ninguno' } },
    { n: 'Chef', tema: 'moderno', rest: 'Chef {n}', av: { piel: 'p6', pelo: 'corto', colorPelo: 'negro', gorro: 'ninguno', camisa: 'c1', delantal: 'd2', acc: 'ninguno' } }
  ];

  let T = null, alTerminar = null;

  function nombreRest(plantilla) { return plantilla.replace('{n}', RL.S.nombre); }
  function elegir(lista) { return lista[Math.floor(Math.random() * lista.length)]; }
  function copiaAv(a) { return JSON.parse(JSON.stringify(a)); }

  function aleatorio() {
    const av = copiaAv(D.AVATAR_INICIAL);
    ['piel', 'pelo', 'colorPelo', 'camisa', 'delantal'].forEach(function (c) { av[c] = elegir(GRATIS(c)).id; });
    return { av: av, tema: elegir(Object.keys(RL.TEMAS)), rest: nombreRest(elegir(NOMBRES_REST)) };
  }

  function miniLocal(tema) {
    const t = RL.TEMAS[tema];
    return '<span class="mini-local" style="--p:' + t.pared + ';--z:' + t.zocalo + '"><span class="mini-pared"></span><span class="mini-piso" style="background:' + t.piso + '"></span></span>';
  }

  function cabecera(titulo, sub, atras) {
    return (atras ? '<button class="btn chico crear-atras" data-act="crearAtras" type="button">← Cambiar forma</button>' : '') +
      '<h1 class="cinta">' + titulo + '</h1><p class="crear-sub">' + sub + '</p>';
  }

  /* ---------- Paso 0: ¿cómo quieres personalizar? ---------- */
  function pasoModo() {
    const modos = [
      ['armar', '🎨', 'Lo armo yo', 'Escojo mi personaje, mi ropa, el nombre y el estilo del local.'],
      ['presets', '✨', 'Estilos listos', 'Elijo entre seis combinaciones ya armadas y las retoco si quiero.'],
      ['sorpresa', '🎲', 'Sorpréndeme', 'El juego arma uno al azar. Lo cambio hasta que me guste.'],
      ['despues', '⏭️', 'Después', 'Empiezo a cocinar ya. Personalizo cuando quiera.']
    ];
    return cabecera('¡Tu restaurante, a tu manera!', 'Primero dinos cómo quieres personalizarlo. Siempre podrás cambiarlo en Perfil.', false) +
      '<div class="crear-modos">' + modos.map(function (m) {
        return '<button class="modo-card" type="button" data-act="crearModo" data-modo="' + m[0] + '"><span class="modo-ic">' + m[1] + '</span><b>' + m[2] + '</b><small>' + m[3] + '</small></button>';
      }).join('') + '</div>';
  }

  /* ---------- Vista previa común ---------- */
  function vistaPrevia() {
    const t = RL.TEMAS[T.tema];
    return '<div class="crear-prev"><div class="prev-escena" style="--p:' + t.pared + ';--z:' + t.zocalo + '">' +
      '<div class="prev-pared"><span class="ventana" style="--marco:' + t.marco + ';--cielo:' + t.cielo + '"><i></i><i></i><i></i></span></div>' +
      '<div class="prev-piso" style="background:' + t.piso + '"></div>' +
      '<div class="prev-av" id="prev-av">' + RL.avatarSVG(T.av) + '</div></div>' +
      '<div class="prev-nombre" id="prev-rest">' + RL.esc(T.rest) + '</div></div>';
  }
  function refrescarPrevia() {
    const a = $('#prev-av'), n = $('#prev-rest');
    if (a) a.innerHTML = RL.avatarSVG(T.av);
    if (n) n.textContent = T.rest;
    const esc = document.querySelector('.prev-escena');
    if (esc) {
      const t = RL.TEMAS[T.tema];
      esc.style.setProperty('--p', t.pared); esc.style.setProperty('--z', t.zocalo);
      const piso = esc.querySelector('.prev-piso'); if (piso) piso.style.background = t.piso;
      const v = esc.querySelector('.ventana'); if (v) { v.style.setProperty('--marco', t.marco); v.style.setProperty('--cielo', t.cielo); }
    }
  }

  /* ---------- Paso: lo armo yo ---------- */
  function pasoArmar() {
    let html = cabecera('Arma tu estilo', 'Toca para probar. Todo lo de aquí es gratis; más opciones se compran jugando.', true);
    html += '<div class="crear-cols">' + vistaPrevia() + '<div class="crear-ctrl">';
    GRUPOS.forEach(function (g) {
      html += '<h3 class="crear-h">' + g.t + '</h3>';
      g.cats.forEach(function (cat) {
        html += '<div class="cosm-fila"><h4>' + D.COSM_NOMBRES[cat] + '</h4><div class="cosm-opts">' + GRATIS(cat).map(function (o) {
          return '<button type="button" class="cosm-opt ' + (T.av[cat] === o.id ? 'on' : '') + '" data-act="crearSet" data-cat="' + cat + '" data-id="' + o.id + '">' +
            (o.c ? '<span class="col" style="background:' + o.c + '"></span>' : '') + RL.esc(o.n) + '</button>';
        }).join('') + '</div></div>';
      });
    });
    html += '<h3 class="crear-h">Tu local</h3><div class="temas">' + Object.keys(RL.TEMAS).map(function (k) {
      return '<button type="button" class="tema-card ' + (T.tema === k ? 'on' : '') + '" data-act="crearTema" data-id="' + k + '">' + miniLocal(k) + '<b>' + RL.TEMAS[k].e + ' ' + RL.TEMAS[k].n + '</b></button>';
    }).join('') + '</div>' +
      '<h3 class="crear-h">Nombre del restaurante</h3><input id="crear-rest" class="input" maxlength="26" value="' + RL.esc(T.rest) + '" aria-label="Nombre del restaurante">' +
      '</div></div>' + pie('¡Abrir mi restaurante!');
    return html;
  }

  /* ---------- Paso: estilos listos ---------- */
  function pasoPresets() {
    let html = cabecera('Elige un estilo', 'Escoge uno y ábrelo, o retócalo a tu gusto.', true);
    html += '<div class="presets">' + PRESETS.map(function (p, i) {
      return '<button type="button" class="preset-card ' + (T.preset === i ? 'on' : '') + '" data-act="crearPreset" data-i="' + i + '">' +
        '<span class="preset-av">' + RL.avatarSVG(p.av) + '</span>' + miniLocal(p.tema) + '<b>' + p.n + '</b></button>';
    }).join('') + '</div>';
    html += '<div class="crear-pie"><button class="btn" data-act="crearRetocar" type="button"' + (T.preset == null ? ' disabled' : '') + '>🎨 Retocar</button>' +
      '<button class="btn btn-mango grande" data-act="crearFin" type="button"' + (T.preset == null ? ' disabled' : '') + '>¡Abrir mi restaurante!</button></div>';
    return html;
  }

  /* ---------- Paso: sorpresa ---------- */
  function pasoSorpresa() {
    return cabecera('¡Sorpresa!', 'Mira cómo quedó. Si no te convence, tira el dado otra vez.', true) +
      '<div class="crear-cols una">' + vistaPrevia() + '</div>' +
      '<div class="crear-pie"><button class="btn btn-turq" data-act="crearDado" type="button">🎲 Otra vez</button>' +
      '<button class="btn" data-act="crearRetocar" type="button">🎨 Retocar</button>' +
      '<button class="btn btn-mango grande" data-act="crearFin" type="button">¡Me encanta, abrir!</button></div>';
  }

  function pie(txt) {
    return '<div class="crear-pie"><button class="btn btn-mango grande" data-act="crearFin" type="button">' + txt + '</button></div>';
  }

  function render() {
    const box = $('#crear-caja');
    const paso = T.paso;
    box.innerHTML = paso === 'modo' ? pasoModo() : paso === 'armar' ? pasoArmar() : paso === 'presets' ? pasoPresets() : pasoSorpresa();
    const inp = $('#crear-rest');
    if (inp) inp.addEventListener('input', function () { T.rest = inp.value; const n = $('#prev-rest'); if (n) n.textContent = T.rest.trim() || 'Mi restaurante'; });
    window.scrollTo(0, 0);
  }

  /* ---------- API ---------- */
  RL.crear = {
    abrir: function (cb) {
      alTerminar = cb;
      T = { paso: 'modo', av: copiaAv(RL.S.avatar), tema: RL.S.tema || 'madera', rest: RL.S.restaurante, preset: null };
      $('#login').classList.add('oculto');
      $('#game').classList.add('oculto');
      $('#crear').classList.remove('oculto');
      render();
    }
  };

  function terminar(aplicar) {
    const S = RL.S;
    if (aplicar) {
      S.avatar = copiaAv(T.av);
      S.tema = T.tema;
      const r = (T.rest || '').trim();
      if (r) S.restaurante = r.slice(0, 26);
    }
    S.personalizado = true;
    $('#crear').classList.add('oculto');
    RL.sfx.ok();
    if (alTerminar) alTerminar();
  }

  RL.ACT.crearModo = function (el) {
    RL.sfx.click();
    const m = el.dataset.modo;
    if (m === 'despues') { terminar(false); return; }
    if (m === 'sorpresa') { const a = aleatorio(); T.av = a.av; T.tema = a.tema; T.rest = a.rest; }
    T.paso = m;
    render();
  };
  RL.ACT.crearAtras = function () { RL.sfx.click(); T.paso = 'modo'; render(); };
  RL.ACT.crearSet = function (el) {
    RL.sfx.pop();
    T.av[el.dataset.cat] = el.dataset.id;
    Array.prototype.forEach.call(el.parentNode.children, function (b) { b.classList.toggle('on', b === el); });
    refrescarPrevia();
  };
  RL.ACT.crearTema = function (el) {
    RL.sfx.pop();
    T.tema = el.dataset.id;
    Array.prototype.forEach.call(el.parentNode.children, function (b) { b.classList.toggle('on', b === el); });
    refrescarPrevia();
  };
  RL.ACT.crearPreset = function (el) {
    RL.sfx.pop();
    const i = parseInt(el.dataset.i, 10), p = PRESETS[i];
    T.preset = i; T.av = copiaAv(p.av); T.tema = p.tema; T.rest = nombreRest(p.rest);
    render();
  };
  RL.ACT.crearDado = function () {
    RL.sfx.pop();
    const a = aleatorio(); T.av = a.av; T.tema = a.tema; T.rest = a.rest;
    render();
  };
  RL.ACT.crearRetocar = function () { RL.sfx.click(); T.paso = 'armar'; render(); };
  RL.ACT.crearFin = function () { terminar(true); };
})();
