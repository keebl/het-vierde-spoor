-- Optional accounts and sync for Reconstructie (specs/accounts-and-sync.md, plan step 3,
-- ADR-0006). Reconstructie shares the Supabase project `claudeDB` with clearhead (schema
-- public) and crossroads (schema crossroads), so everything lives in its own schema
-- `reconstructie`. Nothing outside this schema is created or changed.
--
-- Every table: user_id references auth.users with on delete cascade, Row Level Security on,
-- one policy per operation limited to auth.uid() = user_id. The anon role gets nothing.
-- Writes from the site go through the bewaar_* functions (security invoker, so RLS still
-- applies), which hold the merge rules: two devices pushing at once can only add progress.

create schema reconstructie;
revoke all on schema reconstructie from public, anon;
grant usage on schema reconstructie to authenticated;

-- Solved and revealed per puzzle. A puzzle id is an opaque string to the database.
create table reconstructie.puzzels (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  puzzel_id text not null check (char_length(puzzel_id) between 1 and 200),
  opgelost boolean not null default false,
  onthuld boolean not null default false,
  versie smallint not null default 1,
  bijgewerkt timestamptz not null default now(),
  primary key (user_id, puzzel_id)
);

-- The level path: stars and solved per stop.
create table reconstructie.pad (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  stap integer not null check (stap between 1 and 1000),
  sterren smallint not null default 0 check (sterren between 0 and 3),
  opgelost boolean not null default false,
  versie smallint not null default 1,
  bijgewerkt timestamptz not null default now(),
  primary key (user_id, stap)
);

-- Three preferences, each with the time it was chosen, so the newest wins per value.
create table reconstructie.voorkeuren (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  niveau smallint check (niveau between 1 and 6),
  niveau_tijd timestamptz,
  kruisjes boolean,
  kruisjes_tijd timestamptz,
  panelen jsonb check (
    panelen is null or (
      jsonb_typeof(panelen) = 'object'
      and panelen - array['aanwijzingen', 'legenda', 'uitleg'] = '{}'::jsonb
      and not jsonb_path_exists(panelen, '$.* ? (@.type() != "boolean")')
    )
  ),
  panelen_tijd timestamptz,
  versie smallint not null default 1,
  bijgewerkt timestamptz not null default now()
);

-- At most 2,000 puzzles per user (the local list keeps 120; the account keeps more).
create function reconstructie.puzzels_grens()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- A before-insert trigger also fires for the upsert of a row that already exists (the
  -- conflict is found after it); that adds nothing and must not be refused at the limit.
  if exists (select 1 from reconstructie.puzzels p
             where p.user_id = new.user_id and p.puzzel_id = new.puzzel_id) then
    return new;
  end if;
  if (select count(*) from reconstructie.puzzels p where p.user_id = new.user_id) >= 2000 then
    raise exception 'reconstructie: at most 2000 puzzles per user' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger puzzels_grens before insert on reconstructie.puzzels
  for each row execute function reconstructie.puzzels_grens();

alter table reconstructie.puzzels enable row level security;
alter table reconstructie.pad enable row level security;
alter table reconstructie.voorkeuren enable row level security;

revoke all on reconstructie.puzzels, reconstructie.pad, reconstructie.voorkeuren from public, anon;
grant select, insert, update, delete on reconstructie.puzzels, reconstructie.pad,
  reconstructie.voorkeuren to authenticated;

create policy puzzels_select on reconstructie.puzzels for select to authenticated
  using ((select auth.uid()) = user_id);
create policy puzzels_insert on reconstructie.puzzels for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy puzzels_update on reconstructie.puzzels for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy puzzels_delete on reconstructie.puzzels for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy pad_select on reconstructie.pad for select to authenticated
  using ((select auth.uid()) = user_id);
create policy pad_insert on reconstructie.pad for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy pad_update on reconstructie.pad for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy pad_delete on reconstructie.pad for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy voorkeuren_select on reconstructie.voorkeuren for select to authenticated
  using ((select auth.uid()) = user_id);
create policy voorkeuren_insert on reconstructie.voorkeuren for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy voorkeuren_update on reconstructie.voorkeuren for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy voorkeuren_delete on reconstructie.voorkeuren for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Merge: solved and revealed only ever turn on. Duplicates in one batch are folded first
-- (on conflict cannot touch a row twice). bijgewerkt moves only when something changed,
-- so a pull "since" returns only real news.
create function reconstructie.bewaar_puzzels(rijen jsonb)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if jsonb_typeof(rijen) is distinct from 'array' or jsonb_array_length(rijen) > 2000 then
    raise exception 'reconstructie: rijen must be an array of at most 2000' using errcode = '22023';
  end if;
  insert into reconstructie.puzzels as p (user_id, puzzel_id, opgelost, onthuld)
  select (select auth.uid()), r.puzzel_id, bool_or(coalesce(r.opgelost, false)),
         bool_or(coalesce(r.onthuld, false))
  from jsonb_to_recordset(rijen) as r (puzzel_id text, opgelost boolean, onthuld boolean)
  group by r.puzzel_id
  on conflict (user_id, puzzel_id) do update
    set opgelost = p.opgelost or excluded.opgelost,
        onthuld = p.onthuld or excluded.onthuld,
        bijgewerkt = now()
    where (p.opgelost or excluded.opgelost) is distinct from p.opgelost
       or (p.onthuld or excluded.onthuld) is distinct from p.onthuld;
end;
$$;

