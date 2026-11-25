-- Entitlement table for the paywall (specs/paywall-and-android.md, plan step 2, D8).
-- One row per purchase at a store. An account owns the game when it has a row that is not
-- withdrawn. Only the store webhooks write here; they run as service_role, which bypasses
-- RLS. A client may only read its own rows: no insert, update or delete grant exists for
-- authenticated or anon, so not even a crafted request can unlock an account.

create table reconstructie.toegang (
  user_id uuid not null references auth.users (id) on delete cascade,
  -- Where the purchase was made. 'handmatig' is a grant by hand (a tester after go-live,
  -- a refund dispute settled in the player's favour), written from the dashboard.
  bron text not null check (bron in ('stripe', 'play', 'apple', 'handmatig')),
  -- The store's own reference (Stripe Checkout session or payment intent, Play order id).
  -- With bron it is the key, so a webhook that arrives twice changes nothing.
  referentie text not null check (char_length(referentie) between 1 and 200),
  toegekend timestamptz not null default now(),
  -- Set on a refund or chargeback; the row stays, so the history of the purchase stays.
  ingetrokken timestamptz,
  bijgewerkt timestamptz not null default now(),
  primary key (bron, referentie),
  check (ingetrokken is null or ingetrokken >= toegekend)
);

create index toegang_user_id on reconstructie.toegang (user_id);

alter table reconstructie.toegang enable row level security;

revoke all on reconstructie.toegang from public, anon, authenticated;
grant select on reconstructie.toegang to authenticated;
grant select, insert, update, delete on reconstructie.toegang to service_role;

create policy toegang_select on reconstructie.toegang for select to authenticated
  using ((select auth.uid()) = user_id);

-- The schema had no usage grant for service_role (the sync migration only needed
-- authenticated). The webhooks of plan step 3 need it.
grant usage on schema reconstructie to service_role;

-- Account deletion removes the entitlement rows too: "Account verwijderen" deletes every
-- Reconstructie row of the caller. The stores keep the order, so a player who deleted
-- their account by mistake can be given a 'handmatig' row again by hand.
create or replace function reconstructie.verwijder_mijn_account()
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

  -- Lock the login first. An insert elsewhere that references it takes a key-share lock on
  -- this row, so between the check below and the delete no other app can add a row that
  -- the cascade would then remove.
  perform 1 from auth.users where id = uid for update;

  delete from reconstructie.puzzels where user_id = uid;
  delete from reconstructie.pad where user_id = uid;
  delete from reconstructie.voorkeuren where user_id = uid;
  delete from reconstructie.toegang where user_id = uid;

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
    -- The checks only see every row when the owner bypasses RLS. If it ever does not
    -- (applied by another role), keep the login rather than guess.
    if not (select rolbypassrls from pg_catalog.pg_roles where rolname = current_user) then
      return false;
    end if;
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

revoke all on function reconstructie.verwijder_mijn_account() from public, anon;
grant execute on function reconstructie.verwijder_mijn_account() to authenticated;
