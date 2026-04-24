# Contact Form v2 — Resend via Cloudflare Worker

> **Note (2026-04-23):** Superseded by email-only approach per 2026-04-23 decision. Kept as reference for future reconsideration. See `docs/decisions.md`.

**Status**: Shelved. Architecture remains valid if the label ever reintroduces a form; not shipped.
**Supersedes**: `contact-form-v1.md` for the backend. v1's form UX spec (honeypot fields, timing check, redirect to /contact/sent, copy) still applies; v2 replaces the PHP endpoint with a Cloudflare Worker calling the Resend API.

## Architecture

```
Browser on www.hunyamunyarecords.com
        |
        |  POST /submit (JSON body)
        v
hmr-contact-form.<account>.workers.dev
(Cloudflare Worker)
        |
        |  POST https://api.resend.com/emails
        |  Authorization: Bearer RESEND_API_KEY
        v
Resend
        |
        |  Envelope: From noreply@hunyamunyarecords.com
        |  To: contact@hunyamunyarecords.com
        v
Google Workspace inbox (contact@)
```

Static site stays static on NetActuate. All server-side work runs on Cloudflare's free Workers tier.

## Phase 1 — Resend account (Evan)

1. Sign up at `https://resend.com` using `contact@hunyamunyarecords.com` or a personal email. Upgrade to the free production tier (3,000 emails/month, 100/day).
2. In the Resend dashboard, go to **Domains** and click **Add Domain**. Enter `hunyamunyarecords.com`.
3. Resend will display a set of DNS records to add. There are typically three:
   - One `TXT` record for SPF (value includes `include:_spf.resend.com` or similar)
   - One `CNAME` record for DKIM (value points to `resend._domainkey.<resend-id>.resend.com`)
   - One `MX` record optional for bounce routing (can skip at launch)
4. Leave the Resend tab open; you will need the exact values in Phase 2.

## Phase 2 — DNS (Evan)

Where DNS for `hunyamunyarecords.com` is currently managed: check the registrar first (GoDaddy, Namecheap, etc.), then NetActuate cPanel if the domain's nameservers point there. Google Workspace needs to keep its existing records; we are adding to the zone, not replacing it.

1. **SPF record.** If a TXT record starting with `v=spf1` already exists (almost certain if Google Workspace is set up), do not create a second one. Edit the existing record to merge Resend's include. Example:
   - Before: `v=spf1 include:_spf.google.com ~all`
   - After:  `v=spf1 include:_spf.google.com include:_spf.resend.com ~all`
2. **DKIM CNAME.** Add the CNAME record exactly as Resend provides it. Common form: host = `resend._domainkey`, value = `<long-resend-hostname>.resend.com`. Resend verifies this to prove you own the domain.
3. **DMARC (optional, recommended).** If no DMARC record exists, add a soft one:
   - Host: `_dmarc`
   - Value: `v=DMARC1; p=none; rua=mailto:contact@hunyamunyarecords.com`
4. Back in the Resend dashboard, click **Verify**. Verification usually takes under ten minutes but can take up to a couple of hours depending on DNS propagation. Once green, the domain is ready to send from.

## Phase 3 — Resend API key (Evan)

1. In the Resend dashboard, go to **API Keys** and click **Create API Key**.
2. Name: `HMR Contact Form Production`.
3. Permission: **Sending access** only (not full access). Domain scope: `hunyamunyarecords.com`.
4. Copy the key. Resend will show it once; save it somewhere secure (password manager). Format looks like `re_123abc...`.

## Phase 4 — Cloudflare Worker (CC writes, Evan deploys)

### 4.1 Cloudflare account

Sign up at `https://dash.cloudflare.com/sign-up` if there is no existing HMR account. Free tier is fine.

### 4.2 Wrangler CLI

On the dev machine:

```bash
npm install -g wrangler
wrangler login   # opens a browser to authorize the Cloudflare account
```

### 4.3 Project structure

CC creates a new directory at the repo root:

```
hmr-contact-form/
├── src/
│   └── worker.ts
├── wrangler.toml
├── package.json
└── tsconfig.json
```

Keep this as a separate deploy target from the Next.js site. Same repo, distinct CI path.