-- Merge: the most stars per stop; solved only ever turns on.
create function reconstructie.bewaar_pad(rijen jsonb)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if jsonb_typeof(rijen) is distinct from 'array' or jsonb_array_length(rijen) > 1000 then
    raise exception 'reconstructie: rijen must be an array of at most 1000' using errcode = '22023';
  end if;
  insert into reconstructie.pad as p (user_id, stap, sterren, opgelost)
  select (select auth.uid()), r.stap, max(coalesce(r.sterren, 0)), bool_or(coalesce(r.opgelost, false))
  from jsonb_to_recordset(rijen) as r (stap integer, sterren smallint, opgelost boolean)
  group by r.stap
  on conflict (user_id, stap) do update
    set sterren = greatest(p.sterren, excluded.sterren),
        opgelost = p.opgelost or excluded.opgelost,
        bijgewerkt = now()
    where greatest(p.sterren, excluded.sterren) is distinct from p.sterren
       or (p.opgelost or excluded.opgelost) is distinct from p.opgelost;
end;
$$;

-- A device's clock may run ahead. A time more than a day in the future becomes the
-- server's own time, so one wrong clock cannot pin a preference forever.
create function reconstructie.schone_tijd(tijd text)
returns timestamptz
language sql
stable
set search_path = ''
as $$
  select case when tijd::timestamptz > now() + interval '1 day' then now() else tijd::timestamptz end
$$;

-- Merge: per preference the newest value wins. waarden is
-- { "niveau": { "waarde": 4, "tijd": "…" }, "kruisjes": {…}, "panelen": {…} }; unknown
-- names are ignored, a wrong type or a value outside the check constraints is refused.
create function reconstructie.bewaar_voorkeuren(waarden jsonb)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  t timestamptz;
begin
  if jsonb_typeof(waarden) is distinct from 'object' then
    raise exception 'reconstructie: waarden must be an object' using errcode = '22023';
  end if;
  insert into reconstructie.voorkeuren (user_id) values (uid) on conflict (user_id) do nothing;

  if waarden ? 'niveau' then
    if jsonb_typeof(waarden -> 'niveau' -> 'waarde') is distinct from 'number' then
      raise exception 'reconstructie: niveau must be a number' using errcode = '22023';
    end if;
    t := reconstructie.schone_tijd(waarden -> 'niveau' ->> 'tijd');
    update reconstructie.voorkeuren
      set niveau = (waarden -> 'niveau' ->> 'waarde')::smallint, niveau_tijd = t, bijgewerkt = now()
      where user_id = uid and (niveau_tijd is null or niveau_tijd < t);
  end if;

  if waarden ? 'kruisjes' then
    if jsonb_typeof(waarden -> 'kruisjes' -> 'waarde') is distinct from 'boolean' then
      raise exception 'reconstructie: kruisjes must be a boolean' using errcode = '22023';
    end if;
    t := reconstructie.schone_tijd(waarden -> 'kruisjes' ->> 'tijd');
    update reconstructie.voorkeuren
      set kruisjes = (waarden -> 'kruisjes' ->> 'waarde')::boolean, kruisjes_tijd = t, bijgewerkt = now()
      where user_id = uid and (kruisjes_tijd is null or kruisjes_tijd < t);
  end if;

  if waarden ? 'panelen' then
    t := reconstructie.schone_tijd(waarden -> 'panelen' ->> 'tijd');
    update reconstructie.voorkeuren
      set panelen = waarden -> 'panelen' -> 'waarde', panelen_tijd = t, bijgewerkt = now()
      where user_id = uid and (panelen_tijd is null or panelen_tijd < t);
  end if;
end;
$$;

-- "Account verwijderen": every Reconstructie row of the caller, then the login itself only
-- when no other table in the project still references it. The other tables are found
-- through pg_constraint, so a table clearhead or crossroads adds later is covered without
-- editing this function. security definer because a user cannot delete from auth.users;
-- it acts on auth.uid() only and takes no arguments. Returns true when the login was
-- deleted too.
create function reconstructie.verwijder_mijn_account()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  r record;
  gevonden boolean;
begin
  if uid is null then
    raise exception 'reconstructie: not signed in' using errcode = '42501';
  end if;

  delete from reconstructie.puzzels where user_id = uid;
  delete from reconstructie.pad where user_id = uid;
  delete from reconstructie.voorkeuren where user_id = uid;

  for r in
    select con.conrelid::regclass as tabel, a.attname as kolom
    from pg_catalog.pg_constraint con
    join pg_catalog.pg_class c on c.oid = con.conrelid
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    join pg_catalog.pg_attribute a on a.attrelid = con.conrelid and a.attnum = con.conkey[1]
    where con.contype = 'f'
      and con.confrelid = 'auth.users'::regclass
      and array_length(con.conkey, 1) = 1
      and n.nspname not in ('auth', 'reconstructie')
  loop
    execute format('select exists (select 1 from %s where %I = $1)', r.tabel, r.kolom)
      into gevonden using uid;
    if gevonden then
      return false;
    end if;
  end loop;

  delete from auth.users where id = uid;
  return true;
end;
$$;

revoke all on function reconstructie.puzzels_grens() from public, anon, authenticated;
revoke all on function reconstructie.schone_tijd(text) from public, anon;
revoke all on function reconstructie.bewaar_puzzels(jsonb) from public, anon;
revoke all on function reconstructie.bewaar_pad(jsonb) from public, anon;
revoke all on function reconstructie.bewaar_voorkeuren(jsonb) from public, anon;
revoke all on function reconstructie.verwijder_mijn_account() from public, anon;
grant execute on function reconstructie.schone_tijd(text) to authenticated;
grant execute on function reconstructie.bewaar_puzzels(jsonb) to authenticated;
grant execute on function reconstructie.bewaar_pad(jsonb) to authenticated;
grant execute on function reconstructie.bewaar_voorkeuren(jsonb) to authenticated;
grant execute on function reconstructie.verwijder_mijn_account() to authenticated;
