# Restaurante Loco

Juego web de gestión de restaurante. Cada jugadora entra solo con su nombre y tiene su propio restaurante, monedas, nivel y puntaje.

Funciona sin instalar nada y sin servidor propio: son archivos estáticos (HTML, CSS y JavaScript).

## Qué trae el juego

- Inicio con solo el nombre de jugadora. Cada nombre es un restaurante independiente.
- 133 recetas en 8 categorías (desayunos, almuerzos, cenas, comidas rápidas, postres, bebidas, embutidos y fritos) con 95 ingredientes.
- Cocina interactiva paso a paso: cortar, sartén, freidora, horno, hervir, mezclar, licuar y armar el plato.
- Supermercado donde caminas entre estantes, llenas el carrito y pagas en la caja. Hay ofertas por pasillo.
- Caja registradora con devuelta exacta, pago con tarjeta y pago justo.
- Tres minijuegos (corte rápido, caja veloz, pedidos voladores) y regalo diario con racha.
- Contratación de meseros, cocineros, cajeros y compras, con entrenamiento por niveles.
- Mejoras: mesas, 6 electrodomésticos de 5 niveles, decoración (piso, pared, luces, plantas, cuadros) y personalización del personaje.
- 20 niveles y 4 zonas del local (Localito, Terraza Caribe, Salón VIP y Rooftop).
- Ranking entre jugadoras cuando activas la nube.

## Probarlo en tu computador (opcional)

Abre el archivo `index.html` con doble clic. El progreso se guarda en ese navegador.

---

## Subirlo a GitHub (sin usar la terminal)

1. Entra a https://github.com y crea tu cuenta gratis, o inicia sesión.
2. Arriba a la derecha toca el **+** y elige **New repository**.
3. En **Repository name** escribe `restaurante-loco`. Déjalo en **Public** y toca **Create repository**.
4. En la página que aparece toca el enlace **uploading an existing file**.
5. Abre la carpeta del juego en tu computador, selecciona **todos los archivos que están dentro** (no la carpeta) y arrástralos a la página de GitHub. Deben quedar `index.html`, `style.css`, `config.js`, `data.js`, `core.js`, `cocina.js`, `super.js`, `juegos.js`, `vistas.js`, `ui.js` y `supabase.sql` en la raíz del repositorio.
6. Espera a que termine de subir y toca el botón verde **Commit changes**.

## Publicarlo gratis en Vercel

1. Entra a https://vercel.com y toca **Sign Up**. Elige **Continue with GitHub** y autoriza.
2. Toca **Add New...** y luego **Project**.
3. Busca `restaurante-loco` en la lista y toca **Import**.
4. En **Framework Preset** deja **Other**. No cambies nada más: no hay comando de build ni carpeta de salida.
5. Toca **Deploy** y espera unos 30 segundos.
6. Vercel te muestra el link del juego, algo como `https://restaurante-loco.vercel.app`. Compártelo con tus amigas por WhatsApp.

Cada vez que cambies un archivo en GitHub, Vercel actualiza el juego solo.

---

## Guardar el progreso en la nube (para jugar desde varios dispositivos)

Sin este paso el juego funciona igual, pero cada jugadora conserva su progreso solo en el navegador donde jugó. Con la nube, tus amigas pueden entrar desde cualquier celular o computador con el mismo nombre y encontrar su restaurante, y aparece el ranking en línea.

1. Entra a https://supabase.com, crea tu cuenta gratis y toca **New project**. Ponle un nombre y una contraseña de base de datos (guárdala), elige una región cercana y espera a que se cree.
2. En el menú de la izquierda abre **SQL Editor** y toca **New query**.
3. Abre el archivo `supabase.sql`, copia todo su contenido, pégalo y toca **Run**. Debe decir que se ejecutó con éxito.
4. Ve a **Project Settings** y luego **API**. Copia dos datos: **Project URL** y la clave **anon public**.
5. En GitHub abre el archivo `config.js` y toca el lápiz para editarlo. Pega tus dos datos entre las comillas:

   ```js
   window.RL_CONFIG = {
     SUPABASE_URL: 'https://TU-PROYECTO.supabase.co',
     SUPABASE_ANON_KEY: 'TU-CLAVE-ANON-PUBLIC'
   };
   ```

6. Toca **Commit changes**. En un minuto Vercel publica la versión nueva.
7. Entra al juego: en la pantalla de inicio debe decir **Tu progreso se guarda en la nube**.

## Cosas que conviene saber

- **El nombre es la llave.** Quien escriba el mismo nombre entra al mismo restaurante. Tus amigas deben usar nombres distintos. No hay contraseña.
- La clave `anon public` está hecha para ir en páginas web, no es secreta. Aun así, como cualquiera con el link puede escribir un nombre, usa el juego solo entre amigas.
- Mientras compras en el súper o juegas un minijuego, el restaurante queda en pausa. También puedes pausar con el botón de arriba.
- Si cambias de dispositivo, el juego toma la versión guardada más reciente.
- En el perfil puedes cambiar el nombre del restaurante, personalizar tu personaje, ver el ranking y empezar de cero.

## Atajos para jugar más rápido

- **Servicio automático (⚡ arriba):** cada plato que terminas se sirve solo a la mesa que lo pidió. Se apaga con el botón o con **A**.
- **Cobro rápido:** cobra de una vez todas las mesas que pagan con tarjeta o justo. En el computador, tecla **Q**.
- Toca cualquier parte de una mesa que espera pago para abrir la caja.
- Al terminar un plato, **Siguiente pedido** te lleva directo al próximo que se pueda cocinar (**Enter**).
- Teclado en el computador: **1 a 8** cambian de pestaña, **S** sirve todo, **C** abre la caja, **P** pausa. Dentro de la caja, **1 a 8** agregan billetes, **Retroceso** quita el último y **Enter** entrega la devuelta.

## Cómo se juega

1. Los clientes llegan al **Salón** y piden platos.
2. En la **Cocina** eliges el plato y lo preparas paso a paso. Mientras mejor el punto, mejor calidad y más dinero.
3. Vuelve al salón, toca el plato verde en la mesa para servirlo y luego toca **Cobrar**.
4. En efectivo arma la devuelta exacta: lo que pagó menos la cuenta.
5. Si se acaban los ingredientes, ve al **Súper**, camina hasta el estante, agrega al carrito y paga en la caja.
6. Con las monedas desbloquea **Recetas**, compra mesas y electrodomésticos en **Mejoras** y contrata **Equipo**.
7. Subir de nivel abre zonas nuevas, recetas más complejas y puestos de trabajo.
