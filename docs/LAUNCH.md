# Launch checklist — WordPress → static site migration

**Date target:** \_\_\_\_\_\_\_\_
**Old site:** WordPress at `hunyamunyarecords.com`, cPanel-hosted on NetActuate
**New site:** Static Next.js export, built from `site/out/` in this repo
**Domain:** stays the same. DNS does not change.
**Email:** stays the same. `contact@hunyamunyarecords.com` on Google Workspace, independent of hosting.
**Database:** not needed by the new site. WordPress's MySQL becomes read-only archive.

Keep this file open in another tab during the migration.

---

## Phase 0 — Before you touch anything (5 minutes)

- [ ] Read this whole doc once top to bottom before starting.
- [ ] Confirm you can log into cPanel at the hosting provider's URL.
- [ ] Confirm you can see `public_html/` in cPanel File Manager and it contains the current WordPress install (`wp-admin`, `wp-content`, `wp-config.php`, etc.).
- [ ] Confirm you have the pre-built zip ready locally at `C:\projects\hunyamunya\hunyamunya-static-<DATE>.zip` (the migration upload file, 101 MB).

---

## Phase 1 — Full backup (20 minutes, DO NOT SKIP)

**Files.** In cPanel → File Manager:

1. Navigate to the folder one level up from `public_html/`.
2. Right-click `public_html/` → **Compress** → ZIP.
3. Name it `public_html-wordpress-backup-<DATE>.zip`.
4. Right-click the zip → **Download**. Save to your machine and to a cloud backup (Dropbox, Drive, wherever).

**Database.** In cPanel → phpMyAdmin:

1. Click the WordPress database in the left sidebar (usually something like `userxxx_wp` or `hmwp`).
2. Top menu → **Export** → Quick → SQL → **Go**.
3. Save the `.sql` file locally and to cloud backup.

**Do not delete either backup for at least 30 days.** If you need to recover a news post, a comment thread, a plugin config, or any image that didn't make it into the Next.js build, having the live WordPress database to query is a lifesaver. Files alone do not contain the database.

---

## Phase 2 — Local verify (10 minutes)

Before uploading anything, confirm the new site works on your machine.

In a PowerShell window:

```powershell
cd C:\projects\hunyamunya\site
npm run build
npx --yes serve@latest out -p 4000
```

Open `http://localhost:4000` in your browser. Click through every section. Keep DevTools console open (F12 → Console tab) — watch for red errors.

**Test at minimum:**

- [ ] `/` home loads, hero image shows, NCO card shows
- [ ] `/catalog` lists releases, click into `/catalog/hmr010-nco` → release page renders
- [ ] `/catalog/hmb002b-the-orange-album` renders (note the lowercase `b` — if this 404s, we have a catalog-number issue)
- [ ] `/artists` lists artists, click into `/artists/rykard` → highlights pill shows at top
- [ ] `/artists/sonic-union` renders with his bio
- [ ] `/news` loads, no broken images
- [ ] `/press` shows 10 radio stations, DJ Support (Digweed + Sasha), Pandora listener count
- [ ] `/about` closing paragraph reads "...don't define the label by one genre. If it's good, we'll release it."
- [ ] `/contact` shows `contact[at]hunyamunyarecords[dot]com`, clicking it opens mail client
- [ ] `/discography` renders
- [ ] Any random URL like `/not-a-real-page` hits the custom 404 page

If anything looks broken, fix it here and re-run `npm run build`. Rollback is free at this stage.

When everything looks good, stop the local preview (Ctrl+C in the terminal).

---

## Phase 3 — The upload (15 minutes)

You have two options for this step. Pick ONE.

### Option A — cPanel File Manager (easiest, recommended for first launch)

