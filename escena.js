/* ===========================================================
   RESTAURANTE LOCO - Escenas ilustradas (comedor y mostrador)
   Dibujos en SVG/CSS: mesa con sillas, ventanas, estufa, horno,
   cafetera y platos sobre el mostrador de acero.
   =========================================================== */
(function () {
  'use strict';
  const RL = window.RL, D = RL.D;

  /* Estilos del local que se eligen gratis al empezar */
  RL.TEMAS = {
    madera:   { n: 'Acogedor',  e: '🪵', pared: '#F8E7C8', zocalo: '#D9B98A', marco: '#2F5D3A', cielo: '#BFE9FF',
                piso: 'repeating-linear-gradient(90deg,#C98A4B 0 52px,#B57A3E 52px 54px)' },
    caribe:   { n: 'Caribe',    e: '🏝️', pared: '#C4F1EB', zocalo: '#7FD6CB', marco: '#0B8A81', cielo: '#FFF1B8',
                piso: 'repeating-linear-gradient(90deg,#F2DCAE 0 52px,#E3C78E 52px 54px)' },
    moderno:  { n: 'Moderno',   e: '🏙️', pared: '#E9EEF3', zocalo: '#B9C4CF', marco: '#3B4656', cielo: '#D6ECFF',
                piso: 'repeating-conic-gradient(#F6F8FA 0% 25%, #DCE2E8 0% 50%) 0 0/46px 46px' },
    carnaval: { n: 'Carnaval',  e: '🎭', pared: '#FFE08A', zocalo: '#FF6B57', marco: '#8B6CF6', cielo: '#FFD2E3',
                piso: 'repeating-conic-gradient(#7FE0D6 0% 25%, #FFFFFF 0% 50%) 0 0/46px 46px' }
  };
  RL.tema = function () { return RL.TEMAS[(RL.S && RL.S.tema) || 'madera'] || RL.TEMAS.madera; };

  /* Mesa redonda con mantel y dos sillas (vista 3/4) */
  RL.mesaSVG = function (estado) {
    const plato = estado === 'comiendo' || estado === 'pagar';
    return '<svg class="mesa-gfx" viewBox="0 0 150 62" aria-hidden="true">' +
      '<ellipse cx="75" cy="55" rx="52" ry="6" fill="rgba(60,35,20,.22)"/>' +
      '<rect x="7" y="16" width="20" height="32" rx="9" fill="#A8672F" stroke="#5A3A22" stroke-width="2.5"/>' +
      '<rect x="123" y="16" width="20" height="32" rx="9" fill="#A8672F" stroke="#5A3A22" stroke-width="2.5"/>' +
      '<ellipse cx="75" cy="33" rx="46" ry="21" fill="#fff" stroke="#5A3A22" stroke-width="3"/>' +
      '<ellipse cx="75" cy="33" rx="39" ry="16.5" fill="none" stroke="#D8343B" stroke-width="3" stroke-dasharray="7 5"/>' +
      '<ellipse cx="62" cy="26" rx="18" ry="5" fill="rgba(255,255,255,.9)"/>' +
      (plato ? '<ellipse cx="75" cy="35" rx="15" ry="7" fill="#F4F6F8" stroke="#5A3A22" stroke-width="2"/><ellipse cx="75" cy="34" rx="8" ry="3.5" fill="#FFC83D"/>' :
        '<ellipse cx="75" cy="35" rx="7" ry="3" fill="#EAD8B8" opacity=".6"/>') +
      '</svg>';
  };

  /* Ventana alta con marco oscuro (se pinta con CSS y las variables del tema) */
  RL.ventanaHTML = function () {
    return '<span class="ventana"><i></i><i></i><i></i></span>';
  };

  /* Mostrador de cocina: cafetera, platos, estufa y horno.
     Los niveles de los aparatos abren más hornillas y cajones. */
  RL.mostradorSVG = function () {
    const S = RL.S, R = RL.R;
    const estufa = RL.ap('estufa'), horno = RL.ap('horno');
    const hornillas = Math.min(4, estufa + 1);
    const mesas = S.mesas;
    const ranuras = 6, abiertas = Math.min(ranuras, mesas + 2);
    const listos = S.listos.slice(0, abiertas);
    const extra = Math.max(0, S.listos.length - abiertas);
    const paso = R.cooking ? D.REC[R.cooking.rid].pasos[R.cooking.i] : null;
    const tipo = paso ? paso.tipo : '';
    const enSarten = tipo === 'sarten' || tipo === 'hervir';
    let g = '<svg class="mostrador-svg" viewBox="0 0 420 190" preserveAspectRatio="xMidYMax meet" role="img" aria-label="Mostrador de la cocina">' +
      '<defs>' +
      '<linearGradient id="acero" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3F6F8"/><stop offset="1" stop-color="#B9C4CE"/></linearGradient>' +
      '<linearGradient id="rojo" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E5484D"/><stop offset="1" stop-color="#B22830"/></linearGradient>' +
      '<pattern id="cuadros" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="#fff"/><rect width="8" height="8" fill="#E5484D"/><rect x="8" y="8" width="8" height="8" fill="#E5484D"/></pattern>' +
      '</defs>' +
      /* frente del mostrador */
      '<rect x="-600" y="62" width="1620" height="130" fill="url(#acero)" stroke="#3B2A2A" stroke-width="3"/>' +
      '<rect x="-600" y="62" width="1620" height="16" fill="url(#cuadros)" stroke="#3B2A2A" stroke-width="3"/>' +
      '<rect x="-600" y="80" width="1620" height="3" fill="rgba(255,255,255,.75)"/>';
    /* cafetera roja */
    g += '<g transform="translate(14 8)"><rect x="0" y="6" width="62" height="58" rx="8" fill="url(#rojo)" stroke="#3B2A2A" stroke-width="3"/>' +
      '<rect x="8" y="14" width="46" height="12" rx="4" fill="#F3F6F8" stroke="#3B2A2A" stroke-width="2"/>' +
      '<circle cx="14" cy="38" r="5" fill="#C9D1D8" stroke="#3B2A2A" stroke-width="2"/><rect x="26" y="30" width="22" height="26" rx="4" fill="#8E1F26"/>' +
      '<rect x="10" y="52" width="36" height="6" rx="3" fill="#3B2A2A"/><path d="M22 60h14v6a7 7 0 0 1-14 0z" fill="#fff" stroke="#3B2A2A" stroke-width="2"/></g>';
    /* platos: hasta 6 espacios; los que aún no se abren llevan candado */
    for (let k = 0; k < ranuras; k++) {
      const cx = 118 + (k % 3) * 52, cy = 104 + Math.floor(k / 3) * 44;
      if (k < abiertas) {
        g += '<ellipse cx="' + cx + '" cy="' + (cy + 4) + '" rx="21" ry="8" fill="rgba(0,0,0,.18)"/>' +
          '<circle cx="' + cx + '" cy="' + cy + '" r="20" fill="#fff" stroke="#3B2A2A" stroke-width="2.5"/><circle cx="' + cx + '" cy="' + cy + '" r="14" fill="#F1F4F6"/>';
        if (listos[k]) g += '<text x="' + cx + '" y="' + (cy + 8) + '" font-size="22" text-anchor="middle">' + D.REC[listos[k].rid].emoji + '</text>';
      } else {
        g += '<circle cx="' + cx + '" cy="' + cy + '" r="20" fill="#6FB9B6" stroke="#3B2A2A" stroke-width="2.5" opacity=".9"/>' +
          '<text x="' + cx + '" y="' + (cy + 6) + '" font-size="16" text-anchor="middle">🔒</text>';
      }
    }
    if (extra) g += '<text x="278" y="118" font-size="12" font-weight="800" fill="#3B2A2A">+' + extra + ' más</text>';
    /* estufa con 4 hornillas */
    g += '<g transform="translate(296 18)"><rect x="0" y="0" width="118" height="62" rx="6" fill="#4A5260" stroke="#3B2A2A" stroke-width="3"/>' +
      '<rect x="5" y="4" width="108" height="8" rx="3" fill="rgba(255,255,255,.18)"/>';
    for (let h = 0; h < 4; h++) {
      const hx = 22 + (h % 2) * 48 + (h > 1 ? 6 : 0), hy = 22 + Math.floor(h / 2) * 24;
      const on = h < hornillas;
      g += '<circle cx="' + hx + '" cy="' + hy + '" r="' + (on ? 11 : 9) + '" fill="' + (on ? '#2B2F38' : '#3A3F49') + '" stroke="' + (on ? '#F4B63D' : '#6A7180') + '" stroke-width="3"/>' +
        (on ? '<circle cx="' + hx + '" cy="' + hy + '" r="4" fill="' + (enSarten && h === 0 ? '#FF8A3D' : '#F4B63D') + '"/>' : '<text x="' + hx + '" y="' + (hy + 4) + '" font-size="10" text-anchor="middle">🔒</text>');
    }
    if (enSarten) g += '<ellipse cx="22" cy="22" rx="14" ry="9" fill="#C0392B" stroke="#3B2A2A" stroke-width="2.5"/><rect x="34" y="20" width="20" height="5" rx="2.5" fill="#3B2A2A"/>';
    g += '</g>';
    /* horno: cajones por nivel */
    const brilla = tipo === 'horno';
    g += '<g transform="translate(296 96)"><rect x="0" y="0" width="118" height="80" rx="6" fill="#DDE3E8" stroke="#3B2A2A" stroke-width="3"/>' +
      '<rect x="8" y="10" width="102" height="60" rx="4" fill="' + (brilla ? '#FFB24D' : '#7A8591') + '" stroke="#3B2A2A" stroke-width="2.5"/>';
    for (let r = 0; r < Math.min(4, 1 + Math.ceil(horno / 2)); r++) g += '<rect x="14" y="' + (18 + r * 13) + '" width="90" height="4" rx="2" fill="rgba(255,255,255,.55)"/>';
    g += '<rect x="30" y="2" width="58" height="5" rx="2.5" fill="#9AA5B1"/></g>';
    g += '</svg>';
    return g;
  };
})();
