"use client";

import { useEffect, useState } from "react";

type FontSet = "a" | "b" | "c";

const SETS: { id: FontSet; label: string; blurb: string }[] = [
  { id: "a", label: "A · Editorial", blurb: "Inter / Source Serif 4 / JetBrains Mono" },
  { id: "b", label: "B · Modernist", blurb: "Inter only / IBM Plex Mono" },
  { id: "c", label: "C · Character", blurb: "Space Grotesk / Fraunces / Space Mono" },
];

const STORAGE_KEY = "hm.font-set";

function isFontSet(v: string | null): v is FontSet {
  return v === "a" || v === "b" || v === "c";
}

export function FontExperimentSwitcher() {
  const [set, setSet] = useState<FontSet>("a");
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    const fromUrl = url.searchParams.get("font");
    const fromStorage = window.localStorage.getItem(STORAGE_KEY);
    const initial = isFontSet(fromUrl)
      ? fromUrl
      : isFontSet(fromStorage)
        ? fromStorage
        : "a";
    setSet(initial);
    document.documentElement.setAttribute("data-font-set", initial);
    if (isFontSet(fromUrl) && fromUrl !== fromStorage) {
      window.localStorage.setItem(STORAGE_KEY, fromUrl);
    }
  }, []);

  function apply(next: FontSet) {
    setSet(next);
    document.documentElement.setAttribute("data-font-set", next);
    window.localStorage.setItem(STORAGE_KEY, next);
    const url = new URL(window.location.href);
    url.searchParams.set("font", next);
    window.history.replaceState({}, "", url.toString());
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!(e.altKey && e.shiftKey)) return;
      if (e.key === "A" || e.key === "a") apply("a");
      if (e.key === "B" || e.key === "b") apply("b");
      if (e.key === "C" || e.key === "c") apply("c");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      className="fixed bottom-4 right-4 z-50 select-none font-mono text-[11px]"
      role="region"
      aria-label="Font experiment switcher (dev only)"
    >
      {collapsed ? (
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="border border-neutral-700 bg-neutral-950/90 px-3 py-2 uppercase tracking-wider text-neutral-300 shadow-lg backdrop-blur hover:border-neutral-500 hover:text-neutral-50"
        >
          Fonts · {set.toUpperCase()}
        </button>
      ) : (
        <div className="w-72 border border-neutral-700 bg-neutral-950/95 p-3 text-neutral-200 shadow-xl backdrop-blur">
          <div className="flex items-center justify-between gap-2 border-b border-neutral-800 pb-2">
            <span className="uppercase tracking-wider text-neutral-400">
              Font experiment · dev only
            </span>
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="text-neutral-500 hover:text-neutral-100"
              aria-label="Collapse font switcher"
            >
              &#8211;
            </button>
          </div>
          <ul className="mt-2 space-y-1">
            {SETS.map((s) => {
              const active = s.id === set;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => apply(s.id)}
                    className={`flex w-full flex-col items-start border px-2 py-2 text-left transition-colors ${
                      active
                        ? "border-neutral-400 bg-neutral-900 text-neutral-50"
                        : "border-neutral-800 hover:border-neutral-600 hover:bg-neutral-900/60"
                    }`}
                    aria-pressed={active}
                  >
                    <span className="uppercase tracking-wider">{s.label}</span>
                    <span className="mt-0.5 normal-case tracking-normal text-neutral-400">
                      {s.blurb}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-[10px] uppercase tracking-wider text-neutral-500">
            Alt+Shift+A/B/C · persists in localStorage
          </p>
        </div>
      )}
    </div>
  );
}
