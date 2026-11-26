# Backup setup: step by step

Sets up the nightly ping and encrypted backup of schema `reconstructie` in `claudeDB`
(`.github/workflows/claudedb.yml`, background in `supabase/README.md`, "Backup and ping").
Asked as ask-e3a5c7d8. About 20 minutes for Guus.

Three things are needed, and each touches a secret, so Guus does them in his own Terminal
and browser; Claude does everything around them:

1. an **age key pair**: the public half goes into the repository, the private half into
   Bitwarden only;
2. a **password for the database role** `reconstructie_backup`;
3. the **GitHub secret** `CLAUDEDB_BACKUP_URL`, the connection string with that password.

No secret value ever goes into chat, into this repository, or into a file Claude reads.
Every command below works from any folder; run them in **one** Terminal window, top to
bottom (macOS Terminal or the Terminal panel of the Claude app).

## Who does what

| Step | Who | What |
|---|---|---|
| 0 | Claude | Applies migration `20261125130000_reconstructie_backup_rol.sql` (creates the role), confirms the pooler host and the SQL editor's labels |
| 1 | Guus | Key pair (Terminal + Bitwarden) |
| 2 | Guus | Password and GitHub secret (one Terminal command) |
| 3 | Guus | Give the role its password (Supabase SQL editor) |
| 4 | Claude | Commits the public key, runs the workflow, checks the backup |
| 5 | Guus | Test-decrypts the backup, then deletes the key file (one command) |

## Step 0 — Claude, before Guus starts
- Applies `supabase/migrations/20261125130000_reconstructie_backup_rol.sql` with the
  Supabase connector (needs the connector on in Claude's session). Without it step 3 fails
  with `role "reconstructie_backup" does not exist`.
- Reads the **session pooler host** from the Connect dialog of `claudeDB` (Supabase's docs:
  the host cannot be derived from the region, so it is copied, not guessed) and writes it
  into the command of step 2 below. Until then that command says `POOLER-HOST` and must not
  be run.
- Checks the labels of the SQL editor with a harmless `select 1`.

## Step 1 — Key pair (Guus, Terminal and Bitwarden, about 8 minutes)

**1a. Install age.**
```bash
brew install age && age --version
```
- Success: the last line is a version such as `v1.2.1`.
- Something else: `command not found: brew` means Homebrew is missing; tell Claude. Any other
  error: copy the last lines into chat (they contain nothing secret).

**1b. Make the key pair.** It refuses to overwrite a key that already exists.
```bash
test -e ~/reconstructie-backup.key && echo "STOP: ~/reconstructie-backup.key already exists" || age-keygen -o ~/reconstructie-backup.key
```
- Success: one line `Public key: age1…` (a long string). The private key is now in the file
  `~/reconstructie-backup.key`; do not open or paste it anywhere.
- `STOP: … already exists`: an earlier attempt left a key. Tell Claude; do not delete it
  before checking whether it is the one in Bitwarden.

**1c. Put the public key in the repository** (public by design; Claude commits it in step 4).
```bash
age-keygen -y ~/reconstructie-backup.key > ~/Claude/Projects/reconstructie/supabase/backup-ontvanger.txt && cat ~/Claude/Projects/reconstructie/supabase/backup-ontvanger.txt
```
- Success: one line starting with `age1`, the same string as in 1b.
- `No such file or directory`: the project folder is elsewhere; tell Claude.

**1d. Copy the private key to the clipboard** (only the key line, nothing printed).
```bash
grep AGE-SECRET-KEY ~/reconstructie-backup.key | tr -d '\n' | pbcopy && echo "Copied to the clipboard"
```
- Success: `Copied to the clipboard`.

**1e. Store it in Bitwarden Secrets Manager.**
1. Open https://vault.bitwarden.eu/ and sign in.
2. In the product switcher of the navigation menu, choose **Secrets Manager**.
3. Use the **New** dropdown and select **Secret**.
4. **Name**: `reconstructie.BACKUP_AGE_KEY`. **Value**: click in it and press ⌘V.
   **Notes** (optional): `age private key for the claudeDB backup (docs/backup-setup.md)`.
5. Under **Project**, pick `dev`. Leave **People** and **Machine accounts** as they are:
   no machine account needs this key.
6. Select **Save**.
- Success: `reconstructie.BACKUP_AGE_KEY` is in the list of secrets.
- Something else (no Secrets Manager in the switcher, no `dev` project): stop and tell Claude
  what you see. The key file stays until step 5, so nothing is lost.

## Step 2 — Password and GitHub secret (Guus, Terminal, 1 minute)

One command: it makes a random password (64 hex characters, so nothing needs escaping in a
URL), stores the connection string as the GitHub secret, and puts the SQL for step 3 on the
clipboard. The password is never shown and is forgotten when the command ends; it is not
kept anywhere else, and if it is ever lost, step 2 and 3 are simply run again.

```bash
PW=$(openssl rand -hex 32) && printf 'postgresql://reconstructie_backup.kteiwsvhynuktjarhksm:%s@POOLER-HOST:5432/postgres' "$PW" | gh secret set CLAUDEDB_BACKUP_URL --repo keebl/het-vierde-spoor && printf "alter role reconstructie_backup with login password '%s';" "$PW" | pbcopy && unset PW && echo "OK: secret set, SQL on the clipboard"
```
- Success: `✓ Set Actions secret CLAUDEDB_BACKUP_URL for keebl/het-vierde-spoor`, then
  `OK: secret set, SQL on the clipboard`. Go straight on to step 3 (the clipboard holds the
  password until then).
- `gh: To get started with GitHub CLI, please run: gh auth login`: run `gh auth login`, choose
  GitHub.com and the browser, then run the command again.
- The command still contains `POOLER-HOST`: do not run it; Claude has not finished step 0.

## Step 3 — Give the role its password (Guus, browser, 2 minutes)
1. Open https://supabase.com/dashboard/project/kteiwsvhynuktjarhksm/sql/new (signed in to
   Supabase).
