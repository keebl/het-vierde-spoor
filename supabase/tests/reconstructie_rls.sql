-- RLS and merge tests for schema reconstructie (specs/accounts-and-sync.md, criteria 11, 12,
-- 14, 15 and 16, plus the merge rules). Run as the project owner (Supabase connector
-- execute_sql or the SQL editor) after the migration.
--
-- Everything happens in one DO block that ALWAYS ends by raising an exception carrying the
-- verdict. That exception rolls back every row and table it made (two test users, a scratch
-- schema), so the shared project is left exactly as it was. Read the result from the error
-- text: "reconstructie_rls: N/N goed" means green; any line with FOUT names the failure.

do $$
declare
  a uuid := '00000000-0000-4000-8000-0000000000aa';
  b uuid := '00000000-0000-4000-8000-0000000000bb';
  uitslag text[] := '{}';
  fouten int := 0;
  n int;
  x boolean;
  t timestamptz;

begin
  insert into auth.users (instance_id, id, aud, role, email)
  values ('00000000-0000-0000-0000-000000000000', a, 'authenticated', 'authenticated', 'rls-proef-a@example.invalid'),
         ('00000000-0000-0000-0000-000000000000', b, 'authenticated', 'authenticated', 'rls-proef-b@example.invalid');

  -- A scratch table elsewhere in the project that references B's login (criterion 12).
  create schema reconstructie_proef;
  create table reconstructie_proef.kladblok (user_id uuid references auth.users (id) on delete cascade);
  insert into reconstructie_proef.kladblok values (b);

  ---------------------------------------------------------------- as user A
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);

  perform reconstructie.bewaar_puzzels('[{"puzzel_id":"p1","opgelost":true,"onthuld":false},{"puzzel_id":"p2","opgelost":false,"onthuld":true}]');
  perform reconstructie.bewaar_pad('[{"stap":3,"sterren":2,"opgelost":true}]');
  perform reconstructie.bewaar_voorkeuren('{"niveau":{"waarde":4,"tijd":"2026-11-18T10:00:00Z"}}');

  -- merge rules
  perform reconstructie.bewaar_puzzels('[{"puzzel_id":"p1","opgelost":false,"onthuld":false},{"puzzel_id":"p2","opgelost":true,"onthuld":false}]');
  select count(*) into n from reconstructie.puzzels where puzzel_id = 'p1' and opgelost and not onthuld;
  uitslag := uitslag || (case when n = 1 then 'ok   ' else 'FOUT ' end || 'merge: opgelost gaat nooit uit');
  fouten := fouten + (n <> 1)::int;
  select count(*) into n from reconstructie.puzzels where puzzel_id = 'p2' and opgelost and onthuld;
  uitslag := uitslag || (case when n = 1 then 'ok   ' else 'FOUT ' end || 'merge: onthuld en opgelost tellen allebei op');
  fouten := fouten + (n <> 1)::int;

  perform reconstructie.bewaar_pad('[{"stap":3,"sterren":1,"opgelost":false}]');
  select sterren into n from reconstructie.pad where stap = 3;
  uitslag := uitslag || (case when n = 2 then 'ok   ' else 'FOUT ' end || 'merge: sterren gaan niet omlaag (criterium 7)');
  fouten := fouten + (n <> 2)::int;
  perform reconstructie.bewaar_pad('[{"stap":3,"sterren":3,"opgelost":true}]');
  select sterren into n from reconstructie.pad where stap = 3;
  uitslag := uitslag || (case when n = 3 then 'ok   ' else 'FOUT ' end || 'merge: 2 en 3 sterren = 3 (criterium 7)');
  fouten := fouten + (n <> 3)::int;

  perform reconstructie.bewaar_voorkeuren('{"niveau":{"waarde":2,"tijd":"2026-11-17T10:00:00Z"}}');
  select niveau into n from reconstructie.voorkeuren;
  uitslag := uitslag || (case when n = 4 then 'ok   ' else 'FOUT ' end || 'merge: een ouder niveau verliest (criterium 9)');
  fouten := fouten + (n <> 4)::int;
  perform reconstructie.bewaar_voorkeuren('{"kruisjes":{"waarde":false,"tijd":"2099-01-01T00:00:00Z"}}');
  select kruisjes_tijd into t from reconstructie.voorkeuren;
  uitslag := uitslag || (case when t <= now() + interval '1 minute' then 'ok   ' else 'FOUT ' end || 'merge: een tijd ver vooruit wordt de servertijd');
  fouten := fouten + (not (t <= now() + interval '1 minute'))::int;

  -- criterion 16: wrong shapes are refused
  begin
    perform reconstructie.bewaar_voorkeuren('{"niveau":{"waarde":9,"tijd":"2026-11-19T10:00:00Z"}}');
    uitslag := uitslag || text 'FOUT criterium 16: niveau 9 werd aangenomen'; fouten := fouten + 1;
  exception when others then uitslag := uitslag || text 'ok   criterium 16: niveau 9 geweigerd'::text;
  end;
  begin
    perform reconstructie.bewaar_voorkeuren('{"niveau":{"waarde":"vier","tijd":"2026-11-19T10:00:00Z"}}');
    uitslag := uitslag || text 'FOUT criterium 16: niveau als tekst werd aangenomen'; fouten := fouten + 1;
  exception when others then uitslag := uitslag || text 'ok   criterium 16: niveau als tekst geweigerd'::text;
  end;
  begin
    perform reconstructie.bewaar_voorkeuren('{"panelen":{"waarde":{"geheim":true},"tijd":"2026-11-19T10:00:00Z"}}');
    uitslag := uitslag || text 'FOUT criterium 16: onbekend paneel werd aangenomen'; fouten := fouten + 1;
  exception when others then uitslag := uitslag || text 'ok   criterium 16: onbekend paneel geweigerd'::text;
  end;
  begin
    perform reconstructie.bewaar_voorkeuren('{"panelen":{"waarde":{"legenda":"ja"},"tijd":"2026-11-19T10:00:00Z"}}');
    uitslag := uitslag || text 'FOUT criterium 16: paneel met tekst werd aangenomen'; fouten := fouten + 1;
  exception when others then uitslag := uitslag || text 'ok   criterium 16: paneel met tekst geweigerd'::text;
  end;
  begin
    perform reconstructie.bewaar_puzzels(jsonb_build_array(jsonb_build_object('puzzel_id', repeat('x', 201), 'opgelost', true, 'onthuld', false)));
    uitslag := uitslag || text 'FOUT criterium 16: id van 201 tekens werd aangenomen'; fouten := fouten + 1;
  exception when others then uitslag := uitslag || text 'ok   criterium 16: id van 201 tekens geweigerd'::text;
  end;
  begin
    perform reconstructie.bewaar_pad('[{"stap":1,"sterren":4,"opgelost":true}]');
    uitslag := uitslag || text 'FOUT criterium 16: 4 sterren werd aangenomen'; fouten := fouten + 1;
  exception when others then uitslag := uitslag || text 'ok   criterium 16: 4 sterren geweigerd'::text;
  end;
  perform reconstructie.bewaar_puzzels((select jsonb_agg(jsonb_build_object('puzzel_id', 'vol' || i, 'opgelost', true, 'onthuld', false)) from generate_series(1, 1998) i));
  select count(*) into n from reconstructie.puzzels;
  uitslag := uitslag || (case when n = 2000 then 'ok   ' else 'FOUT ' end || 'precies 2.000 puzzels past (' || n || ')');
  fouten := fouten + (n <> 2000)::int;
  begin
    perform reconstructie.bewaar_puzzels('[{"puzzel_id":"een-te-veel","opgelost":true,"onthuld":false}]');
    uitslag := uitslag || text 'FOUT criterium 16: puzzel 2.001 werd aangenomen'; fouten := fouten + 1;
  exception when others then uitslag := uitslag || text 'ok   criterium 16: puzzel 2.001 geweigerd'::text;
  end;
  begin
    perform reconstructie.bewaar_puzzels('[{"puzzel_id":"vol5","opgelost":false,"onthuld":true}]');
    uitslag := uitslag || text 'ok   bij 2.000 mag een bestaande puzzel nog bijgewerkt worden'::text;
  exception when others then uitslag := uitslag || text 'FOUT bij 2.000 werd een bestaande puzzel geweigerd'::text; fouten := fouten + 1;
  end;

  ---------------------------------------------------------------- as user B
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  perform reconstructie.bewaar_puzzels('[{"puzzel_id":"p1","opgelost":false,"onthuld":true}]');

  -- criterion 14: B cannot see, add, change or delete A's rows
  select count(*) into n from reconstructie.puzzels where user_id = a;
  uitslag := uitslag || (case when n = 0 then 'ok   ' else 'FOUT ' end || 'criterium 14: B ziet geen rijen van A');
  fouten := fouten + (n <> 0)::int;
  select count(*) into n from reconstructie.puzzels;
  uitslag := uitslag || (case when n = 1 then 'ok   ' else 'FOUT ' end || 'criterium 14: B ziet alleen zijn eigen rij');
  fouten := fouten + (n <> 1)::int;
  begin
    insert into reconstructie.puzzels (user_id, puzzel_id, opgelost) values (a, 'ingebroken', true);
    uitslag := uitslag || text 'FOUT criterium 14: B kon een rij voor A maken'; fouten := fouten + 1;
  exception when others then uitslag := uitslag || text 'ok   criterium 14: B kan geen rij voor A maken'::text;
  end;
  update reconstructie.puzzels set onthuld = false where user_id = a;
  get diagnostics n = row_count;
  uitslag := uitslag || (case when n = 0 then 'ok   ' else 'FOUT ' end || 'criterium 14: B verandert niets bij A');
  fouten := fouten + (n <> 0)::int;
  delete from reconstructie.pad where user_id = a;
  get diagnostics n = row_count;
  uitslag := uitslag || (case when n = 0 then 'ok   ' else 'FOUT ' end || 'criterium 14: B verwijdert niets bij A');
  fouten := fouten + (n <> 0)::int;
  begin
    update reconstructie.puzzels set user_id = a where user_id = b;
    get diagnostics n = row_count;
    uitslag := uitslag || (case when n = 0 then 'ok   ' else 'FOUT ' end || 'criterium 14: B kan een rij niet aan A geven');
    fouten := fouten + (n <> 0)::int;
  exception when others then uitslag := uitslag || text 'ok   criterium 14: B kan een rij niet aan A geven'::text;
  end;

  ---------------------------------------------------------------- as anon
  perform set_config('role', 'anon', true);
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  begin
    select count(*) into n from reconstructie.puzzels;
    uitslag := uitslag || text 'FOUT criterium 15: anon kon puzzels lezen'; fouten := fouten + 1;
  exception when others then uitslag := uitslag || text 'ok   criterium 15: anon leest niets'::text;
  end;
  begin
    perform reconstructie.bewaar_puzzels('[{"puzzel_id":"anon","opgelost":true,"onthuld":false}]');
    uitslag := uitslag || text 'FOUT criterium 15: anon kon bewaar_puzzels aanroepen'; fouten := fouten + 1;
  exception when others then uitslag := uitslag || text 'ok   criterium 15: anon kan bewaar_puzzels niet aanroepen'::text;
  end;
  begin
    perform reconstructie.verwijder_mijn_account();
    uitslag := uitslag || text 'FOUT criterium 15: anon kon verwijder_mijn_account aanroepen'; fouten := fouten + 1;
  exception when others then uitslag := uitslag || text 'ok   criterium 15: anon kan verwijder_mijn_account niet aanroepen'::text;
  end;

  ---------------------------------------------------------- deletion as A, B
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  x := reconstructie.verwijder_mijn_account();
  perform set_config('role', 'none', true);
  select count(*) into n from reconstructie.puzzels where user_id = a;
  n := n + (select count(*) from reconstructie.pad where user_id = a) + (select count(*) from reconstructie.voorkeuren where user_id = a);
  uitslag := uitslag || (case when n = 0 then 'ok   ' else 'FOUT ' end || 'criterium 11: alle rijen van A zijn weg');
  fouten := fouten + (n <> 0)::int;
  uitslag := uitslag || (case when x and not exists (select 1 from auth.users where id = a) then 'ok   ' else 'FOUT ' end || 'criterium 12: A had elders niets, dus de login is weg');
  fouten := fouten + (not (x and not exists (select 1 from auth.users where id = a)))::int;
  select count(*) into n from reconstructie.puzzels where user_id = b;
  uitslag := uitslag || (case when n = 1 then 'ok   ' else 'FOUT ' end || 'criterium 11: de rijen van B staan er nog');
  fouten := fouten + (n <> 1)::int;

  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  x := reconstructie.verwijder_mijn_account();
  perform set_config('role', 'none', true);
  select count(*) into n from reconstructie.puzzels where user_id = b;
  uitslag := uitslag || (case when n = 0 and not x then 'ok   ' else 'FOUT ' end || 'criterium 12: B had elders een rij: Reconstructie-rijen weg');
  fouten := fouten + (not (n = 0 and not x))::int;
  uitslag := uitslag || (case when exists (select 1 from auth.users where id = b) and exists (select 1 from reconstructie_proef.kladblok where user_id = b) then 'ok   ' else 'FOUT ' end || 'criterium 12: de login en de rij elders van B blijven');
  fouten := fouten + (not (exists (select 1 from auth.users where id = b) and exists (select 1 from reconstructie_proef.kladblok where user_id = b)))::int;

  raise exception E'reconstructie_rls: %/% goed\n%',
    cardinality(uitslag) - fouten, cardinality(uitslag), array_to_string(uitslag, E'\n');
end;
$$;
