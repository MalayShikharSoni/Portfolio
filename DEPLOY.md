# Deploying the portfolio

From this repo to a live site on your own `.me` domain: Vercel's free Hobby plan for
hosting, and the free `.me` domain from the GitHub Student Developer Pack's Namecheap offer.
Allow about an hour, most of it waiting for DNS.

The site is fully static (Astro static output). There's no server, no database and no
environment variables you must set.

---

## 1. Claim the free `.me` domain

1. Open **[GitHub Education](https://education.github.com/)** → **Student Developer Pack**
   and sign in with the GitHub account that has student benefits.
2. Find the **Namecheap** offer (a free `.me` domain for one year) and follow its link. You'll
   be sent to Namecheap with the offer applied, after authorising with GitHub.
3. Search for **`malayshikharsoni.me`** (or the name you prefer) and register it at $0.
4. **Before you leave Namecheap, deal with renewal.** Only the first year is free.
   Go to **Domain List** → your domain → turn **Auto-Renew** off, or note the renewal price
   in your calendar a month before it's due. Domain renewals are not refundable.

> Offers change. If the Pack no longer lists Namecheap, any registrar works; steps 3 to 5 are
> the same apart from where you edit DNS.

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

1. In Vercel: **Project → Settings → Domains** → add **`malayshikharsoni.me`**, then add
   **`www.malayshikharsoni.me`**.
2. Vercel shows the DNS records each domain needs. Keep that page open.
3. In Namecheap: **Domain List → Manage** (next to your domain) → **Advanced DNS**.
4. **Delete Namecheap's default parking records** (usually a `CNAME` for `www` pointing to
   `parkingpage.namecheap.com` and a `URL Redirect` record for `@`).
5. Add **exactly the records Vercel shows you**. Typically that's:

   | Type    | Host  | Value                                     |
   | ------- | ----- | ----------------------------------------- |
   | `A`     | `@`   | the IP address Vercel shows               |
   | `CNAME` | `www` | the `…vercel-dns.com` target Vercel shows |

   Copy the values from Vercel rather than from this table; they can differ per project.

6. Back in Vercel's **Domains** settings, set **`malayshikharsoni.me`** as the primary domain
   and set **`www`** to **redirect** to it (308).

## 5. Wait for DNS and HTTPS, then verify

DNS usually updates within 30 minutes and can take up to 48 hours. Vercel issues the
HTTPS certificate automatically once the records resolve; the Domains page turns green.

Then check:

- [ ] `https://malayshikharsoni.me` loads, with a padlock
- [ ] `http://…` and `https://www.…` both end up at `https://malayshikharsoni.me/`
- [ ] a case study, the 404 page (`/anything`) and `/resume.pdf` work
- [ ] sharing the link (e.g. paste it into [opengraph.xyz](https://www.opengraph.xyz/)) shows
      the poster preview image
- [ ] `https://malayshikharsoni.me/sitemap-index.xml` and `/robots.txt` load

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
- **Domain stuck on "Invalid Configuration" in Vercel:** a Namecheap parking record is
  still there, or a value was mistyped. Compare Advanced DNS with what Vercel shows.
- **Weekly rebuild fails:** the `VERCEL_DEPLOY_HOOK_URL` secret is missing or the hook was
  deleted in Vercel. Recreate it (step 6).
