# Content Drafts — About, Home Hero, Rykard Bio (v1)

**Purpose**: First-pass copy for CC to wire into `content/pages/about.mdx`, the home hero block, and `content/artists/rykard.mdx`. Evan: edit the voice wherever it rings false, send back, or let CC ship as-is if it works.

All three pieces share a common voice goal: musician-founder, 23 years in, confident without being reverent, plain language, no marketing slop. Ambient electronic means contemplative, not dour — the copy should feel like someone who still enjoys this.

---

## 1. About page — `content/pages/about.mdx`

**Target**: 400-500 words. SEO keywords hit naturally: "ambient electronic music label", "Los Angeles", "since 2003", "independent", "vinyl". Rykard named for authority signal. Links out to catalog and roster for internal linking.

**Frontmatter suggestion:**
```yaml
title: "About"
seoTitle: "About — Hunya Munya Records, an independent ambient electronic label in Los Angeles since 2003"
metaDescription: "Hunya Munya Records is an independent ambient electronic music label in Los Angeles, putting out vinyl, CD, and digital releases since 2003 — home to Rykard, Darius Kohanim, Distant Fragment, and others."
```

**Body:**

---

Hunya Munya Records is an independent ambient electronic music label based in Los Angeles. We started the label in 2003, which makes 2026 our twenty-third year putting out music that sits at the edges — ambient, electronic, experimental, and the quiet territory between them.

The label has always been vinyl-first for the records that earn it. Across ten numbered HMR vinyl releases, four CD full-lengths, and eighteen digital releases from our 2005–2008 Hunya Munya Digital sublabel, we've built a catalog that rewards repeat listening more than it chases attention. Some of these records are two decades old and still finding new listeners; a few of them we lost track of in previous website migrations and are only now putting back where they belong.

Our best-known lineage runs through [Rykard](/artists/rykard), whose track "North Cormorant Obscurity" crossed twenty-five million plays on Pandora, and whose album "Arrive the Radio Beacon" remains one of the records we're proudest to have put out. A new Rykard album is in the works for 2026.

Beyond Rykard, the roster threads through artists like Darius Kohanim, Habersham, Distant Fragment, and a range of collaborators who have contributed to the label's sound over the years. The complete [roster](/artists) and [catalog](/catalog) are both a few clicks away.

We work slow. We put out records we actually want to put out. We like physical media, clean mastering, real liner notes, and artwork you can hold in your hands. We've never chased trends and we've never faked engagement — if the music doesn't earn a release on its own merits, it doesn't get one. That's an uncommercial principle, but it's the one we've stuck with.

Los Angeles has been our home since day one. Every record on the label came together here — the rooms, the collaborators, the scenes that hold them up. We've watched the city's ambient and electronic scenes reshape themselves many times over the years, and we're still glad to be part of whatever it's becoming next.

If you're an artist working in ambient, drone, electronic, or adjacent territory and you've got something you think belongs here, the door is open — we read every submission, though we can't always respond. If you're a listener, the [catalog](/catalog) is the best way in. Start anywhere and let it lead you outward.

— Evan Rippertoe, founder

---

**Word count**: ~420 words.

**Knobs to turn if you want to redirect:**
- "We work slow" paragraph — this is the voice paragraph. If it feels too pronouncement-y or not yours, cut it or rewrite it.
- "Uncommercial principle" phrase — some people love this, some hate it. Remove if it reads pompous.
- Roster name list in paragraph 4 — I picked names I could confirm from the catalog; swap in whoever you'd rather lead with.
- "Evan Rippertoe, founder" sign-off — remove if you don't want to personally sign, or change to "Evan Rippertoe" or just "— HMR".

---

## 2. Home page hero block — `app/page.tsx` or equivalent

**Target**: ~50-60 words. Must include: brand name, category (ambient electronic), location (Los Angeles), founding year (2003), and internal links with descriptive anchor text.

**Copy:**

---

**Hunya Munya Records** is an independent ambient electronic music label based in Los Angeles. Since 2003, we've been putting out music at the edges — ambient, electronic, experimental, and the quiet territory between them. Browse the [catalog](/catalog), meet the [roster](/artists), or read about the [label](/about).

