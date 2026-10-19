/* ===========================================================
   RESTAURANTE LOCO - Catálogo de datos
   Ingredientes, recetas, mejoras, decoración, personal, cosméticos
   =========================================================== */
(function () {
  'use strict';

  /* ---------- PASILLOS DEL SÚPER ---------- */
  const PASILLOS = {
    frutas:    { nombre: 'Frutas',               emoji: '🍓', color: '#FF8FB8' },
    verduras:  { nombre: 'Verduras',             emoji: '🥬', color: '#7BD389' },
    carnes:    { nombre: 'Carnes',               emoji: '🥩', color: '#FF6B57' },
    embutidos: { nombre: 'Embutidos',            emoji: '🌭', color: '#FFA45B' },
    mar:       { nombre: 'Pescados y mariscos',  emoji: '🦐', color: '#5BC8F5' },
    lacteos:   { nombre: 'Lácteos y huevos',     emoji: '🥛', color: '#FFE27A' },
    panaderia: { nombre: 'Panadería',            emoji: '🍞', color: '#E8B26A' },
    despensa:  { nombre: 'Despensa',             emoji: '🍚', color: '#B79BFF' },
    dulces:    { nombre: 'Dulces y repostería',  emoji: '🍫', color: '#C98B6B' },
    bebidas:   { nombre: 'Bebidas',              emoji: '🥤', color: '#4FD1C5' }
  };

  /* ---------- INGREDIENTES [id, nombre, emoji, precio, pasillo] ---------- */
  const ING_RAW = [
    // frutas
    ['banano', 'Banano', '🍌', 2, 'frutas'], ['mango', 'Mango', '🥭', 3, 'frutas'],
    ['fresa', 'Fresa', '🍓', 4, 'frutas'], ['pina', 'Piña', '🍍', 4, 'frutas'],
    ['maracuya', 'Maracuyá', '🍈', 3, 'frutas'], ['mora', 'Mora', '🫐', 4, 'frutas'],
    ['coco', 'Coco', '🥥', 5, 'frutas'], ['sandia', 'Sandía', '🍉', 5, 'frutas'],
    ['naranja', 'Naranja', '🍊', 2, 'frutas'], ['limon', 'Limón', '🍋', 1, 'frutas'],
    ['manzana', 'Manzana', '🍎', 3, 'frutas'], ['lulo', 'Lulo', '🍑', 3, 'frutas'],
    ['uva', 'Uvas', '🍇', 5, 'frutas'], ['guanabana', 'Guanábana', '🥝', 5, 'frutas'],
    // verduras
    ['tomate', 'Tomate', '🍅', 2, 'verduras'], ['cebolla', 'Cebolla', '🧅', 1, 'verduras'],
    ['ajo', 'Ajo', '🧄', 1, 'verduras'], ['papa', 'Papa', '🥔', 2, 'verduras'],
    ['yuca', 'Yuca', '🍠', 2, 'verduras'], ['platano_maduro', 'Plátano maduro', '🍌', 2, 'verduras'],
    ['platano_verde', 'Plátano verde', '🍌', 2, 'verduras'], ['aguacate', 'Aguacate', '🥑', 4, 'verduras'],
    ['lechuga', 'Lechuga', '🥬', 2, 'verduras'], ['zanahoria', 'Zanahoria', '🥕', 2, 'verduras'],
    ['pimenton', 'Pimentón', '🫑', 2, 'verduras'], ['cilantro', 'Cilantro', '🌿', 1, 'verduras'],
    ['maiz_tierno', 'Maíz tierno', '🌽', 3, 'verduras'], ['champinon', 'Champiñón', '🍄', 4, 'verduras'],
    ['pepino', 'Pepino', '🥒', 2, 'verduras'], ['brocoli', 'Brócoli', '🥦', 3, 'verduras'],
    ['menta', 'Menta', '🍃', 1, 'verduras'],
    // carnes
    ['carne_res', 'Carne de res', '🥩', 8, 'carnes'], ['carne_molida', 'Carne molida', '🥩', 6, 'carnes'],
    ['pollo', 'Pollo', '🍗', 6, 'carnes'], ['pechuga', 'Pechuga', '🍗', 6, 'carnes'],
    ['alas', 'Alitas', '🍗', 5, 'carnes'], ['cerdo', 'Cerdo', '🍖', 7, 'carnes'],
    ['costilla', 'Costilla', '🍖', 9, 'carnes'], ['chicharron', 'Chicharrón', '🥓', 6, 'carnes'],
    // embutidos
    ['chorizo', 'Chorizo', '🌭', 4, 'embutidos'], ['salchicha', 'Salchicha', '🌭', 3, 'embutidos'],
    ['jamon', 'Jamón', '🍖', 4, 'embutidos'], ['tocino', 'Tocino', '🥓', 4, 'embutidos'],
    ['salchichon', 'Salchichón', '🌭', 4, 'embutidos'], ['morcilla', 'Morcilla', '🌭', 4, 'embutidos'],
    ['butifarra', 'Butifarra', '🌭', 3, 'embutidos'], ['pepperoni', 'Pepperoni', '🍕', 4, 'embutidos'],
    // mar
    ['pescado', 'Pescado', '🐟', 8, 'mar'], ['mojarra', 'Mojarra', '🐠', 9, 'mar'],
    ['camaron', 'Camarón', '🦐', 10, 'mar'], ['calamar', 'Calamar', '🦑', 9, 'mar'],
    // lácteos
    ['huevo', 'Huevo', '🥚', 1, 'lacteos'], ['leche', 'Leche', '🥛', 2, 'lacteos'],
    ['queso', 'Queso', '🧀', 3, 'lacteos'], ['queso_costeno', 'Queso costeño', '🧀', 3, 'lacteos'],
    ['mozzarella', 'Mozzarella', '🧀', 4, 'lacteos'], ['mantequilla', 'Mantequilla', '🧈', 2, 'lacteos'],
    ['crema_leche', 'Crema de leche', '🍦', 3, 'lacteos'], ['helado', 'Helado', '🍨', 4, 'lacteos'],
    // panadería
    ['pan', 'Pan', '🍞', 2, 'panaderia'], ['pan_hamburguesa', 'Pan de hamburguesa', '🍔', 2, 'panaderia'],
    ['pan_perro', 'Pan de perro', '🥖', 2, 'panaderia'], ['tortilla', 'Tortilla', '🫓', 2, 'panaderia'],
    ['masa_pizza', 'Masa de pizza', '🍕', 3, 'panaderia'], ['masa_empanada', 'Masa de empanada', '🥟', 3, 'panaderia'],
    ['croissant', 'Croissant', '🥐', 3, 'panaderia'],
    // despensa
    ['arroz', 'Arroz', '🍚', 2, 'despensa'], ['pasta', 'Pasta', '🍝', 2, 'despensa'],
    ['harina_maiz', 'Harina de maíz', '🌽', 2, 'despensa'], ['harina_trigo', 'Harina de trigo', '🌾', 2, 'despensa'],
    ['frijol', 'Fríjol', '🫘', 3, 'despensa'], ['lenteja', 'Lenteja', '🫘', 3, 'despensa'],
    ['aceite', 'Aceite', '🫒', 2, 'despensa'], ['sal', 'Sal', '🧂', 1, 'despensa'],
    ['salsa_tomate', 'Salsa de tomate', '🥫', 2, 'despensa'], ['mayonesa', 'Mayonesa', '🥫', 2, 'despensa'],
    ['mostaza', 'Mostaza', '🥫', 2, 'despensa'], ['salsa_bbq', 'Salsa BBQ', '🥫', 3, 'despensa'],
    ['caldo', 'Caldo', '🍲', 1, 'despensa'], ['aji', 'Ají', '🌶️', 1, 'despensa'],
    ['avena', 'Avena', '🥣', 2, 'despensa'],
    // dulces
    ['azucar', 'Azúcar', '🍬', 1, 'dulces'], ['panela', 'Panela', '🍯', 2, 'dulces'],
    ['miel', 'Miel', '🍯', 3, 'dulces'], ['canela', 'Canela', '🍂', 1, 'dulces'],
    ['vainilla', 'Vainilla', '🌼', 2, 'dulces'], ['chocolate', 'Chocolate', '🍫', 4, 'dulces'],
    ['cacao', 'Cacao', '🍫', 3, 'dulces'], ['mani', 'Maní', '🥜', 2, 'dulces'],
    ['galletas', 'Galletas', '🍪', 3, 'dulces'],
    // bebidas
    ['agua', 'Agua', '💧', 1, 'bebidas'], ['hielo', 'Hielo', '🧊', 1, 'bebidas'],
    ['cafe', 'Café', '☕', 3, 'bebidas'], ['te', 'Té', '🍵', 2, 'bebidas'],
    ['gaseosa', 'Gaseosa', '🥤', 3, 'bebidas']
  ];
  const ING = {};
  ING_RAW.forEach(function (a) {
    ING[a[0]] = { id: a[0], nombre: a[1], emoji: a[2], precio: a[3], pasillo: a[4] };
  });

  /* ---------- CATEGORÍAS ---------- */
  const CATEGORIAS = {
    des: { nombre: 'Desayunos',      emoji: '🍳' },
    alm: { nombre: 'Almuerzos',      emoji: '🍛' },
    cen: { nombre: 'Cenas',          emoji: '🍝' },
    rap: { nombre: 'Comidas rápidas', emoji: '🍔' },
    pos: { nombre: 'Postres',        emoji: '🍰' },
    beb: { nombre: 'Bebidas',        emoji: '🥤' },
    emb: { nombre: 'Embutidos',      emoji: '🌭' },
    fri: { nombre: 'Fritos',         emoji: '🍟' }
  };

  /* ---------- RECETAS ----------
     [id, nombre, emoji, categoria, nivel, 'ing:cant ...', 'paso:ing ...', gratis]
     Pasos: cortar, sarten, freidora, horno, hervir, mezclar, licuar, armar */
  const REC_RAW = [
    // DESAYUNOS
    ['tinto', 'Tinto bien cargado', '☕', 'des', 1, 'cafe:1 agua:1 azucar:1', 'hervir:agua mezclar:cafe', 1],
    ['arepa_queso', 'Arepa con queso', '🫓', 'des', 1, 'harina_maiz:2 queso_costeno:1 mantequilla:1', 'mezclar:harina_maiz sarten:harina_maiz armar', 1],
    ['huevos_fritos', 'Huevos fritos', '🍳', 'des', 1, 'huevo:2 aceite:1 sal:1', 'sarten:huevo armar', 1],
    ['huevos_pericos', 'Huevos pericos', '🍳', 'des', 1, 'huevo:2 tomate:1 cebolla:1 aceite:1', 'cortar:tomate cortar:cebolla sarten:huevo armar'],
    ['tostadas', 'Tostadas con mantequilla', '🍞', 'des', 1, 'pan:2 mantequilla:1', 'horno:pan armar'],
    ['cafe_leche', 'Café con leche', '☕', 'des', 1, 'cafe:1 leche:1 azucar:1', 'hervir:leche mezclar:cafe'],
    ['arepa_huevo', 'Arepa de huevo', '🥟', 'des', 2, 'harina_maiz:2 huevo:1 aceite:2', 'mezclar:harina_maiz freidora:harina_maiz armar'],
    ['pan_jamon_huevo', 'Pan con jamón y huevo', '🥪', 'des', 2, 'pan:2 huevo:1 jamon:1', 'sarten:huevo armar'],
    ['bollo_queso', 'Bollo con queso costeño', '🌽', 'des', 2, 'harina_maiz:2 queso_costeno:1', 'mezclar:harina_maiz hervir:harina_maiz armar'],
    ['avena_caliente', 'Avena caliente', '🥣', 'des', 2, 'avena:2 leche:1 canela:1 azucar:1', 'hervir:leche mezclar:avena'],
    ['calentado', 'Calentado paisa', '🍛', 'des', 3, 'arroz:1 frijol:1 huevo:1 chorizo:1', 'sarten:arroz sarten:chorizo armar'],
    ['changua', 'Changua', '🥛', 'des', 3, 'leche:1 huevo:1 cebolla:1 pan:1 cilantro:1', 'hervir:leche cortar:cilantro armar'],
    ['bowl_avena', 'Bowl de avena y frutas', '🥣', 'des', 3, 'avena:1 banano:1 fresa:1 miel:1', 'cortar:banano cortar:fresa armar'],
    ['panqueques', 'Panqueques con miel', '🥞', 'des', 4, 'harina_trigo:2 huevo:1 leche:1 mantequilla:1 miel:1', 'mezclar:harina_trigo sarten:harina_trigo armar'],
    ['huevos_rancheros', 'Huevos rancheros', '🍳', 'des', 4, 'huevo:2 tortilla:1 tomate:1 aji:1', 'cortar:tomate sarten:huevo armar'],
    ['omelette', 'Omelette de champiñones', '🍳', 'des', 5, 'huevo:2 champinon:1 queso:1 mantequilla:1', 'cortar:champinon sarten:huevo armar'],
    ['croissant_jq', 'Croissant de jamón y queso', '🥐', 'des', 5, 'croissant:1 jamon:1 queso:1', 'horno:croissant armar'],
    ['tamal', 'Tamal tolimense', '🫔', 'des', 6, 'harina_maiz:2 cerdo:1 pollo:1 zanahoria:1', 'cortar:zanahoria hervir:cerdo hervir:harina_maiz armar'],

    // ALMUERZOS
    ['lentejas', 'Lentejas con arroz', '🍲', 'alm', 2, 'lenteja:2 arroz:1 cebolla:1 tomate:1', 'cortar:cebolla hervir:lenteja armar'],
    ['arroz_pollo', 'Arroz con pollo', '🍗', 'alm', 2, 'arroz:2 pollo:2 zanahoria:1 cebolla:1', 'cortar:zanahoria hervir:arroz sarten:pollo armar'],
    ['sopa_pollo', 'Sopa de pollo', '🍲', 'alm', 3, 'pollo:2 papa:2 zanahoria:1 cilantro:1', 'cortar:papa hervir:pollo armar'],
    ['pechuga_plancha', 'Pechuga a la plancha', '🍗', 'alm', 3, 'pechuga:1 lechuga:1 tomate:1 limon:1', 'cortar:lechuga sarten:pechuga armar'],
    ['pasta_bolonesa', 'Pasta boloñesa', '🍝', 'alm', 3, 'pasta:2 carne_molida:1 salsa_tomate:1 cebolla:1', 'cortar:cebolla hervir:pasta sarten:carne_molida armar'],
    ['sudado_pollo', 'Sudado de pollo', '🍗', 'alm', 4, 'pollo:2 papa:2 tomate:1 cebolla:1', 'cortar:papa hervir:pollo armar'],
    ['carne_asada', 'Carne asada con papas', '🥩', 'alm', 4, 'carne_res:2 papa:2 sal:1', 'cortar:papa sarten:carne_res armar'],
    ['cerdo_arroz', 'Cerdo en salsa con arroz', '🍖', 'alm', 4, 'cerdo:2 arroz:1 cebolla:1 salsa_tomate:1', 'cortar:cebolla sarten:cerdo hervir:arroz armar'],
    ['mojarra_frita', 'Mojarra frita con patacón', '🐠', 'alm', 5, 'mojarra:1 platano_verde:1 limon:1', 'freidora:mojarra freidora:platano_verde armar'],
    ['sancocho', 'Sancocho costeño', '🍲', 'alm', 5, 'carne_res:2 yuca:2 papa:1 platano_verde:1 maiz_tierno:1', 'cortar:yuca hervir:carne_res armar'],
    ['arroz_camaron', 'Arroz de camarón', '🍤', 'alm', 6, 'arroz:1 camaron:2 pimenton:1 ajo:1', 'cortar:pimenton hervir:arroz sarten:camaron armar'],
    ['pescado_coco', 'Pescado con arroz de coco', '🐟', 'alm', 6, 'pescado:1 arroz:1 coco:1 platano_verde:1', 'hervir:arroz freidora:pescado freidora:platano_verde armar'],
    ['costillas_bbq', 'Costillas BBQ', '🍖', 'alm', 7, 'costilla:2 salsa_bbq:1 papa:1', 'horno:costilla freidora:papa armar'],
    ['ajiaco', 'Ajiaco santafereño', '🍲', 'alm', 7, 'pollo:1 papa:3 maiz_tierno:1 aguacate:1 crema_leche:1', 'cortar:papa hervir:pollo armar'],
    ['bandeja_paisa', 'Bandeja paisa', '🍽️', 'alm', 8, 'arroz:1 frijol:1 carne_molida:1 chicharron:1 huevo:1 platano_maduro:1 aguacate:1 chorizo:1', 'hervir:frijol sarten:carne_molida freidora:chicharron sarten:huevo armar'],
    ['lomo_champi', 'Lomo con champiñones', '🥩', 'alm', 8, 'carne_res:2 champinon:2 crema_leche:1 mantequilla:1', 'cortar:champinon sarten:carne_res armar'],
    ['cazuela_mariscos', 'Cazuela de mariscos', '🦞', 'alm', 9, 'camaron:1 calamar:1 pescado:1 coco:1 tomate:1', 'cortar:tomate hervir:coco hervir:pescado armar'],

    // CENAS
    ['sopa_verduras', 'Sopa de verduras', '🥣', 'cen', 2, 'zanahoria:1 papa:1 brocoli:1 caldo:1', 'cortar:zanahoria cortar:papa hervir:caldo armar'],
    ['ensalada_cesar', 'Ensalada César', '🥗', 'cen', 3, 'lechuga:1 pollo:1 queso:1 pan:1', 'cortar:lechuga sarten:pollo armar'],
    ['pizza_margarita', 'Pizza margarita', '🍕', 'cen', 4, 'masa_pizza:1 salsa_tomate:1 mozzarella:2', 'mezclar:masa_pizza horno:masa_pizza armar'],
    ['quesadilla', 'Quesadilla de pollo', '🌮', 'cen', 4, 'tortilla:2 pollo:1 queso:2', 'sarten:pollo sarten:tortilla armar'],
    ['pizza_pepperoni', 'Pizza de pepperoni', '🍕', 'cen', 5, 'masa_pizza:1 salsa_tomate:1 mozzarella:2 pepperoni:2', 'mezclar:masa_pizza horno:masa_pizza armar'],
    ['carbonara', 'Spaghetti carbonara', '🍝', 'cen', 5, 'pasta:2 tocino:1 huevo:1 queso:1', 'hervir:pasta sarten:tocino armar'],
    ['tacos_carne', 'Tacos de carne', '🌮', 'cen', 5, 'tortilla:2 carne_res:1 cebolla:1 cilantro:1 limon:1', 'cortar:cebolla sarten:carne_res armar'],
    ['pollo_horno', 'Pollo al horno con papas', '🍗', 'cen', 5, 'pollo:2 papa:2 ajo:1', 'cortar:papa horno:pollo armar'],
    ['lasana', 'Lasaña de carne', '🍝', 'cen', 6, 'pasta:2 carne_molida:2 mozzarella:2 salsa_tomate:1', 'sarten:carne_molida hervir:pasta horno:mozzarella armar'],
    ['pescado_ajillo', 'Pescado al ajillo', '🐟', 'cen', 6, 'pescado:2 ajo:1 limon:1 mantequilla:1', 'cortar:ajo sarten:pescado armar'],
    ['crema_champi', 'Crema de champiñones', '🍄', 'cen', 6, 'champinon:2 crema_leche:1 cebolla:1 mantequilla:1', 'cortar:champinon cortar:cebolla hervir:crema_leche armar'],
    ['pasta_camarones', 'Pasta con camarones', '🍤', 'cen', 7, 'pasta:2 camaron:2 ajo:1 crema_leche:1', 'hervir:pasta sarten:camaron armar'],
    ['churrasco', 'Churrasco con papas', '🥩', 'cen', 8, 'carne_res:3 papa:2 ajo:1', 'cortar:papa sarten:carne_res freidora:papa armar'],
    ['paella_caribe', 'Paella del Caribe', '🥘', 'cen', 10, 'arroz:2 camaron:1 calamar:1 pollo:1 pimenton:1', 'cortar:pimenton sarten:pollo hervir:arroz armar'],

    // COMIDAS RÁPIDAS
    ['hamburguesa', 'Hamburguesa sencilla', '🍔', 'rap', 1, 'pan_hamburguesa:1 carne_molida:1 lechuga:1 tomate:1', 'sarten:carne_molida cortar:tomate armar', 1],
    ['perro_caliente', 'Perro caliente', '🌭', 'rap', 1, 'pan_perro:1 salsa_tomate:1 salchicha:1 mayonesa:1', 'sarten:salchicha armar', 1],
    ['perro_suizo', 'Perro suizo', '🌭', 'rap', 2, 'pan_perro:1 salchicha:1 queso:1', 'sarten:salchicha horno:queso armar'],
    ['sandwich_pollo', 'Sándwich de pollo', '🥪', 'rap', 2, 'pan:2 pollo:1 lechuga:1 mayonesa:1', 'sarten:pollo armar'],
    ['salchipapa', 'Salchipapa', '🍟', 'rap', 2, 'papa:2 salchicha:2 salsa_tomate:1 mayonesa:1', 'cortar:papa freidora:papa freidora:salchicha armar'],
    ['hamburguesa_doble', 'Hamburguesa doble con queso', '🍔', 'rap', 3, 'pan_hamburguesa:1 carne_molida:2 queso:2 lechuga:1 tomate:1', 'sarten:carne_molida cortar:tomate armar'],
    ['arepa_rellena', 'Arepa rellena de carne y queso', '🫓', 'rap', 3, 'harina_maiz:2 carne_molida:1 queso:1', 'mezclar:harina_maiz sarten:harina_maiz sarten:carne_molida armar'],
    ['wrap_pollo', 'Wrap de pollo', '🌯', 'rap', 3, 'tortilla:1 pollo:1 lechuga:1 tomate:1', 'sarten:pollo cortar:tomate armar'],
    ['patacon_todo', 'Patacón con todo', '🍌', 'rap', 4, 'platano_verde:2 pollo:1 queso:1 aguacate:1', 'cortar:platano_verde freidora:platano_verde armar'],
    ['club_sandwich', 'Club sándwich', '🥪', 'rap', 4, 'pan:3 jamon:1 tocino:1 huevo:1 lechuga:1', 'sarten:tocino sarten:huevo armar'],
    ['choripan', 'Choripán', '🌭', 'rap', 4, 'pan_perro:1 chorizo:2 mostaza:1', 'sarten:chorizo armar'],
    ['burrito', 'Burrito de res', '🌯', 'rap', 5, 'tortilla:2 carne_res:1 arroz:1 frijol:1 queso:1', 'sarten:carne_res hervir:frijol armar'],
    ['hamburguesa_veg', 'Hamburguesa vegetariana', '🍔', 'rap', 5, 'pan_hamburguesa:1 lenteja:1 champinon:1 lechuga:1 tomate:1', 'hervir:lenteja cortar:champinon armar'],
    ['perro_especial', 'Perro especial con tocino', '🌭', 'rap', 5, 'pan_perro:1 salchicha:1 tocino:1 queso:1 papa:1', 'sarten:tocino sarten:salchicha armar'],
    ['hamburguesa_bbq', 'Hamburguesa BBQ', '🍔', 'rap', 6, 'pan_hamburguesa:1 carne_molida:2 salsa_bbq:1 tocino:1 queso:1', 'sarten:carne_molida sarten:tocino armar'],

    // POSTRES
    ['ensalada_frutas', 'Ensalada de frutas', '🍓', 'pos', 2, 'banano:1 fresa:1 mango:1 manzana:1 naranja:1', 'cortar:fresa cortar:mango cortar:manzana armar'],
    ['arroz_leche', 'Arroz con leche', '🍚', 'pos', 2, 'arroz:1 leche:2 canela:1 azucar:1', 'hervir:leche mezclar:arroz armar'],
    ['copa_helado', 'Copa de helado de mora', '🍨', 'pos', 3, 'helado:2 mora:2 galletas:1', 'armar'],
    ['flan', 'Flan de caramelo', '🍮', 'pos', 3, 'huevo:2 leche:1 azucar:2 vainilla:1', 'mezclar:huevo horno:leche armar'],
    ['bunuelos', 'Buñuelos', '🧆', 'pos', 3, 'harina_maiz:1 queso_costeno:2 huevo:1 azucar:1', 'mezclar:harina_maiz freidora:harina_maiz armar'],
    ['cocadas', 'Cocadas', '🥥', 'pos', 3, 'coco:2 azucar:2 panela:1', 'cortar:coco hervir:azucar armar'],
    ['oblea', 'Oblea con arequipe', '🍪', 'pos', 3, 'galletas:2 miel:1 queso:1', 'armar'],
    ['brownie', 'Brownie con helado', '🍫', 'pos', 4, 'chocolate:2 harina_trigo:1 huevo:1 mantequilla:1 azucar:1', 'mezclar:chocolate horno:chocolate armar'],
    ['banana_split', 'Banana split', '🍌', 'pos', 4, 'banano:1 helado:2 chocolate:1', 'cortar:banano armar'],
    ['natilla', 'Natilla', '🍮', 'pos', 4, 'leche:2 panela:1 harina_maiz:1 canela:1', 'hervir:leche mezclar:harina_maiz armar'],
    ['torta_chocolate', 'Torta de chocolate', '🍰', 'pos', 5, 'harina_trigo:2 cacao:2 huevo:2 azucar:2 mantequilla:1', 'mezclar:harina_trigo horno:cacao armar'],
    ['crepes_fresa', 'Crepes de chocolate y fresa', '🥞', 'pos', 5, 'harina_trigo:1 huevo:1 leche:1 chocolate:1 fresa:1', 'mezclar:harina_trigo sarten:harina_trigo cortar:fresa armar'],
    ['cupcakes', 'Cupcakes de fresa', '🧁', 'pos', 5, 'harina_trigo:1 huevo:1 azucar:1 mantequilla:1 fresa:1', 'mezclar:harina_trigo horno:harina_trigo armar'],
    ['cheesecake', 'Cheesecake de fresa', '🍰', 'pos', 6, 'crema_leche:2 galletas:2 fresa:2 azucar:1', 'mezclar:crema_leche horno:crema_leche cortar:fresa armar'],
    ['tres_leches', 'Torta tres leches', '🍰', 'pos', 6, 'harina_trigo:1 leche:2 crema_leche:1 huevo:2 azucar:1', 'mezclar:harina_trigo horno:harina_trigo armar'],
    ['mousse_maracuya', 'Mousse de maracuyá', '🍮', 'pos', 6, 'maracuya:2 crema_leche:2 azucar:1', 'licuar:maracuya armar'],
    ['donas', 'Donas glaseadas', '🍩', 'pos', 7, 'harina_trigo:2 azucar:1 huevo:1 chocolate:1', 'mezclar:harina_trigo freidora:harina_trigo armar'],
    ['tarta_limon', 'Tarta de limón', '🥧', 'pos', 7, 'galletas:2 limon:2 crema_leche:1 azucar:1', 'cortar:limon mezclar:crema_leche armar'],
    ['pastel_manzana', 'Pastel de manzana', '🥧', 'pos', 8, 'harina_trigo:2 manzana:2 mantequilla:1 azucar:1 canela:1', 'cortar:manzana mezclar:harina_trigo horno:manzana armar'],

    // BEBIDAS
    ['limonada', 'Limonada', '🍋', 'beb', 1, 'limon:2 azucar:1 agua:1 hielo:1', 'cortar:limon licuar:limon', 1],
    ['jugo_naranja', 'Jugo de naranja', '🍊', 'beb', 1, 'naranja:3 hielo:1', 'cortar:naranja licuar:naranja', 1],
    ['gaseosa_fria', 'Gaseosa fría', '🥤', 'beb', 1, 'gaseosa:1 hielo:1', 'armar', 1],
    ['agua_panela', 'Agua de panela con limón', '🍯', 'beb', 2, 'panela:2 limon:1 agua:1 hielo:1', 'hervir:panela armar'],
    ['te_helado', 'Té helado', '🍵', 'beb', 2, 'te:1 limon:1 azucar:1 hielo:1', 'hervir:te armar'],
    ['jugo_mango', 'Jugo de mango', '🥭', 'beb', 2, 'mango:2 agua:1 azucar:1 hielo:1', 'cortar:mango licuar:mango'],
    ['batido_banano', 'Batido de banano', '🍌', 'beb', 2, 'banano:2 leche:1 azucar:1 hielo:1', 'cortar:banano licuar:banano'],
    ['chocolate_caliente', 'Chocolate caliente', '☕', 'beb', 2, 'chocolate:2 leche:2', 'hervir:leche mezclar:chocolate'],
    ['batido_fresa', 'Batido de fresa', '🍓', 'beb', 3, 'fresa:2 leche:1 helado:1', 'cortar:fresa licuar:fresa'],
    ['jugo_maracuya', 'Jugo de maracuyá', '🍈', 'beb', 3, 'maracuya:2 agua:1 azucar:1 hielo:1', 'cortar:maracuya licuar:maracuya'],
    ['jugo_lulo', 'Jugo de lulo', '🍑', 'beb', 3, 'lulo:2 agua:1 azucar:1 hielo:1', 'cortar:lulo licuar:lulo'],
    ['jugo_mora', 'Jugo de mora en leche', '🫐', 'beb', 3, 'mora:2 leche:1 azucar:1 hielo:1', 'licuar:mora armar'],
    ['granizado_uva', 'Granizado de uva', '🍇', 'beb', 3, 'uva:2 hielo:2 azucar:1', 'licuar:uva armar'],
    ['limonada_coco', 'Limonada de coco', '🥥', 'beb', 4, 'limon:2 coco:2 hielo:1 azucar:1', 'cortar:limon cortar:coco licuar:coco'],
    ['capuchino', 'Capuchino', '☕', 'beb', 4, 'cafe:2 leche:2 canela:1', 'hervir:leche mezclar:cafe armar'],
    ['milkshake', 'Milkshake de chocolate', '🥤', 'beb', 4, 'helado:2 chocolate:1 leche:1', 'licuar:helado armar'],
    ['granizado_sandia', 'Granizado de sandía', '🍉', 'beb', 4, 'sandia:3 hielo:2 azucar:1', 'cortar:sandia licuar:sandia'],
    ['cafe_helado', 'Café helado', '🧊', 'beb', 4, 'cafe:2 hielo:2 leche:1 azucar:1', 'hervir:cafe licuar:hielo armar'],
    ['smoothie_tropical', 'Smoothie tropical', '🍹', 'beb', 5, 'mango:1 pina:1 banano:1 maracuya:1 hielo:1', 'cortar:pina cortar:mango licuar:pina'],
    ['guanabana_leche', 'Guanábana en leche', '🥝', 'beb', 5, 'guanabana:2 leche:1 azucar:1 hielo:1', 'licuar:guanabana armar'],
    ['mojito', 'Mojito sin alcohol', '🍃', 'beb', 5, 'limon:2 menta:1 azucar:1 hielo:1 gaseosa:1', 'cortar:limon cortar:menta mezclar:menta armar'],
    ['pina_colada', 'Piña colada sin alcohol', '🍍', 'beb', 6, 'pina:2 coco:2 hielo:1', 'cortar:pina cortar:coco licuar:pina'],

    // EMBUTIDOS
    ['butifarra', 'Butifarra soledeña', '🌭', 'emb', 2, 'butifarra:3 limon:1', 'hervir:butifarra armar'],
    ['chorizo_parrilla', 'Chorizo a la parrilla', '🌭', 'emb', 2, 'chorizo:2 limon:1', 'sarten:chorizo armar'],
    ['tocino_crocante', 'Tocino crocante', '🥓', 'emb', 3, 'tocino:3', 'sarten:tocino armar'],
    ['morcilla_frita', 'Morcilla frita', '🌭', 'emb', 3, 'morcilla:2 limon:1', 'freidora:morcilla armar'],
    ['chorizo_arepa', 'Chorizo con arepa', '🌭', 'emb', 3, 'chorizo:1 harina_maiz:2 limon:1', 'mezclar:harina_maiz sarten:harina_maiz sarten:chorizo armar'],
    ['salchicha_alemana', 'Salchicha alemana', '🌭', 'emb', 4, 'salchicha:2 pan:1 mostaza:1', 'sarten:salchicha armar'],
    ['tabla_embutidos', 'Tabla de embutidos', '🧀', 'emb', 4, 'jamon:1 salchichon:1 chorizo:1 queso:1 pan:1', 'cortar:jamon cortar:salchichon armar'],
    ['picada', 'Picada paisa', '🍖', 'emb', 6, 'chorizo:1 morcilla:1 chicharron:1 papa:2 platano_maduro:1', 'sarten:chorizo freidora:morcilla freidora:papa armar'],
    ['jamon_glaseado', 'Jamón glaseado', '🍖', 'emb', 7, 'jamon:2 miel:1 naranja:1', 'cortar:naranja horno:jamon armar'],
    ['parrillada', 'Parrillada mixta', '🍖', 'emb', 9, 'carne_res:1 chorizo:1 morcilla:1 pollo:1 papa:1 platano_maduro:1', 'sarten:carne_res sarten:chorizo sarten:pollo armar'],

    // FRITOS
    ['papas_fritas', 'Papas fritas', '🍟', 'fri', 1, 'papa:2 aceite:1 sal:1', 'cortar:papa freidora:papa armar', 1],
    ['empanada', 'Empanada de carne', '🥟', 'fri', 1, 'masa_empanada:1 carne_molida:1 papa:1', 'cortar:papa freidora:masa_empanada armar', 1],
    ['yuca_frita', 'Yuca frita', '🍠', 'fri', 2, 'yuca:2 aceite:1 sal:1', 'cortar:yuca freidora:yuca armar'],
    ['tajadas', 'Plátano maduro frito', '🍌', 'fri', 2, 'platano_maduro:2 aceite:1', 'cortar:platano_maduro freidora:platano_maduro armar'],
    ['patacones', 'Patacones con hogao', '🍌', 'fri', 2, 'platano_verde:2 aceite:1 sal:1 tomate:1', 'cortar:platano_verde freidora:platano_verde armar'],
    ['carimanola', 'Carimañola', '🥟', 'fri', 3, 'yuca:2 carne_molida:1 queso_costeno:1', 'hervir:yuca mezclar:yuca freidora:yuca armar'],
    ['aros_cebolla', 'Aros de cebolla', '🧅', 'fri', 3, 'cebolla:2 harina_trigo:1 huevo:1 aceite:1', 'cortar:cebolla freidora:cebolla armar'],
    ['nuggets', 'Nuggets de pollo', '🍗', 'fri', 3, 'pollo:2 harina_trigo:1 huevo:1', 'cortar:pollo freidora:pollo armar'],
    ['chicharron_crocante', 'Chicharrón crocante', '🥓', 'fri', 3, 'chicharron:3 limon:1', 'freidora:chicharron armar'],
    ['pollo_frito', 'Pollo frito', '🍗', 'fri', 4, 'pollo:2 harina_trigo:1 aceite:1 huevo:1', 'mezclar:harina_trigo freidora:pollo armar'],
    ['alitas_bbq', 'Alitas BBQ', '🍗', 'fri', 4, 'alas:3 salsa_bbq:1', 'freidora:alas armar'],
    ['pescado_frito', 'Pescado frito', '🐟', 'fri', 4, 'pescado:2 harina_trigo:1 limon:1', 'mezclar:harina_trigo freidora:pescado armar'],
    ['bolitas_queso', 'Bolitas de queso', '🧀', 'fri', 4, 'queso_costeno:2 harina_trigo:1 huevo:1', 'mezclar:queso_costeno freidora:queso_costeno armar'],
    ['churros', 'Churros con chocolate', '🥖', 'fri', 5, 'harina_trigo:2 azucar:1 aceite:1 canela:1', 'mezclar:harina_trigo freidora:harina_trigo armar'],
    ['dedos_queso', 'Dedos de queso', '🧀', 'fri', 5, 'mozzarella:2 harina_trigo:1 huevo:1 aceite:1', 'mezclar:mozzarella freidora:mozzarella armar'],
    ['camarones_apanados', 'Camarones apanados', '🍤', 'fri', 6, 'camaron:2 harina_trigo:1 huevo:1 aceite:1', 'mezclar:harina_trigo freidora:camaron armar'],
    ['calamares', 'Calamares fritos', '🦑', 'fri', 6, 'calamar:2 harina_trigo:1 limon:1', 'mezclar:harina_trigo freidora:calamar armar'],
    ['croquetas_jamon', 'Croquetas de jamón', '🧆', 'fri', 7, 'jamon:1 harina_trigo:1 leche:1 huevo:1', 'mezclar:harina_trigo freidora:jamon armar']
  ];

  const MAX_NIVEL = 20;

  const REC = {};
  const REC_LISTA = [];
  REC_RAW.forEach(function (a) {
    const ing = {};
    let costo = 0;
    a[5].split(' ').forEach(function (p) {
      const x = p.split(':');
      const q = parseInt(x[1], 10);
      ing[x[0]] = q;
      if (ING[x[0]]) costo += ING[x[0]].precio * q;
    });
    const pasos = a[6].split(' ').map(function (p) {
      const x = p.split(':');
      return { tipo: x[0], ing: x[1] || null };
    });
    const nivel = a[4];
    const precio = Math.round((costo * 1.9 + 2) * (1 + nivel * 0.12));
    const gratis = !!a[7];
    const desbloqueo = gratis ? 0 : Math.max(25, Math.round(precio * (2 + nivel * 0.9) / 5) * 5);
    const r = {
      id: a[0], nombre: a[1], emoji: a[2], cat: a[3], nivel: nivel,
      ing: ing, pasos: pasos, gratis: gratis, costo: costo,
      precio: precio, desbloqueo: desbloqueo
    };
    REC[r.id] = r;
    REC_LISTA.push(r);
  });

  /* ---------- ZONAS ---------- */
  const ZONAS = [
    { id: 0, nombre: 'El Localito',     emoji: '🏠', nivel: 1 },
    { id: 1, nombre: 'Terraza Caribe',  emoji: '🌴', nivel: 4 },
    { id: 2, nombre: 'Salón VIP',       emoji: '✨', nivel: 8 },
    { id: 3, nombre: 'Rooftop',         emoji: '🌇', nivel: 12 }
  ];
  const MESAS_POR_ZONA = 4;
  const MAX_MESAS = 16;

  /* ---------- APARATOS ---------- */
  const APARATOS = {
    estufa:    { n: 'Estufa',            emoji: '🔥', niveles: ['Estufa de una hornilla', 'Estufa de gas', 'Estufa industrial', 'Estufa de inducción', 'Estufa de chef'], desc: 'Sartén y ollas: el punto es más fácil de atinar.' },
    freidora:  { n: 'Freidora',          emoji: '🍟', niveles: ['Freidora pequeña', 'Freidora doble', 'Freidora industrial', 'Freidora de aire pro', 'Freidora inteligente'], desc: 'Los fritos se doran más despacio y con más margen.' },
    horno:     { n: 'Horno',             emoji: '♨️', niveles: ['Horno tostador', 'Horno eléctrico', 'Horno de convección', 'Horno de piedra', 'Horno profesional'], desc: 'Hornea y gratina con más tiempo para sacar a punto.' },
    licuadora: { n: 'Licuadora',         emoji: '🥤', niveles: ['Licuadora de vaso', 'Licuadora potente', 'Licuadora industrial', 'Licuadora silenciosa', 'Licuadora de lujo'], desc: 'Zona de licuado más ancha, menos derrames.' },
    cuchillos: { n: 'Cuchillos y tabla', emoji: '🔪', niveles: ['Cuchillo básico', 'Juego de cuchillos', 'Cuchillos de acero', 'Cuchillos japoneses', 'Cuchillos de chef'], desc: 'La aguja de corte va más lenta y la zona es más grande.' },
    nevera:    { n: 'Nevera y despensa', emoji: '🧊', niveles: ['Nevera pequeña', 'Nevera grande', 'Cuarto frío', 'Despensa industrial', 'Bodega gigante'], desc: 'Guarda más unidades de cada ingrediente.' }
  };
  const APARATO_COSTO = [0, 120, 320, 750, 1600];
  const APARATO_NIVEL = [1, 3, 5, 8, 11];
  const NEVERA_CAP = [12, 24, 40, 60, 90];

  /* ---------- DECORACIÓN ---------- */
  const DECOR = {
    piso: {
      nombre: 'Piso', emoji: '🟫', items: [
        { id: 'piso0', n: 'Baldosa clara',   precio: 0,    nivel: 1,  enc: 0, css: 'repeating-conic-gradient(#F7F9FA 0% 25%, #E6EBEE 0% 50%) 0 0/36px 36px' },
        { id: 'piso1', n: 'Madera clara',    precio: 150,  nivel: 3,  enc: 2, css: 'repeating-linear-gradient(90deg,#EBC795 0 38px,#DDB27C 38px 40px)' },
        { id: 'piso2', n: 'Mosaico caribe',  precio: 400,  nivel: 6,  enc: 4, css: 'repeating-conic-gradient(#7FE0D6 0% 25%, #FFFFFF 0% 50%) 0 0/40px 40px' },
        { id: 'piso3', n: 'Damero papaya',   precio: 800,  nivel: 9,  enc: 6, css: 'repeating-conic-gradient(#FF8A75 0% 25%, #FFE3DC 0% 50%) 0 0/44px 44px' },
        { id: 'piso4', n: 'Mármol rosa',     precio: 1500, nivel: 12, enc: 9, css: 'linear-gradient(135deg,#FFE4EE,#FFC2D8 40%,#FFE9F1 60%,#FFC2D8)' }
      ]
    },
    pared: {
      nombre: 'Pared', emoji: '🧱', items: [
        { id: 'pared0', n: 'Blanca',          precio: 0,    nivel: 1,  enc: 0, css: '#FFFFFF' },
        { id: 'pared1', n: 'Amarillo mango',  precio: 120,  nivel: 2,  enc: 2, css: '#FFE08A' },
        { id: 'pared2', n: 'Turquesa',        precio: 300,  nivel: 5,  enc: 3, css: '#8FE3DA' },
        { id: 'pared3', n: 'Rosa guayaba',    precio: 600,  nivel: 8,  enc: 5, css: '#FFB3CF' },
        { id: 'pared4', n: 'Mural de Carnaval', precio: 1400, nivel: 11, enc: 9, css: 'repeating-linear-gradient(90deg,#FF6B57 0 40px,#FFC83D 40px 80px,#12B3A8 80px 120px,#8B6CF6 120px 160px)' }
      ]
    },
    luces: {
      nombre: 'Luces', emoji: '💡', items: [
        { id: 'luz0', n: 'Bombillo simple',    precio: 0,    nivel: 1,  enc: 0, emoji: '💡' },
        { id: 'luz1', n: 'Lámparas colgantes', precio: 200,  nivel: 4,  enc: 3, emoji: '🏮🏮🏮' },
        { id: 'luz2', n: 'Guirnalda de luces', precio: 500,  nivel: 7,  enc: 5, emoji: '✨✨✨✨' },
        { id: 'luz3', n: 'Candelabro',         precio: 1200, nivel: 11, enc: 8, emoji: '🕯️🕯️🕯️' }
      ]
    },
    plantas: {
      nombre: 'Plantas', emoji: '🪴', items: [
        { id: 'pl0', n: 'Sin plantas',      precio: 0,   nivel: 1, enc: 0, emoji: '' },
        { id: 'pl1', n: 'Matera pequeña',   precio: 80,  nivel: 2, enc: 2, emoji: '🪴' },
        { id: 'pl2', n: 'Palmeras',         precio: 300, nivel: 5, enc: 4, emoji: '🌴🌴' },
        { id: 'pl3', n: 'Jardín vertical',  precio: 900, nivel: 9, enc: 7, emoji: '🌿🌺🌴🌺' }
      ]
    },
    cuadros: {
      nombre: 'Cuadros', emoji: '🖼️', items: [
        { id: 'cu0', n: 'Sin cuadros',        precio: 0,    nivel: 1,  enc: 0, emoji: '' },
        { id: 'cu1', n: 'Cuadro sencillo',    precio: 100,  nivel: 3,  enc: 2, emoji: '🖼️' },
        { id: 'cu2', n: 'Galería caribe',     precio: 450,  nivel: 6,  enc: 4, emoji: '🖼️🎨🖼️' },
        { id: 'cu3', n: 'Neón de Carnaval',   precio: 1000, nivel: 10, enc: 6, emoji: '🎭' }
      ]
    }
  };

  /* ---------- PERSONAL ---------- */
  const ROLES = {
    mesero:   { n: 'Mesero',    emoji: '🍽️', nivelReq: 2, costo: 150, max: 4, desc: 'Sirve los platos listos a las mesas.' },
    cocinero: { n: 'Cocinero',  emoji: '👩‍🍳', nivelReq: 3, costo: 250, max: 4, desc: 'Cocina los pedidos pendientes por su cuenta.' },
    cajero:   { n: 'Cajero',    emoji: '💵', nivelReq: 4, costo: 300, max: 2, desc: 'Cobra a los clientes que ya terminaron.' },
    compras:  { n: 'Compras',   emoji: '🛒', nivelReq: 5, costo: 350, max: 2, desc: 'Repone en el súper lo que falta para los pedidos.' }
  };
  const STAFF_NIVEL_COSTO = [0, 0, 150, 350, 700, 1400];
  const STAFF_NIVEL_REQ = [0, 1, 3, 5, 7, 9];
  const STAFF_MAX_NIVEL = 5;
  const NOMBRES_STAFF = ['Valentina', 'Camila', 'Santiago', 'Mateo', 'Luciana', 'Sofía', 'Andrés', 'Daniela',
    'Julián', 'Isabella', 'Samuel', 'Manuela', 'Carlos', 'Mariana', 'Sebastián', 'Laura', 'Juanita', 'Tomás'];

  /* ---------- COSMÉTICOS ---------- */
  const COSM = {
    piel: [
      { id: 'p1', n: 'Clara',   c: '#FFE0C2', precio: 0 }, { id: 'p2', n: 'Trigueña', c: '#F5C9A0', precio: 0 },
      { id: 'p3', n: 'Canela',  c: '#D9A06F', precio: 0 }, { id: 'p4', n: 'Morena',   c: '#B97A4B', precio: 0 },
      { id: 'p5', n: 'Oscura',  c: '#8D5A3A', precio: 0 }, { id: 'p6', n: 'Ébano',    c: '#5E3A24', precio: 0 }
    ],
    pelo: [
      { id: 'corto',   n: 'Corto',   precio: 0 }, { id: 'largo',  n: 'Largo',  precio: 0 },
      { id: 'rizos',   n: 'Rizos',   precio: 60 }, { id: 'trenzas', n: 'Trenzas', precio: 80 },
      { id: 'mono',    n: 'Moño',    precio: 50 }
    ],
    colorPelo: [
      { id: 'negro', n: 'Negro', c: '#2B1B17', precio: 0 }, { id: 'castano', n: 'Castaño', c: '#6B3F2A', precio: 0 },
      { id: 'rubio', n: 'Rubio', c: '#E8C26B', precio: 0 }, { id: 'pelirrojo', n: 'Pelirrojo', c: '#C4502B', precio: 0 },
      { id: 'rosa', n: 'Rosa', c: '#FF7AB6', precio: 100 }, { id: 'turquesa', n: 'Turquesa', c: '#2EC4B6', precio: 100 },
      { id: 'morado', n: 'Morado', c: '#8B5CF6', precio: 100 }
    ],
    gorro: [
      { id: 'ninguno', n: 'Ninguno', precio: 0 }, { id: 'chef', n: 'Gorro de chef', precio: 120 },
      { id: 'gorra', n: 'Gorra', precio: 60 }, { id: 'panuelo', n: 'Pañoleta', precio: 60 },
      { id: 'vueltiao', n: 'Sombrero vueltiao', precio: 200 }
    ],
    camisa: [
      { id: 'c1', n: 'Blanca', c: '#FFFFFF', precio: 0 }, { id: 'c2', n: 'Turquesa', c: '#12B3A8', precio: 0 },
      { id: 'c3', n: 'Mango', c: '#FFC83D', precio: 0 }, { id: 'c4', n: 'Papaya', c: '#FF6B57', precio: 0 },
      { id: 'c5', n: 'Uva', c: '#8B6CF6', precio: 40 }, { id: 'c6', n: 'Rosa', c: '#FF8FB8', precio: 40 },
      { id: 'c7', n: 'Lima', c: '#8BD450', precio: 40 }, { id: 'c8', n: 'Azul', c: '#4A7BFF', precio: 40 }
    ],
    delantal: [
      { id: 'd1', n: 'Rojo', c: '#E63946', precio: 0 }, { id: 'd2', n: 'Azul marino', c: '#1E2A4A', precio: 0 },
      { id: 'd3', n: 'Verde', c: '#2BA84A', precio: 0 }, { id: 'd4', n: 'Negro', c: '#2A2A2A', precio: 0 },
      { id: 'd5', n: 'Rosa', c: '#FF5FA2', precio: 40 }, { id: 'd6', n: 'Amarillo', c: '#FFD23F', precio: 40 },
      { id: 'd7', n: 'Turquesa', c: '#12B3A8', precio: 40 }, { id: 'd8', n: 'Morado', c: '#7B4DFF', precio: 40 }
    ],
    acc: [
      { id: 'ninguno', n: 'Ninguno', precio: 0 }, { id: 'gafas', n: 'Gafas', precio: 80 },
      { id: 'lazo', n: 'Lazo', precio: 70 }, { id: 'aretes', n: 'Aretes', precio: 60 }
    ]
  };
  const COSM_NOMBRES = {
    piel: 'Piel', pelo: 'Peinado', colorPelo: 'Color de pelo', gorro: 'Gorro o sombrero',
    camisa: 'Camiseta', delantal: 'Delantal', acc: 'Accesorio'
  };

  const AVATAR_INICIAL = { piel: 'p2', pelo: 'largo', colorPelo: 'castano', gorro: 'ninguno', camisa: 'c2', delantal: 'd1', acc: 'ninguno' };

  const CLIENTES_EMOJI = ['🧑‍🦱', '👩', '👨', '👧', '🧓', '👵', '🧔', '👩‍🦰', '👨‍🦳', '🧑‍🎤', '👩‍💼', '🧑‍🎓', '👨‍🦱', '👩‍🦳', '🧑‍🍳', '👱‍♀️'];

  window.RL_DATA = {
    PASILLOS: PASILLOS, ING: ING, CATEGORIAS: CATEGORIAS, REC: REC, REC_LISTA: REC_LISTA,
    ZONAS: ZONAS, MESAS_POR_ZONA: MESAS_POR_ZONA, MAX_MESAS: MAX_MESAS, MAX_NIVEL: MAX_NIVEL,
    APARATOS: APARATOS, APARATO_COSTO: APARATO_COSTO, APARATO_NIVEL: APARATO_NIVEL, NEVERA_CAP: NEVERA_CAP,
    DECOR: DECOR, ROLES: ROLES, STAFF_NIVEL_COSTO: STAFF_NIVEL_COSTO, STAFF_NIVEL_REQ: STAFF_NIVEL_REQ,
    STAFF_MAX_NIVEL: STAFF_MAX_NIVEL, NOMBRES_STAFF: NOMBRES_STAFF,
    COSM: COSM, COSM_NOMBRES: COSM_NOMBRES, AVATAR_INICIAL: AVATAR_INICIAL, CLIENTES_EMOJI: CLIENTES_EMOJI
  };
})();