### 4.4 `wrangler.toml`

```toml
name = "hmr-contact-form"
main = "src/worker.ts"
compatibility_date = "2024-10-01"

[vars]
CONTACT_TO = "contact@hunyamunyarecords.com"
CONTACT_FROM = "Hunya Munya Records <noreply@hunyamunyarecords.com>"
ALLOWED_ORIGIN = "https://www.hunyamunyarecords.com"

# RESEND_API_KEY is set via:
#   wrangler secret put RESEND_API_KEY
# Do NOT commit the key to the repo.
```

### 4.5 `src/worker.ts`

```typescript
interface Env {
  RESEND_API_KEY: string;
  CONTACT_TO: string;
  CONTACT_FROM: string;
  ALLOWED_ORIGIN: string;
}

interface ContactPayload {
  name: string;
  email: string;
  purpose: "submission" | "press" | "licensing" | "general";
  message: string;
  website?: string;      // honeypot; real users cannot see this field
  submittedAt?: string;  // ISO timestamp captured when form was loaded
}

const MIN_FILL_TIME_MS = 3000;
const MAX_MESSAGE_LEN = 10000;

const PURPOSE_LABEL: Record<ContactPayload["purpose"], string> = {
  submission: "Demo submission",
  press: "Press inquiry",
  licensing: "Sync / licensing inquiry",
  general: "General enquiry",
};

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const cors = corsHeaders(env.ALLOWED_ORIGIN);

    if (req.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }
    if (req.method !== "POST") {
      return json({ error: "Method not allowed" }, 405, cors);
    }

    let payload: ContactPayload;
    try {
      payload = await req.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400, cors);
    }

    // Honeypot: any value in `website` means a bot filled it.
    // Return a silent success so bots think they succeeded and move on.
    if (payload.website && payload.website.length > 0) {
      return json({ ok: true }, 200, cors);
    }

    // Timing: forms submitted too fast are bots.
    if (payload.submittedAt) {
      const loadedAt = Date.parse(payload.submittedAt);
      if (!Number.isNaN(loadedAt)) {
        const elapsed = Date.now() - loadedAt;
        if (elapsed < MIN_FILL_TIME_MS) {
          return json({ ok: true }, 200, cors);
        }
      }
    }

    // Validation
    if (!payload.name?.trim() || !payload.email?.trim() || !payload.message?.trim()) {
      return json({ error: "Missing required fields" }, 400, cors);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      return json({ error: "Invalid email" }, 400, cors);
    }
    if (payload.message.length > MAX_MESSAGE_LEN) {
      return json({ error: "Message too long" }, 400, cors);
    }

    const purposeLabel = PURPOSE_LABEL[payload.purpose] ?? "General enquiry";

    const emailText = [
      `From: ${payload.name} <${payload.email}>`,
      `Purpose: ${purposeLabel}`,
      ``,
      payload.message,
      ``,
      `---`,
      `Submitted via hunyamunyarecords.com contact form`,
    ].join("\n");

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.CONTACT_FROM,
        to: [env.CONTACT_TO],
        reply_to: payload.email,
        subject: `[HMR contact] ${purposeLabel} from ${payload.name}`,
        text: emailText,
      }),
    });

    if (!emailRes.ok) {
      const errText = await emailRes.text().catch(() => "");
      console.error("Resend API error:", emailRes.status, errText);
      return json({ error: "Could not send message" }, 502, cors);
    }

    return json({ ok: true }, 200, cors);
  },
};

function corsHeaders(allowedOrigin: string): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function json(data: unknown, status: number, extraHeaders: Record<string, string>) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...extraHeaders, "Content-Type": "application/json" },
  });
}
```

### 4.6 Deploy (Evan)

From the `hmr-contact-form/` directory:

```bash
# Install dev deps (one-time)
npm install
npm install --save-dev wrangler @cloudflare/workers-types

# Set the Resend API key as a secret (not committed)
wrangler secret put RESEND_API_KEY
# Paste the re_... key from Phase 3 when prompted

# Deploy
wrangler deploy
```

Wrangler will print the deployed URL, something like:

```
https://hmr-contact-form.<account>.workers.dev
```

