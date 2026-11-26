-- A read-only role for the nightly ping and backup (specs/paywall-and-android.md, plan
-- step 5, D4 = A). The free claudeDB pauses after seven days without traffic and has no
-- backups; .github/workflows/claudedb.yml connects as this role once a day, runs a query
-- (the ping) and dumps schema reconstructie, encrypted.
--
-- The role is created without login. Guus turns login on with his own password in the SQL
-- editor (supabase/README.md, "Backup"); the password goes only into the GitHub secret
-- CLAUDEDB_BACKUP_URL, never into this repository.
--
-- It reads every row of schema reconstructie and nothing else: no write, no other schema.
-- Instead of BYPASSRLS (which the Supabase owner may not hand out) every table gets a
-- select policy for this role alone, and pg_dump runs with --enable-row-security.

create role reconstructie_backup nologin noinherit;

grant usage on schema reconstructie to reconstructie_backup;
grant select on reconstructie.puzzels, reconstructie.pad, reconstructie.voorkeuren,
  reconstructie.toegang to reconstructie_backup;

create policy puzzels_backup on reconstructie.puzzels for select to reconstructie_backup using (true);
create policy pad_backup on reconstructie.pad for select to reconstructie_backup using (true);
create policy voorkeuren_backup on reconstructie.voorkeuren for select to reconstructie_backup using (true);
create policy toegang_backup on reconstructie.toegang for select to reconstructie_backup using (true);
