# Hunya Munya Records — `/contact` Page + Form Spec

**Status**: Draft, spec master: Claude (Cowork). Supersedes the Track C stub in `hosting-addendum.md` §14 (if that's what we called it) — the addendum's PHP endpoint stays; this doc defines what the form looks like, what fields it captures, what anti-spam does, and what emails go out.
**Repo**: `github.com/evanatpizzarobot/hunyamunya.git` → `/site/app/contact/` + `/site/public/contact-submit.php`
**Destination**: `contact@hunyamunyarecords.com` (Google Workspace alias on Evan's account).

---

## 1. Goals + non-goals

**Goals:**
- One form that serves four audiences without making it feel like paperwork.
- Minimal friction for the submitter. Maximum signal for Evan.
- No third-party JS (no reCAPTCHA, no Formspree, no hCaptcha). Privacy-preserving, no branded badges, fast load.
- Works without JavaScript (progressive enhancement). Works beautifully with it.
- Accessible (WCAG AA).
- Deliverable emails (not stuck in Gmail's spam).

**Non-goals:**
- File upload support. Artists submit links to external hosting. This is standard practice for labels and keeps us off the malware/storage hook.
- Public comment system, guestbook, or reviews — wrong surface.
- Multi-step/wizard form. Single form with conditional fields is simpler and faster.
- Captcha. Honeypot + timing + rate limit handles 99% of bots at ~0% friction.

---

## 2. Who's writing in

Four audiences, in roughly descending volume:

1. **Artists submitting demos / pitches** — biggest traffic. Needs room for: artist name, music links, genre context, short pitch.
2. **Press / media / journalists** — interview requests, review copies, feature pitches.
3. **Licensing / sync inquiries** — film, TV, game, ad placement.
4. **General** — fans with questions, retail/distribution, mailing list, catch-all.

A single form with a **Purpose** selector routes each into the right frame and shows the right conditional fields. One endpoint, one submission log, one inbox — tagged by purpose in the subject line so Evan can triage quickly.

---

## 3. Form UX spec

### 3.1 Fields (always visible)

| Field | Type | Required | Notes |
|---|---|---|---|
| Name | text | yes | Single line. No parsing into first/last. |
| Email | email (HTML5) | yes | Browser-native validation; server re-validates. |
| Purpose | select | yes | Values: `submission` / `press` / `licensing` / `general`. Default: no selection (placeholder "What's this about?"). |
| Message | textarea | yes | Min 20 chars, max 3000. Live character counter below right. |

### 3.2 Conditional fields (shown based on Purpose)

When **Purpose = "Submit music"**:

| Field | Type | Required | Notes |
|---|---|---|---|
| Artist name | text | no | Only if different from "Name" above. |
| Music link | url | yes | Single URL. Accept Bandcamp, SoundCloud, YouTube, Google Drive, Dropbox, WeTransfer, private SoundCloud, anything https://. Validate: must be a URL, must be https. |
| Genre / style | text | no | Free text. One line. Used as a tag in submission log. |

When **Purpose = "Press / Media"**:

| Field | Type | Required | Notes |
|---|---|---|---|
| Outlet | text | no | Publication, station, show, podcast, etc. |

When **Purpose = "Licensing / Sync"**:

| Field | Type | Required | Notes |
|---|---|---|---|
| Company | text | no | Production company, agency, etc. |
| Project type | text | no | Free text ("indie film", "video game trailer", etc.). |

When **Purpose = "General"**: no extras.

### 3.3 Hidden / anti-spam fields (never shown to humans)

| Field | Type | Purpose |
|---|---|---|
| `website` (honeypot) | text, CSS-hidden + `tabindex="-1"` + `autocomplete="off"` | If filled, reject. Bots fill anything named "website" or "url". |
| `_t` (timestamp) | hidden, rendered server-side with current unix timestamp | If submit-time minus render-time < 3 seconds, reject (humans don't fill forms that fast). |

### 3.4 Conditional field mechanics

- Conditional sections are rendered in the DOM but visually collapsed (`hidden` attribute + ARIA) until Purpose is selected.
- JS toggles `hidden` based on Purpose value. No layout shift — reserve the space OR animate smoothly (~150ms slide/fade).
- No-JS fallback: all conditional fields visible by default. Slightly uglier but functional.
- Field focus should move smoothly when a new section reveals — don't auto-focus into the conditional block (interrupts scroll), but do ensure tab order is correct.

### 3.5 Validation

**Client-side (progressive enhancement):**
- Required field indicators (small asterisk + `aria-required="true"`).
- Inline errors on blur: "Email looks off — mind double-checking?" (human tone, not "Invalid email address").
- Submit button disabled until required fields are filled (visual: opacity 0.5, pointer-events none).
- Character counter on message: "0 / 3000" updating live. Turn red at 2900+.

**Server-side (authoritative):**
- Re-validate everything the client did.
- Reject if: honeypot filled, timestamp delta <3s or >2hrs, rate limit exceeded, required fields missing, email fails strict format check, message <20 chars or >3000.
- Return 400 with a generic "Please check the form and try again" on any failure (don't reveal which anti-spam layer tripped).
- Return 429 with "Too many submissions right now — please try again in a few minutes" on rate limit.
- Return 200 on success.

### 3.6 Submit button

Single button, right-aligned on desktop, full-width on mobile. Label: **"Send message"** (not "Submit" — too transactional).

States:
- Idle: brand accent color, white text.
- Loading: label switches to "Sending..." with a small inline spinner. Button disabled.
- Success: green flash → inline success state replaces the form (see §7).
- Error: back to idle with error message above the button (live region).

---

## 4. Anti-spam layers (reiterating)

Per `hosting-addendum.md` §4 env vars:

1. **Honeypot**: hidden `website` field. If non-empty → reject.
2. **Timing**: `_t` timestamp field. Delta < 3 seconds or > 2 hours → reject.
3. **Rate limit**: file-based, IP-keyed. Env vars:
   - `RATE_LIMIT_WINDOW_SECONDS=300` (5 minutes)
   - `RATE_LIMIT_MAX_PER_WINDOW=3`
   - Stored as JSON in `SUBMISSIONS_DIR/.rate-limit.json` (atomic file lock for writes).
   - Prune entries older than window on each write.
4. **Content heuristic (optional, low priority)**: reject messages containing >5 URLs in message body, or containing common spam phrases (`viagra`, `casino`, `crypto`, `seo services`). Keep the blocklist small and in a server-side constant; don't over-engineer.

**Deliberately no:**
- CAPTCHA (ugly, slow, privacy-invasive)
- reCAPTCHA (Google third-party JS; branded; slows load)
- hCaptcha (same issues)
- Email-confirmation double-opt-in (too much friction for a contact form)

If spam ever becomes an actual problem post-launch, revisit. Until then, this stack catches >99% at zero user friction.

---

## 5. Server endpoint spec

**Route**: `POST /contact-submit.php` (served by Apache at NetActuate)
**Method**: POST only. GET returns 405.

**Request body** (application/x-www-form-urlencoded):
```
name=...
email=...
purpose=submission|press|licensing|general
message=...
artist_name=...        (optional, if purpose=submission)
music_link=...         (required if purpose=submission)
genre=...              (optional, if purpose=submission)
outlet=...             (optional, if purpose=press)
company=...            (optional, if purpose=licensing)
project_type=...       (optional, if purpose=licensing)
website=...            (honeypot, must be empty)
_t=...                 (timestamp)
```

**Server steps:**
1. Read all env vars from `/home/hmrecords/.env` (already specced in hosting-addendum).
2. Reject on honeypot / timing / rate-limit failures before touching anything else.
3. Validate + sanitize inputs (strip tags, trim whitespace, normalize line endings).
4. Generate submission ID: `YYYY-MM-DD-HHMMSS-{random6}` — used in log filename + email subject + acknowledgment.
5. Write submission to disk: `SUBMISSIONS_DIR/{id}.json` — full payload + IP + user-agent + timestamp.
6. Send email to Evan (§6.1).
7. Send auto-acknowledgment to submitter (§6.2).
8. Return 200 with `{ok: true, id: "YYYY-MM-DD-..."}`. On AJAX: client flips form into success state. On no-JS: redirect to `/contact/sent?id=...` (static HTML thank-you page).

**Email sending:**

PHP `mail()` works but deliverability is iffy. Better: **PHPMailer with Google Workspace SMTP relay** since we're already on Google:
- Host: `smtp-relay.gmail.com`
- Port: 587, TLS
- Auth: Google Workspace admin sets up an "SMTP relay" service in Apps → Gmail → Routing, which allows authorized IPs to send as the domain without needing app passwords.

Alternative simpler path: use `mail()` with a proper From header (`CONTACT_FROM=website@hunyamunyarecords.com`) + Sender header. Since MX is Google + domain has proper SPF/DKIM, mail should deliver. Start here; upgrade to SMTP relay if bounces happen.

**Error handling:**
- If mail to Evan fails: still write to disk, return 200 to user, log the error to `SUBMISSIONS_DIR/.errors.log`. Evan sees submissions via disk log even if email breaks.
- If disk write fails: 500 error with "Something went wrong on our end — please try again or email contact@hunyamunyarecords.com directly."

---

## 6. Email templates

### 6.1 Email to Evan (contact@hunyamunyarecords.com)

**Subject**: `[hunyamunya] {PURPOSE} from {NAME}` (CONTACT_SUBJECT_PREFIX prepended)

Examples:
- `[hunyamunya] Submission from Jane Doe`
- `[hunyamunya] Press inquiry from Ambient Magazine`
- `[hunyamunya] Licensing from Studio X`
- `[hunyamunya] General from John Smith`

**Body (plain text):**
```
New {PURPOSE} from the hunyamunyarecords.com contact form.

---
Name: {NAME}
Email: {EMAIL}
{if purpose=submission:}
Artist name: {ARTIST_NAME or "(same as above)"}
Music link: {MUSIC_LINK}
Genre / style: {GENRE or "(not specified)"}
{/if}
{if purpose=press:}
Outlet: {OUTLET or "(not specified)"}
{/if}
{if purpose=licensing:}
Company: {COMPANY or "(not specified)"}
Project type: {PROJECT_TYPE or "(not specified)"}
{/if}
---

Message:

{MESSAGE}

---
Submission ID: {ID}
Received: {TIMESTAMP in Los Angeles time}
IP: {IP}
User-Agent: {UA}
---
Reply directly to this email — the submitter's address is in the From field.
```

**From**: `website@hunyamunyarecords.com` (matches CONTACT_FROM env var)
**Reply-To**: submitter's email address (critical — lets Evan just hit reply)
**To**: `contact@hunyamunyarecords.com`

### 6.2 Auto-acknowledgment email to submitter

**Subject**: `Thanks for writing Hunya Munya Records`

**Body (plain text):**
```
Hi {FIRST_NAME},

Thanks for writing Hunya Munya Records. Your message reached us.

A few honest words on timing:

We're a small independent label and we read every submission ourselves,
which means responses can take a few weeks — sometimes longer during
active release campaigns. If your message needs a reply, we'll get there.
If you don't hear back in 4-6 weeks, it's fine to send a gentle follow-up.

Your submission ID is {ID}, in case you need to reference it.

— Hunya Munya Records
  hunyamunyarecords.com
  Los Angeles, CA
```

**From**: `contact@hunyamunyarecords.com` (reply-able, not a no-reply address)
**Reply-To**: `contact@hunyamunyarecords.com`
**To**: submitter's email

**FIRST_NAME extraction**: use the first whitespace-separated token of the Name field. Fallback: full name if single word.

---

## 7. Success / error states (in-page)

### 7.1 Success state (replaces form on submit)

Visual: centered block, generous whitespace, matches label aesthetic.

Copy:
> **Message received.**
>
> Thanks for writing. We read every submission ourselves — if you're hoping for a response, it might take a few weeks. Check your inbox for a quick acknowledgment with your submission ID: **{ID}**.
>
> In the meantime, the [catalog](/catalog) is open, and new releases go out through the [news](/news) feed.

A subtle link back: [← Send another message] that restores the form (state reset).

### 7.2 Error state (inline above the form)

Visual: red-accented banner, ARIA `role="alert"`, focus moved to banner on render.

Copy variants:
- Validation: "Hmm — please check the form and try again. The field{s} below need{s} attention." (with specific fields highlighted)
- Rate limit: "Too many submissions right now — please try again in a few minutes."
- Server error: "Something went wrong on our end. Please try again, or email contact@hunyamunyarecords.com directly."

Don't reveal anti-spam specifics ("honeypot tripped", "timestamp too fast") — those details help spammers iterate.

---

## 8. `/contact` page — above the form

The form is the point, but the page needs framing copy. Short, warm, tells visitors what to expect.

**Suggested body:**

---

**Contact**

We read every message that comes through here. Whether you're an artist with something you think belongs on Hunya Munya Records, press or media with a question, someone interested in licensing our catalog for a project, or a listener with anything else on your mind — this form goes to us.

A quick note: we're a small independent label, which means responses can take a few weeks. We always read. We don't always have time to reply. If it's urgent, say so in the message and we'll prioritize.

**For demo submissions:** please include a link to the music. Bandcamp, SoundCloud, private streaming link, Google Drive folder — whatever works. We don't accept file attachments through the form.

**For everything else:** just tell us what's up.

---

[form renders here]

---

~170 words. Evan: redline the tone if it rings wrong. This is set-and-forget copy; it should feel like you.

### 8.1 Alternate contact methods (below form)

Small footer block under the form:
- Email: contact@hunyamunyarecords.com (plain text, not mailto to reduce harvesting)
- Social links (if applicable)
- Mailing address: omit (privacy). If a mailing address is needed for physical press, add a PO box later.

---

## 9. Design direction

Aesthetic per main spec's references (Warp, Kranky, Ghostly, Thrill Jockey):

- Dark-ish palette consistent with site — not a light "cheerful contact form" look.
- Typography: system stack or the site's display/body font pair; no custom "forms look different" styling.
- Fields: thin borders, generous padding (14-16px vertical), subtle focus state (border color shift + very subtle 2px outline ring, not a glow).
- No background boxes on fields. Flat, clean. No drop shadows.
- Required asterisk: subtle (faded) — not a loud red star.
- Labels: above each field (not floating / placeholder-as-label — accessibility issue). Small, slightly dimmer than field text.
- Submit button: full-width on mobile, auto-width on desktop, right-aligned. Label-colored accent fill. Hover: slight darken. Click: subtle press effect.
- Error/success state: text-based, minimal iconography.
- No animations beyond 150ms field focus transition + conditional field reveal.

CC has full design latitude within the site's existing token system — match whatever's already in `/site/components/` for fonts, colors, spacing.

---

## 10. Accessibility

- Every input has an associated `<label for="...">` (not placeholder-as-label, not ARIA-labelledby hacks — real labels).
- `aria-required="true"` on required fields.
- `aria-invalid="true"` toggled on blur if field fails validation.
- Error messages associated via `aria-describedby`.
- Live region (`role="status"` for success, `role="alert"` for errors) for form-level messaging.
- Keyboard navigation: tab order matches visual order. No focus traps.
- Skip-to-form link if the /contact page has navigation above it (should already be in the site's skip links).
- Color contrast: all text + UI states meet WCAG AA (4.5:1 for body, 3:1 for large text and UI).
- Form must be usable without JS (server-side validation + redirect to thank-you page).

---

## 11. SEO + schema

**Page head:**
```yaml
seoTitle: "Contact — Hunya Munya Records"
metaDescription: "Get in touch with Hunya Munya Records — demo submissions, press inquiries, licensing requests, or general questions. We read every message."
```

**JSON-LD** (in addition to the base MusicLabel schema on every page):
```json
{
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "name": "Contact Hunya Munya Records",
  "url": "https://hunyamunyarecords.com/contact",
  "mainEntity": {
    "@type": "Organization",
    "name": "Hunya Munya Records",
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "contact@hunyamunyarecords.com",
      "contactType": "customer service",
      "areaServed": "Worldwide",
      "availableLanguage": "English"
    }
  }
}
```

Breadcrumb: Home → Contact.

**Crawl control:** the form submission endpoint (`/contact-submit.php`) should be blocked via `robots.txt` since it's a POST-only action URL. Add:
```
Disallow: /contact-submit.php
Disallow: /contact/sent
```

---

## 12. Submission log hygiene

**On-disk submission log:**
- Location: `SUBMISSIONS_DIR` (per env var, default `/home/hmrecords/submissions/`).
- Permissions: `chmod 700` (directory), `chmod 600` (files). Only the PHP process user can read.
- File format: one JSON file per submission, named `{id}.json`.
- Retention: 24 months. A cron job (or manual clean-up) prunes older files. Flag for later.
- Backups: NetActuate's cPanel backup covers this if enabled; otherwise Evan can rsync periodically.

**Privacy note for the /contact page footer or a /privacy page:**
> We store contact form submissions on our server for up to 24 months, encrypted at rest, and used only to respond to your message. We don't share them, sell them, or use them for anything other than replying to you.

---

## 13. Testing checklist (pre-launch)

For CC before shipping:

- [ ] Happy path: submission → Evan's email arrives → auto-ack arrives at submitter → submission file on disk.
- [ ] Each of the four purposes shows correct conditional fields.
- [ ] No-JS submission works (full page round-trip to `/contact/sent`).
- [ ] Honeypot trip: filled `website` field → silent reject, no email sent, no disk write.
- [ ] Timing trip: submission within 2s of page load → silent reject.
- [ ] Rate limit: 4 submissions from same IP within 5 min → 4th returns 429.
- [ ] Oversize message (>3000 chars) → client blocks + server rejects.
- [ ] Unicode in name/message → delivers cleanly, renders in email.
- [ ] Screen reader walkthrough: labels read, errors announced, success announced.
- [ ] Keyboard-only completion: tab order, no focus traps, submit via Enter key.
- [ ] Lighthouse accessibility score on /contact: 100.
- [ ] Mobile (375px): all fields usable, no horizontal scroll, submit button full-width.

---

## 14. Open questions for Evan

1. **Auto-acknowledgment tone.** The draft I wrote in §6.2 is honest about response timing ("a few weeks, sometimes longer"). Some labels prefer "we'll reply as soon as we can" (vaguer). Honest wins for trust; evasive wins for expectation-setting. Your call.
2. **"For demo submissions" note in the /contact framing copy.** Is "we don't accept file attachments" the right stance, or do you want submitters to know you'll listen to a WeTransfer link specifically? I'd standardize on "link to a host, any host, https." Let me know if you want to be prescriptive.
3. **Auto-reply from `contact@` vs. separate address.** Default: auto-ack sends from `contact@hunyamunyarecords.com`. If you'd rather auto-acks come from `no-reply@` or `hello@` to keep contact@ clean, flag that and we'll add another alias.
4. **Response-time SLA in the auto-ack.** Current: "a few weeks, sometimes longer." Could be tighter ("within two weeks") or looser ("when we can"). Latest honest number you can live with.
5. **PO Box / physical address.** Any physical address you want listed on the site? Press/promo often needs one for vinyl review copies or releases.
6. **Privacy page (`/privacy`).** Do we have one? Should we draft one? Short one is enough for a label (~400 words: what data we collect on the contact form, how long we keep it, cookies [none], third parties [none], rights). Flag if you want me to spec that too.

---

## 15. Implementation handoff to CC

**Priority**: Track C (your current Track C pickup) is exactly this, with the UX + copy + schema filled in.

**Files to create:**
- `site/app/contact/page.tsx` — the /contact route with framing copy + form component.
- `site/app/contact/sent/page.tsx` — no-JS fallback thank-you page.
- `site/components/ContactForm.tsx` — the form component.
- `site/public/contact-submit.php` — server endpoint.
- `site/content/pages/contact-intro.mdx` (optional) — if you want the framing copy in MDX for easy editing.

**Dependencies**: none new. PHPMailer only if you want SMTP relay (addable later if deliverability is an issue).

**Env vars** (already in hosting-addendum, just reaffirming):
```
CONTACT_TO=contact@hunyamunyarecords.com
CONTACT_FROM=website@hunyamunyarecords.com
CONTACT_SUBJECT_PREFIX=[hunyamunya]
SUBMISSIONS_DIR=/home/hmrecords/submissions
RATE_LIMIT_WINDOW_SECONDS=300
RATE_LIMIT_MAX_PER_WINDOW=3
```

Heads-up: CONTACT_TO updated to `contact@hunyamunyarecords.com` (was `evan@hunyamunyarecords.com` in the original addendum). CC — make sure to use the new value.

---

## 16. Changelog

- **2026-04-22** — v1 spec. CONTACT_TO updated to role-based `contact@hunyamunyarecords.com`. Form UX, anti-spam, email templates, accessibility, schema, submission log hygiene all defined.
