"use client";

import { useState } from "react";

type Props = {
  label: string;
  wordCount: number;
  text: string;
};

// Bio blocks on the press kit. A journalist's actual job here is to take the
// text, so the copy button is the point of the component and the styling is
// deliberately quiet around it.
export function CopyText({ label, wordCount, text }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard is blocked in some embedded views. The text is selectable on
      // the page regardless, so a failure here needs no error state.
    }
  }

  return (
    <div className="border-t border-rule pt-5">
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <span
          className="text-[10px] uppercase text-muted"
          style={{ letterSpacing: "0.22em" }}
        >
          {label} &middot; {wordCount} words
        </span>
        <button
          type="button"
          onClick={copy}
          aria-label={`Copy the ${label.toLowerCase()} bio to the clipboard`}
          className="text-[10px] uppercase text-[color:var(--hm-accent)] underline-offset-4 hover:underline"
          style={{ letterSpacing: "0.2em" }}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="max-w-[68ch] whitespace-pre-line text-[15px] leading-[1.65] text-paper-dim">
        {text}
      </p>
    </div>
  );
}
