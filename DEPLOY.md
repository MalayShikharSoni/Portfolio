# Deploying the portfolio

From this repo to a live site on your own `.dev` domain: Vercel's free Hobby plan for
hosting, and the free domain from the GitHub Student Developer Pack's Name.com offer.
Allow about an hour, most of it waiting for DNS.

The site is fully static (Astro static output). There's no server, no database and no
environment variables you must set.

---

## 1. Claim the free `.dev` domain

1. Open **[education.github.com/pack](https://education.github.com/pack)**, signed in with
   the GitHub account that has student benefits.
2. Find the **Name.com** offer (one free domain for the first year, `.dev` included) and
   follow its link to Name.com's GitHub Students page.
3. Search for **`malayshikharsoni.dev`** and register it at $0. Create a Name.com account when
   asked, with a username and password you save somewhere safe, and a unique address (the
   offer treats repeated addresses as duplicates). Name.com may ask for a card even though
   the first year costs nothing.
4. **Turn off auto-renew straight away.** Only the first year is free; with auto-renew on, the
   card on file is charged the full renewal price. In Name.com: **My Domains** → your domain →
   switch **Auto Renew** off, or note the renewal date in your calendar.

`.dev` is HTTPS-only (it's on browsers' HSTS preload list). Vercel serves HTTPS automatically,
so nothing extra is needed; the site just won't load over plain `http://` before Vercel has
issued its certificate.

## 2. Push the repo to GitHub

The repo is already at <https://github.com/MalayShikharSoni/Portfolio>. Push your latest
changes to `main`:

```sh
git push origin main
```

The **CI** workflow runs on every push and pull request (type-check, lint, format check,
build, CSP check). A green tick on the commit means it's safe to deploy.

## 3. Import the project into Vercel

1. Sign in at **[vercel.com](https://vercel.com/)** with your GitHub account (Hobby plan).
2. **Add New…** → **Project** → pick **MalayShikharSoni/Portfolio** → **Import**.
3. Vercel detects the **Astro** framework preset. Leave the defaults (they match
   `vercel.json`): build command `npm run build`, output directory `dist`.
4. Open **Settings → Build and Deployment → Node.js Version** and choose **24.x**
   (Astro 7 needs Node 22.23.4 or newer).
5. Optional, but it makes the GitHub repo count on the contact section reliable: under
   **Settings → Environment Variables**, add `GITHUB_TOKEN` with a
   [fine-grained personal access token](https://github.com/settings/personal-access-tokens)
   that has **no permissions** (public read is all it needs). Without it the build still
   works; the repo count is simply left out if GitHub rate-limits the request.
6. **Deploy.** In about a minute you get a `*.vercel.app` URL. Open it and check the home
   page, a case study and `/resume.pdf`.

## 4. Point the domain at Vercel

1. In Vercel, open the project's domain settings: **Settings → Domains** (in some dashboard
   layouts it sits under **Settings → Networking**), or go to
   `https://vercel.com/<team>/portfolio/settings/domains`.
2. **Add Domain** → **`malayshikharsoni.dev`**. Accept the suggestion to add
   **`www.malayshikharsoni.dev`** too, with `www` redirecting to the main domain.
3. Connect the domain to Vercel in one of two ways:

   **Option A (simplest): use Vercel's nameservers.** Vercel then runs DNS for the domain and
   configures everything itself.

   - In Vercel's domain settings, open the domain and choose the **Nameservers** method. Note
     the two nameservers shown (usually `ns1.vercel-dns.com` and `ns2.vercel-dns.com`).
   - In Name.com: **My Domains** → your domain → **Manage Nameservers** → remove the existing
     ones → add Vercel's two → **Save**.

   **Option B: keep Name.com's DNS and add records.**

   - In Name.com: **My Domains** → your domain → **Manage DNS Records**. Delete any default
     records for the root (blank host) and `www`.
   - Add **exactly the records Vercel shows you**. Typically:

     | Type    | Host            | Answer                                    |
     | ------- | --------------- | ----------------------------------------- |
     | `A`     | _(leave blank)_ | the IP address Vercel shows               |
     | `CNAME` | `www`           | the `…vercel-dns.com` target Vercel shows |

     Copy the values from Vercel rather than from this table; they can differ per project.

4. Back in Vercel's domain settings, make sure **`malayshikharsoni.dev`** is the primary
   domain and **`www`** redirects to it (308).

## 5. Wait for DNS and HTTPS, then verify

DNS usually updates within 30 minutes and can take up to 48 hours. Vercel issues the
HTTPS certificate automatically once the records resolve; the Domains page turns green.

Then check:

- [ ] `https://malayshikharsoni.dev` loads, with a padlock
- [ ] `http://…` and `https://www.…` both end up at `https://malayshikharsoni.dev/`
- [ ] a case study, the 404 page (`/anything`) and `/resume.pdf` work
- [ ] sharing the link (e.g. paste it into [opengraph.xyz](https://www.opengraph.xyz/)) shows
      the poster preview image
- [ ] `https://malayshikharsoni.dev/sitemap-index.xml` and `/robots.txt` load

## 6. Weekly rebuild (keeps the live stats fresh)

The build fetches a few numbers (the GitHub repo count, and LeetCode figures if you turn
that on in `src/data/site.ts`). A GitHub Action rebuilds the site every Monday so they stay
current.

1. In Vercel: **Project → Settings → Git → Deploy Hooks** → name it `weekly-rebuild`,
   branch `main` → **Create Hook** → copy the URL.
2. In GitHub: **Repo → Settings → Secrets and variables → Actions → New repository secret**:
   name **`VERCEL_DEPLOY_HOOK_URL`**, value: the URL you copied.
3. Test it: **Actions → Weekly rebuild → Run workflow**. A new deployment should appear in
   Vercel within a few seconds.

Treat the hook URL like a password: anyone who has it can trigger builds.

## 7. If you choose a different domain

Update it in two places, then push:

- `src/data/site.ts` → `domain`
- `astro.config.mjs` → `SITE`

(Both are used for canonical URLs, the sitemap, the share images and the structured data.)

---

## Security headers

`vercel.json` sets a strict Content-Security-Policy plus `X-Content-Type-Options`,
`Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy` and HSTS, and long-lived caching
for the hashed files under `/_astro/`.

The CSP allows same-origin scripts only, plus the SHA-256 hash of the small theme snippet in
`src/layouts/Base.astro` (it must run inline, before first paint, to avoid a flash of the
wrong theme). **If you edit that snippet**, refresh the hash:

```sh
npm run build && npm run csp
```

CI fails with a clear message if you forget.

## Troubleshooting

- **Build fails on Vercel with a Node version error:** set the Node.js version to 24.x
  (step 3.4).
- **The site loads but the theme toggle or animations don't work:** the CSP hash is stale.
  Run `npm run build && npm run csp`, commit `vercel.json`, push.
- **Domain stuck on "Invalid Configuration" in Vercel:** a default record is still there
  at Name.com, a value was mistyped, or nameserver changes haven't propagated yet (allow up to
  48 hours). Compare Name.com's DNS or nameserver settings with what Vercel shows.
- **Weekly rebuild fails:** the `VERCEL_DEPLOY_HOOK_URL` secret is missing or the hook was
  deleted in Vercel. Recreate it (step 6).
