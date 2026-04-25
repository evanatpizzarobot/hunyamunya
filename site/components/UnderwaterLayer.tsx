import type { CSSProperties, ReactNode } from "react";

/**
 * Underwater ambient layer wrapper. Renders a full-viewport-width
 * "looking up at creatures passing overhead" shadow layer behind page
 * content, with a depth gradient, a top caustic shimmer, and N drifting
 * shadow shapes. Use one per route, choosing the zone that matches the
 * page's mood and a lane composition that fits the route's vertical
 * extent.
 *
 * The wrapper breaks out of the parent <main>'s max-width with
 * `marginLeft: calc(50% - 50vw)` and `w-screen` (matches the home hero
 * pattern), then re-applies the same `mx-auto max-w-[1440px] px-5
 * md:px-10` constraints inside `.uw-content` so existing page markup
 * lays out as it did before wrapping.
 *
 * Lane CSS positioning, sizing, timing, and opacity all flow from the
 * `lanes` prop into inline styles. The CSS file (site/app/underwater.css)
 * supplies the keyframes, mobile slowdown multiplier, reduced-motion
 * parking, and per-zone opacity/caustic overrides.
 */

type Zone =
  | "shallow"  // home — full creature mix
  | "mid"      // listing pages with schooling activity
  | "wreck"    // catalog — larger drifters
  | "surface"  // detail pages — single drift, brighter caustic
  | "kelp"     // news — smaller faster shadows
  | "abyss"    // about — one giant slow shadow, no caustic
  | "lookup"   // press — looking up at hulls (more solid)
  | "empty";   // contact — single faint drifter

type Direction = "lr" | "rl";

type Shape = "long" | "round" | "oblong" | "narrow" | "whale";

const SHAPE_REFS: Record<Shape, { id: string; viewBox: string }> = {
  long:    { id: "silShadowLong",    viewBox: "0 0 240 60" },
  round:   { id: "silShadowRound",   viewBox: "0 0 100 60" },
  oblong:  { id: "silShadowOblong",  viewBox: "0 0 140 50" },
  narrow:  { id: "silShadowNarrow",  viewBox: "0 0 120 24" },
  whale:   { id: "silShadowWhale",   viewBox: "0 0 360 80" },
};

export type LaneConfig = {
  shape: Shape;
  /** "lr" (default) or "rl" — left-to-right or right-to-left drift. */
  direction?: Direction;
  /** CSS top value, e.g. "30%" or "65%". Position from top of the wrapper. */
  top: string;
  /** Rendered SVG width in px. Height auto-derives from viewBox aspect. */
  width: number;
  /** Drift cycle in seconds (desktop). Mobile multiplies by --uw-mobile-factor. */
  duration: number;
  /** Negative seconds so the lane doesn't enter at t=0. Stagger across lanes. */
  delay: number;
  /** 0.6–1.1 typical. Multiplies the zone's --uw-opacity per lane. Defaults to 1.0. */
  opacityMod?: number;
  /** Vertical bob amplitude in px at the midpoint of the drift. Negative = up,
   *  positive = down. Omit to let the lane index pick a varied default. */
  bob?: number;
  /** Hide on viewports under 768px. Use to thin the lane count on mobile. */
  mobileHide?: boolean;
};

/** Default bob amplitudes cycled by lane index so each lane visibly rides
 *  a different swell without the page config needing to specify. Mixed
 *  magnitudes keep the layer from feeling like one shared waveform. */
const DEFAULT_BOBS_LR = [-14, -22, -10, -18, -26, -12];
const DEFAULT_BOBS_RL = [10, 16, 8, 20, 12, 6];

export interface UnderwaterLayerProps {
  zone: Zone;
  lanes: LaneConfig[];
  /** Negate <main>'s py-8 top padding so the layer sits flush against the
   *  sticky header. Use on routes where the wrapper is the first element
   *  inside <main> (i.e. anything without a hero above it). */
  flushTop?: boolean;
  children: ReactNode;
}

export function UnderwaterLayer({ zone, lanes, flushTop, children }: UnderwaterLayerProps) {
  // -mb-8 is unconditional: every route's wrapper sits above the same footer,
  // and <main>'s py-8 left a 32px black strip below the layer on every page.
  return (
    <div
      className={`underwater relative w-screen -mb-8${flushTop ? " -mt-8" : ""}`}
      data-zone={zone}
      style={{ marginLeft: "calc(50% - 50vw)" }}
    >
      <div className="uw-depth" aria-hidden="true" />
      <div className="uw-thermocline" aria-hidden="true" />
      <div className="uw-caustic" aria-hidden="true" />
      <span className="uw-bubble uw-bubble-1" aria-hidden="true" />
      <span className="uw-bubble uw-bubble-2" aria-hidden="true" />
      <span className="uw-bubble uw-bubble-3" aria-hidden="true" />
      <div className="uw-swimmers" aria-hidden="true">
        {lanes.map((lane, i) => {
          const ref = SHAPE_REFS[lane.shape];
          const reverse = lane.direction === "rl";
          const opacityMod = lane.opacityMod ?? 1.0;
          const defaultBobs = reverse ? DEFAULT_BOBS_RL : DEFAULT_BOBS_LR;
          const bob = lane.bob ?? defaultBobs[i % defaultBobs.length];
          const style: CSSProperties = {
            top: lane.top,
            width: `${lane.width}px`,
            height: "auto",
            animationDelay: `${lane.delay}s`,
            opacity: `calc(var(--uw-opacity) * ${opacityMod})`,
            // Custom property consumed by .uw-swim's animation-duration calc.
            ["--uw-base-duration" as string]: `${lane.duration}s`,
            // Custom property consumed by the keyframes' translateY() midpoint.
            ["--uw-bob" as string]: `${bob}px`,
          };
          const className = [
            "uw-swim",
            reverse ? "uw-reverse" : "",
            lane.mobileHide ? "uw-mobile-hide" : "",
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <svg
              key={i}
              className={className}
              viewBox={ref.viewBox}
              preserveAspectRatio="xMidYMid meet"
              style={style}
            >
              <use href={`#${ref.id}`} />
            </svg>
          );
        })}
      </div>
      {/* When the wrapper is pulled up to the header (-mt-8), the inner
          content would otherwise hug the header line. pt-8 restores the
          ~32px of breathing room <main>'s py-8 used to provide. Bottom
          stays at -mb-8 only — no content sits near the bottom edge. */}
      <div
        className={`uw-content mx-auto max-w-[1440px] px-5 md:px-10${flushTop ? " pt-8" : ""}`}
      >
        {children}
      </div>
    </div>
  );
}
