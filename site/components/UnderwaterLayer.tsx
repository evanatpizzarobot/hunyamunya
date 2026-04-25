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
  /** Hide on viewports under 768px. Use to thin the lane count on mobile. */
  mobileHide?: boolean;
};

export interface UnderwaterLayerProps {
  zone: Zone;
  lanes: LaneConfig[];
  children: ReactNode;
}

export function UnderwaterLayer({ zone, lanes, children }: UnderwaterLayerProps) {
  return (
    <div
      className="underwater relative w-screen"
      data-zone={zone}
      style={{ marginLeft: "calc(50% - 50vw)" }}
    >
      <div className="uw-depth" aria-hidden="true" />
      <div className="uw-caustic" aria-hidden="true" />
      <div className="uw-swimmers" aria-hidden="true">
        {lanes.map((lane, i) => {
          const ref = SHAPE_REFS[lane.shape];
          const reverse = lane.direction === "rl";
          const opacityMod = lane.opacityMod ?? 1.0;
          const style: CSSProperties = {
            top: lane.top,
            width: `${lane.width}px`,
            height: "auto",
            animationDelay: `${lane.delay}s`,
            opacity: `calc(var(--uw-opacity) * ${opacityMod})`,
            // Custom property consumed by .uw-swim's animation-duration calc.
            ["--uw-base-duration" as string]: `${lane.duration}s`,
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
      <div className="uw-content mx-auto max-w-[1440px] px-5 md:px-10">
        {children}
      </div>
    </div>
  );
}
