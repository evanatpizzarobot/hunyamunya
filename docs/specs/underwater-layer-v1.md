# Underwater Ambient Layer — NCO Campaign

A minimal "below-the-fold" underwater layer for hunyamunyarecords.com,
designed as campaign-swappable infrastructure. Phase 1 = home page only.

This bundle contains everything Claude Code needs to implement Phase 1
against the spec. Real Figma mockup of the composited home page is a
separate handoff — this is the code reference.

---

## Files

```
underwater_bundle/
├── README.md                    ← this file (spec + integration notes)
├── underwater.css               ← drop-in styles + keyframes + @media
├── underwater.html              ← markup snippet (sprite + wrapper)
├── props/
│   ├── cormorant.svg            ← surface bird (diving silhouette)
│   ├── cod.svg                  ← native, mid-depth
│   ├── mackerel.svg             ← native, schooling
│   ├── basking-shark.svg        ← largest, deep
│   ├── rov.svg                  ← deep-sea ROV (NCO tie-in)
│   ├── kelp-strand.svg          ← drifting kelp
│   ├── jellyfish.svg            ← contact-page-future
│   └── anchor-chain.svg         ← vertical right-edge prop
└── campaign.nco.yaml            ← prop set + per-page assignment
```

The YAML scaffold is included now (Phase 4) so the structure exists from
day one — even if Phase 1 only reads `pages.home` from it.

---

## Phase 1 scope

Home page, below the hero fold, NCO campaign prop set. Per the spec:

- 4 to 8 silhouettes (this bundle ships 5 active, 3 reserve)
- Pure SVG + CSS animations, no JS-driven motion
- Opacity 0.08–0.18, dark blue family only
- Slow horizontal drift (60–90s desktop, 90–140s mobile)
- `prefers-reduced-motion`: drift halts; silhouettes stay placed
- `pointer-events: none`, behind all content
- Max 3 visible at any scroll position (achieved via vertical
  staggering + delayed entry)

---

## Per-page mood arc (full spec, build now → use later)

Each page reads as a different depth of the same ocean. The CSS layer is
the same component on every page — the only thing that changes is the
prop set assigned to it via `campaign.nco.yaml > pages.<page>`.

| Page             | Depth zone           | Prop set                                   |
|------------------|----------------------|--------------------------------------------|
| Home             | Shallow              | cormorant, cod, mackerel, basking-shark, rov |
| Artists index    | Mid-depth, schooling | mackerel ×3 (staggered), single cod        |
| Catalog index    | Wreckage zone        | record-disc silhouette ×2, anchor-chain    |
| Release detail   | Closer to surface    | single cod or mackerel drift               |
| News index       | Kelp drift           | kelp-strand ×2, single small fish          |
| About            | Deep abyss           | basking-shark only, very far               |
| Press            | Looking up from below| inverted hull silhouette, rig-legs prop    |
| Contact          | Empty deep           | jellyfish only                             |

Phase 1 ships home; Phases 2–3 swap the prop set. Phase 4 lifts it to
YAML so a non-coder can author future campaigns.

---

## Integration

### 1. Sprite (once per page)

Paste the contents of `underwater.html` (the `<svg width="0">` block
only) once per page, ideally in your shared layout shell. It defines
`<symbol>` references the swimmers consume via `<use>`.

### 2. Wrap below-the-fold sections

```html
<div class="underwater" data-zone="shallow">
  <!-- decorative, don't put text/buttons here -->
  <div class="uw-depth"></div>
  <div class="uw-caustic"></div>

  <!-- swimmers are zone-specific; for home: -->
  <div class="uw-swimmers" aria-hidden="true">
    <svg class="uw-swim uw-lane-1"><use href="#silShark"/></svg>
    <svg class="uw-swim uw-lane-2"><use href="#silROV"/></svg>
    <svg class="uw-swim uw-lane-3"><use href="#silCod"/></svg>
    <svg class="uw-swim uw-lane-4"><use href="#silMackerel"/></svg>
    <svg class="uw-swim uw-lane-5"><use href="#silCormorant"/></svg>
  </div>

  <!-- your real content sits in front -->
  <div class="uw-content">…manifesto, catalog preview, etc…</div>
</div>
```

### 3. Style hooks

`underwater.css` exposes these knobs as custom properties:

```css
.underwater {
  --uw-fill:        var(--ink);          /* silhouette base color */
  --uw-opacity:     0.12;                /* default visibility */
  --uw-duration-1:  90s;                 /* slowest lane */
  --uw-duration-2:  72s;
  --uw-duration-3:  60s;
  --uw-duration-4:  78s;
  --uw-duration-5:  84s;
  --uw-caustic:     0.08;                /* shimmer band opacity */
}
```

Override per-page by setting `data-zone="abyss"` etc. and providing
matching custom-property overrides in CSS.

---

## Subtlety calibration (do not skip)

Spec is explicit: the creatures must be **barely-noticeable on first
glance, rewarding on second**. Validation criteria for Phase 1 sign-off:

1. Open the home page on a calibrated monitor. Scroll past the hero.
2. Look directly at the page for **3 seconds**. You should not be
   immediately drawn to the creatures.
3. Look away, look back. The eye should *now* catch the drift.
4. If a creature reads clearly on the first 3-second glance: drop
   `--uw-opacity` by 0.02 and re-test.

If we crank visibility up because "it's not obvious enough", we've
broken the brief. Default opacity 0.12. Hard ceiling 0.18. Hard floor
0.06.

---

## Performance

- All animation runs on `transform: translateX()` + `opacity`. No
  layout. No paint thrash beyond the SVG itself.
- SVG silhouettes are ~200B–400B each. Total prop set is <3KB.
- No `filter:`, no `backdrop-filter`, no `mix-blend-mode` in the swim
  lanes (they composite cheaply on every frame).
- Caustic shimmer uses a single static linear-gradient + a slow
  `background-position` shift on a 60s loop.
- Tested target: 60fps on a 2019 ThinkPad and a base iPhone 12.

---

## Out of scope reminders (from the brief)

- No 3D, WebGL, three.js, particle systems
- No anatomical detail or swim-loop articulation
- No audio, no interactivity (hover/click/parallax all forbidden)
- No bubble streams (single bubble every 30s+ is the absolute ceiling)
- No light mode

---

## Phase handoff to Claude Code

Build order Claude Code should follow:

1. Drop `underwater.css` and the SVG sprite from `underwater.html` into
   the layout shell.
2. Wrap the home page sections below the hero (manifesto + catalog
   preview + roster preview + news + stats + wordmark + footer) inside
   one `<div class="underwater" data-zone="shallow">`.
3. Place the 5 swimmer SVGs from the sprite. Don't add more.
4. Verify reduced-motion behavior in DevTools (Rendering panel →
   Emulate CSS media: prefers-reduced-motion: reduce).
5. Verify on a phone in portrait. Adjust mobile media query if mobile
   density feels too busy — the bundle errs on the side of fewer
   creatures on small screens.
6. Sign-off using the subtlety calibration steps above.

Phase 2 starts after Phase 1 ships and the label has had a week to
live with it.