2. Click in the empty editor and press ⌘V. You see one line
   `alter role reconstructie_backup with login password '…';`.
3. Click **Run** (or ⌘↵).
- Success: the result pane says `Success. No rows returned`.
- `role "reconstructie_backup" does not exist`: step 0 is not done; tell Claude.
- A warning about a destructive query: there is none for this statement; if one appears,
  cancel and tell Claude what it says.

Then remove the password from the clipboard and from Supabase:
```bash
pbcopy < /dev/null && echo "Clipboard cleared"
```
The SQL editor keeps every query as a snippet in the left column under **PRIVATE**. Delete
this one: hover over it, open its **…** menu, choose **Delete query** and confirm.
- Success: the snippet is gone from the list.

Tell Claude "step 3 done".

## Step 4 — Claude
- Commits `supabase/backup-ontvanger.txt` (the public key).
- Runs the workflow (`gh workflow run claudedb.yml`) and checks that it ends green, that the
  ping ran, and that an artifact `reconstructie-<run id>` of more than 1 KB is attached.
- If it fails: `Tenant or user not found` means a wrong host or user name (Claude fixes the
  command and Guus reruns step 2); `password authentication failed` means steps 2 and 3 used
  different passwords (rerun step 2, then step 3).
- Fills in `<RUN-ID>` in step 5 below.

## Step 5 — Test the backup, then delete the key file (Guus, Terminal, 2 minutes)

**5a. Decrypt the first backup** (only its first lines are shown; nothing decrypted is
written to disk).
```bash
rm -rf ~/Downloads/reconstructie-backup-test && gh run download <RUN-ID> --repo keebl/het-vierde-spoor -n reconstructie-<RUN-ID> -D ~/Downloads/reconstructie-backup-test && age -d -i ~/reconstructie-backup.key ~/Downloads/reconstructie-backup-test/reconstructie.sql.age | head -5
```
- Success: lines with `-- PostgreSQL database dump`.
- `no valid identities` or `no identity matched`: the public key in the repository is not this
  key's; tell Claude.

**5b. Check the Bitwarden copy, then delete the file.** In Bitwarden, open
`reconstructie.BACKUP_AGE_KEY` (click its name), select the whole **Value** and press ⌘C.
Then:
```bash
[ "$(pbpaste)" = "$(grep AGE-SECRET-KEY ~/reconstructie-backup.key)" ] && rm ~/reconstructie-backup.key && pbcopy < /dev/null && rm -rf ~/Downloads/reconstructie-backup-test && echo "Bitwarden copy matches; key file deleted" || echo "NOT the same: key file kept"
```
- Success: `Bitwarden copy matches; key file deleted`. From now on only Bitwarden holds the
  key.
- `NOT the same: key file kept`: the Value in Bitwarden differs (often a missing character
  at the start or end). Paste the key again (1d, then edit the secret's Value and **Save**)
  and rerun 5b.

## Afterwards
The workflow runs every night at 03:41 UTC. Restoring is in `supabase/README.md`, "Backup and
ping": take the key from Bitwarden into a file, `age -d -i <file> reconstructie.sql.age`.
