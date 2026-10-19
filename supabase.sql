-- ===========================================================
-- RESTAURANTE LOCO - Tabla para guardar el progreso en la nube
-- Pégalo completo en Supabase > SQL Editor > New query > Run
-- ===========================================================

create table if not exists public.jugadoras (
  clave       text primary key,          -- nombre normalizado (minúsculas, sin tildes)
  nombre      text not null,             -- nombre tal como lo escribió la jugadora
  restaurante text,
  nivel       int    default 1,
  puntaje     bigint default 0,
  datos       jsonb  not null,           -- todo el progreso del juego
  actualizado timestamptz default now()
);

create index if not exists jugadoras_puntaje_idx on public.jugadoras (puntaje desc);

alter table public.jugadoras enable row level security;

-- Cualquiera con el link del juego puede leer (para el ranking) y guardar.
-- Es un juego entre amigas: no hay contraseñas.
drop policy if exists "leer jugadoras" on public.jugadoras;
create policy "leer jugadoras" on public.jugadoras
  for select using (true);

drop policy if exists "crear jugadoras" on public.jugadoras;
create policy "crear jugadoras" on public.jugadoras
  for insert with check (true);

drop policy if exists "actualizar jugadoras" on public.jugadoras;
create policy "actualizar jugadoras" on public.jugadoras
  for update using (true) with check (true);