That URL is the form POST target. Save it.

## Phase 5 — Form wire-up (CC)

### 5.1 Environment variable

Add to the Next.js environment (`.env.production.local` or wherever env lives):

```
NEXT_PUBLIC_CONTACT_WORKER_URL=https://hmr-contact-form.<account>.workers.dev
```

Use `NEXT_PUBLIC_` prefix so the client-side form can read it at build time.

### 5.2 `site/components/ContactForm.tsx` updates

Three changes to the existing component:

1. On mount, record the load timestamp in a ref or hidden input:

```tsx
const submittedAtRef = useRef<string>(new Date().toISOString());
```

2. Add a honeypot field, hidden from users and keyboard-focusable only to bots:

```tsx
<input
  type="text"
  name="website"
  tabIndex={-1}
  autoComplete="off"
  aria-hidden="true"
  style={{ position: "absolute", left: "-9999px", opacity: 0 }}
/>
```

3. On submit, POST JSON to the Worker URL:

```tsx
async function onSubmit(e: FormEvent<HTMLFormElement>) {
  e.preventDefault();
  setStatus("submitting");

  const formData = new FormData(e.currentTarget);
  const payload = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    purpose: String(formData.get("purpose") ?? "general"),
    message: String(formData.get("message") ?? ""),
    website: String(formData.get("website") ?? ""),
    submittedAt: submittedAtRef.current,
  };

  try {
    const res = await fetch(process.env.NEXT_PUBLIC_CONTACT_WORKER_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    router.push("/contact/sent");
  } catch (err) {
    console.error(err);
    setStatus("error");
  }
}
```

## Phase 6 — Testing (Evan)

1. Build and run the site locally: `npm run dev` in `site/`.
2. Open `localhost:3000/contact`, fill out the form honestly.
3. Check `contact@hunyamunyarecords.com` for the email within a few seconds.
4. Check the Resend dashboard (`Emails` tab) for the send record. Confirm delivery status.
5. Push the site to production, retest from `https://www.hunyamunyarecords.com/contact`.
6. Send a test from a completely different network (phone on cellular) to rule out local-only CORS or origin quirks.

## Phase 7 — Monitor (ongoing)

- **Resend**: dashboard shows send / bounce / complaint stats per domain.
- **Cloudflare Workers**: dashboard shows invocations, errors, CPU time. Free tier is 100k requests/day, well above anything a label contact form will ever see.
- **If spam becomes a problem later**: add Cloudflare Turnstile (free invisible CAPTCHA). A two-line form change on the client plus a token verification call in the Worker. Not needed at launch.

## Phase 8 — Future polish (not blocking launch)

- **Custom domain for the Worker**: if DNS for hunyamunyarecords.com moves to Cloudflare later (nameserver change), the Worker can run at `contact-api.hunyamunyarecords.com` instead of `workers.dev`. Same code, one route config in wrangler.toml. Branding win, not a functional win.
- **Press alias**: add `press@hunyamunyarecords.com` as a Google Workspace alias routed to the same inbox; update the press page CTA to use it. Clean sorting.
- **Autoreply**: send a "thanks, we got it" confirmation email to the submitter after the main email fires. Second Resend API call in the Worker. Low priority.

## Environment variables reference

| Name | Where | Value |
|------|-------|-------|
| `RESEND_API_KEY` | Worker secret (via `wrangler secret put`) | `re_...` from Phase 3 |
| `CONTACT_TO` | Worker vars (wrangler.toml) | `contact@hunyamunyarecords.com` |
| `CONTACT_FROM` | Worker vars (wrangler.toml) | `Hunya Munya Records <noreply@hunyamunyarecords.com>` |
| `ALLOWED_ORIGIN` | Worker vars (wrangler.toml) | `https://www.hunyamunyarecords.com` |
| `NEXT_PUBLIC_CONTACT_WORKER_URL` | Next.js env | `https://hmr-contact-form.<account>.workers.dev` |

## Changelog

- **2026-04-23** — v2. Resend + Cloudflare Worker architecture replaces v1's PHP endpoint. Full Worker code, form wire-up, DNS records, deployment commands, and testing plan.