1. cPanel → File Manager → `public_html/`.
2. Select all files and folders inside `public_html/`. Right-click → **Compress** → make ONE MORE backup zip inside cPanel: `public_html-live-backup-<DATE>.zip`. (You already have a downloaded backup; this one stays on the server as a quick-rollback button.)
3. Move the zip you just made OUT of `public_html/` and into the parent folder (so it won't get deleted in the next step).
4. Back in `public_html/`: select everything → **Delete**. Empty `public_html/` now.
5. Click **Upload** in File Manager's toolbar. Upload `C:\projects\hunyamunya\hunyamunya-static-<DATE>.zip` (101 MB — give it a minute on slower uploads).
6. After upload completes, right-click the zip in File Manager → **Extract** → extract to `public_html/`.
7. Delete the zip from `public_html/` once extraction is done.
8. **Verify `.htaccess` is present**: in File Manager's top-right → **Settings** → check "Show Hidden Files (dotfiles)" → OK. You should see `.htaccess` in the `public_html/` file list. If it's missing, upload `site/public/.htaccess` manually.

`public_html/` should now contain: `index.html`, `404.html`, `about.html`, `contact.html`, `catalog/`, `artists/`, `news/`, `press/`, `_next/`, `media/`, `logo.gif`, `.htaccess`, and more.

### Option B — SFTP (faster if you're comfortable with FileZilla/Cyberduck)

1. Connect via SFTP using your cPanel SSH/FTP credentials (cPanel → SSH Access or FTP Accounts).
2. Navigate to `/home/<youruser>/public_html/`.
3. Rename the existing `public_html/` to `public_html-wordpress-backup-<DATE>/` (so nothing collides).
4. Create a fresh empty `public_html/`.
5. In your local machine, navigate into `C:\projects\hunyamunya\site\out\`.
6. Drag the CONTENTS of `out/` (not the folder itself) into the remote `public_html/`. SFTP will preserve `.htaccess` automatically.

---

## Phase 4 — Verify live (10 minutes)

Open an **incognito window** (so browser cache doesn't lie to you).

- [ ] `https://www.hunyamunyarecords.com/` — new home page loads
- [ ] `https://www.hunyamunyarecords.com/catalog` — new catalog listing
- [ ] `https://www.hunyamunyarecords.com/catalog/hmr010-nco` — release page
- [ ] `https://www.hunyamunyarecords.com/artists/rykard` — artist page with masthead
- [ ] `https://www.hunyamunyarecords.com/press` — press page with 10 stations
- [ ] `https://www.hunyamunyarecords.com/contact` — obfuscated email displays

**Then test that redirects work** (these hit the `.htaccess` rules):

- [ ] `https://www.hunyamunyarecords.com/?page_id=14` should 301 to `/catalog`
- [ ] `https://www.hunyamunyarecords.com/?page_id=247` should 301 to `/press`
- [ ] `https://www.hunyamunyarecords.com/releases/` should 301 to `/catalog`
- [ ] `https://www.hunyamunyarecords.com/shop/` should 301 to `/catalog`
- [ ] `https://www.hunyamunyarecords.com/catalog/hmb002-the-orange-album` should 301 to `/catalog/hmb002b-the-orange-album`

If any of those 404 instead of redirecting, `.htaccess` is missing or wasn't extracted. Re-check Phase 3 step 8.

**Test email:** from a different email address, send a test message to `contact@hunyamunyarecords.com`. Confirm it lands in the Google Workspace inbox. Email is independent of the website swap, but verify anyway.

---

## Phase 5 — Rollback plan (ONLY if something is broken)

Keep this open during the migration. If anything looks badly wrong after upload, execute this, DO NOT try to debug live.

### Rollback via cPanel File Manager

1. cPanel → File Manager → `public_html/`.
2. Select everything inside `public_html/` → **Delete**.
3. Locate the `public_html-wordpress-backup-<DATE>.zip` you moved OUT of `public_html/` in Phase 3 step 3.
4. Right-click that zip → **Extract** → extract into `public_html/`.
5. Visit `https://www.hunyamunyarecords.com/` in incognito. WordPress should be live again within 60 seconds.

### Rollback via SFTP (Option B above)

1. Delete everything inside the current `public_html/`.
2. Rename the `public_html-wordpress-backup-<DATE>/` folder you created in Phase 3 step 3 back to `public_html/`.
3. WordPress is live again.

The WordPress MySQL database was never touched, so no DB restore is needed on rollback.

---

## Phase 6 — Turn on automatic deploy from GitHub (one-time, 10 minutes)

**Why:** After the manual zip upload tonight, every future change should ship by merging a PR. No more cPanel clicking, no more File Manager zip uploads. The workflow in `.github/workflows/deploy.yml` builds the site on every push to `main` and syncs `site/out/` to `/public_html/` over FTPS. You only need to configure three secrets once.

### Step 1 — Create a dedicated FTP account in cPanel

Recommended over reusing your main cPanel login, so the credential can be rotated independently.

1. cPanel → **FTP Accounts**.
2. Log In: `deploy` (final username will be `deploy@hunyamunyarecords.com`).
3. Password: generate a strong one and copy it to a safe place. You'll paste it into GitHub in a moment.
4. Directory: `/home/hmrecords/public_html` (remove the `/deploy` suffix cPanel auto-appends, so the FTP root lands exactly on the web-served directory).
5. Quota: Unlimited.
6. Click **Create FTP Account**.
7. On the FTP Accounts screen, click **Configure FTP Client** next to the new `deploy@...` account. Note the **FTP Server** value (something like `hunyamunyarecords.com` or `server.netactuate.com`). You'll need it.

### Step 2 — Add the three secrets to GitHub

1. Go to `https://github.com/evanatpizzarobot/hunyamunya/settings/secrets/actions`.
2. Click **New repository secret** three times, creating:
   - `FTP_HOST` → the FTP Server hostname from Configure FTP Client.
   - `FTP_USER` → `deploy@hunyamunyarecords.com` (the full form cPanel shows you).
   - `FTP_PASSWORD` → the password you generated in Step 1.
3. Done. Secrets are encrypted and never visible again once saved.

### Step 3 — Fire a test run

1. Go to `https://github.com/evanatpizzarobot/hunyamunya/actions`.
2. Click **Build & deploy to hunyamunyarecords.com** on the left.
3. Click **Run workflow** → branch `main` → **Run workflow**.
4. Wait ~3 minutes. The first run uploads everything (~100 MB), so it's slow. Subsequent runs are incremental and take seconds.
5. When the run turns green, open `https://www.hunyamunyarecords.com/` and confirm the live site.

### Ongoing workflow after this is wired up

- Merge a PR on GitHub → `main` gets new commits → Actions runs → files land on the server. No other action required.
- Manual re-deploy (without any code change) → GitHub → Actions → pick the workflow → **Run workflow**.

### Troubleshooting

- **Run fails on "Sync to hunyamunyarecords.com over FTPS"** with a connection or auth error: the host, username, or password secret is wrong. Re-check **Configure FTP Client** in cPanel FTP Accounts and overwrite the secret in GitHub Settings. Secrets can be updated, not just created.
- **Run succeeds but the site doesn't update**: confirm the FTP account's **Directory** is exactly `/home/hmrecords/public_html` (no deploy subfolder). If it's wrong, the uploaded files are landing in a jailed subfolder the web server doesn't serve.
- **`.htaccess` missing after a deploy**: the workflow already stages `site/public/.htaccess` into `site/out/.htaccess` before upload. If this ever breaks, check the "Stage .htaccess into build output" step of the run log.
- **Smoke test failed after a successful upload**: the workflow pulls `/BUILD_ID.txt` and checks it matches the deploying commit SHA, then hits `/`, `/catalog`, `/artists/rykard`, `/news`, and the referenced stylesheet. Any non-2xx (except 301 redirects) fails the run. Click into the failing run to see the exact URL and status code.
- **403 on `/_next/*` or subfolders after a deploy** (the failure mode we hit on the first FTPS deploy): cPanel FTP sub-accounts upload with restrictive default perms (0600/0700) that Apache can't traverse. The workflow runs `chmod -R 0755 /` after mirror to fix this, and the smoke test catches any case where that silently fails. Manual recovery if ever needed:

  1. File Manager → `public_html/` → **+ File** → create `fix-perms.php` with this content (update the `$root` line to match your cPanel user, e.g. `hmrecords` not `hmrecord`):
     ```php
     <?php
     $root = '/home/hmrecords/public_html';
     $d = 0; $f = 0;
     @chmod($root, 0755);
     $it = new RecursiveIteratorIterator(
         new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS),
         RecursiveIteratorIterator::SELF_FIRST
     );
     foreach ($it as $p) {
         if (is_dir($p)) { @chmod($p, 0755); $d++; }
         else { @chmod($p, 0644); $f++; }
     }
     echo "dirs: $d, files: $f — done";
     ```
  2. Visit `https://www.hunyamunyarecords.com/fix-perms.php` in a browser. Should print `dirs: N, files: M — done`.
  3. File Manager → right-click `fix-perms.php` → **Delete** (don't leave it on the server).
  4. Hard-refresh the site.
- **Never edit `public_html/` files directly in cPanel File Manager again** (except for emergency restore from a backup zip or the chmod recovery above). The FTPS mirror reconciles against the local build; hand-edits may be silently overwritten on the next deploy.

---

## Phase 7 — Launch housekeeping (first week)

- [ ] Monitor Gmail for any bounced emails or delivery issues on `contact@hunyamunyarecords.com`.
- [ ] Check Google Search Console for 404 spikes on old WP URLs. If you see any that aren't covered by the `.htaccess` redirects, add them to `site/scripts/redirects-build.ts` and re-deploy.
- [ ] Verify `https://www.hunyamunyarecords.com/sitemap.xml` loads (Google re-crawl hint).
- [ ] Set a reminder for 30 days out to review the WordPress backup zip and MySQL dump. If nothing has needed recovery by then, you can delete them. Not before.
- [ ] Do not delete the `public_html-wordpress-backup-<DATE>/` folder (Option B) or the `public_html-wordpress-backup-<DATE>.zip` (Option A) on the server for at least 2 weeks after launch.

---

## Quick references

**Repo root:** `C:\projects\hunyamunya`
**Build command:** `cd site && npm run build`
**Local preview:** `cd site && npx --yes serve@latest out -p 4000` → `http://localhost:4000`
**Upload zip (regenerated on each build):** `C:\projects\hunyamunya\hunyamunya-static-<DATE>.zip`
**Redirect source:** `site/scripts/redirects-build.ts` → regenerates `site/public/.htaccess` via `npm run build:redirects`
**GitHub repo:** `https://github.com/evanatpizzarobot/hunyamunya`
**Auto-deploy workflow:** `.github/workflows/deploy.yml` (FTPS sync to `/public_html/` on push to `main`)
**Contact email** (Google Workspace): `contact@hunyamunyarecords.com`

---

## If something goes wrong, ask me these questions

Before panicking:

1. What page shows the problem? (URL)
2. What does it look like? (screenshot or text description)
3. What does the DevTools console say? (F12 → Console)
4. What does the DevTools Network tab say? (F12 → Network → reload page → look for red/404 entries)

With those four pieces I can diagnose most issues remotely. Most launch-day issues are `.htaccess` not being copied, or one specific page's image path being wrong. Both are easy to fix once identified.