---

**Word count**: 48 words.

This is lifted from the About opener and tightened. Keeps the 2003 anchor, the Los Angeles anchor, and the genre positioning in a crawler-friendly opening sentence.

---

## 3. Rykard bio — `content/artists/rykard.mdx` body

**Target**: 150-250 words for the launch bio. Can expand post-launch with a full "Rykard deep dive" long-form piece under `/artists/rykard/story` or similar (per SEO spec §4.1 content pillar #3). This is the launch-ready version.

**Frontmatter suggestion** (merge with existing if already populated):
```yaml
name: "Rykard"
slug: "rykard"
tier: "anchor"
genres: ["Ambient", "Electronic", "Experimental"]
shortBio: "Rykard is an anchor artist on Hunya Munya Records, known for 'North Cormorant Obscurity' (25M+ Pandora plays) and the album 'Arrive the Radio Beacon.' A new album lands in 2026."
seoTitle: "Rykard — Hunya Munya Records"
metaDescription: "Rykard on Hunya Munya Records — ambient electronic project best known for 'North Cormorant Obscurity' (25M+ Pandora plays) and 'Arrive the Radio Beacon.' New album coming 2026."
```

**Body:**

---

Rykard is one of the anchor artists on the Hunya Munya Records roster — a long-running ambient electronic project working in the contemplative, deeply textured end of the genre.

Rykard's music moves slowly by design. The compositions favor patience and space over density; the production rewards good headphones without punishing cheap ones. Tracks unfold the way a room reveals itself when you spend time in it — nothing hurried, nothing wasted.

The track that brought Rykard the widest reach is "North Cormorant Obscurity," which has crossed twenty-five million plays on Pandora. The album "Arrive the Radio Beacon," released on Hunya Munya Records, remains a defining piece of the label's catalog: architectural, emotional, and technically exacting in ways that reward close listening.

A new Rykard album is in the works for 2026 — the follow-up to "Arrive the Radio Beacon" and the project's first full-length in several years. Details will be announced in the months ahead.

For listeners new to the project, "North Cormorant Obscurity" is a good entry point. The rest of the catalog rewards the same kind of attention.

---

**Word count**: ~185 words.

**Knobs to turn:**
- Second paragraph (the "music moves slowly by design" descriptive block) is pure aesthetic writing on my part — Rykard might describe his own work very differently. This is the paragraph most likely to need your / his rewrite. I was conservative to avoid inventing details I don't know.
- If Rykard has specific gear, collaborators, influences, origin story details, live history, or any other concrete biographical/production facts you want included, send them and I'll fold them in. Right now the bio is deliberately sparse to avoid fabricating anything.
- "Anchor artists" phrasing mirrors the tier language in the spec. Fine for the site copy, or change to plain English like "one of the longest-running projects on Hunya Munya Records".
- The 2026 album paragraph is placeholder-ish. When you're ready to announce, swap in the actual album title + release date + preorder link and this paragraph becomes the announcement block.

---

## 4. Handoff notes

For CC:
- About copy lands in `content/pages/about.mdx` (or wherever the about route reads from).
- Home hero lands in the home page component; internal links use `<Link>` from `next/link` to keep client-side routing.
- Rykard bio merges into the existing `content/artists/rykard.mdx` — do NOT overwrite the migrated WP bio if one exists; append or Evan chooses which to keep. If there's no existing bio, use this wholesale.
- All three pieces pass through the existing `<SEO>` component with the `seoTitle` / `metaDescription` fields from frontmatter. No special handling needed.

For Evan:
- Read all three, redline whatever rings false, send back, ship as-is, or tell me to rewrite from a different angle. I'll turn it fast.
- The "Evan Rippertoe, founder" sign-off is a choice — take it or leave it.
- If Rykard wants to send his own bio paragraph, we absolutely use that over mine.

---

## Changelog

- **2026-04-22** — v1 drafts. About (~420 words), home hero (48 words), Rykard bio (~185 words).
