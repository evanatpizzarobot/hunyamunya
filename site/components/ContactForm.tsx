"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Purpose = "" | "submission" | "press" | "licensing" | "general";

type SubmitState =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "error"; message: string }
  | { kind: "success"; id: string };

const ENDPOINT = "/contact-submit.php";
const MESSAGE_MAX = 3000;
const MESSAGE_MIN = 20;

function isLikelyEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function isHttpsUrl(v: string): boolean {
  try {
    const u = new URL(v);
    return u.protocol === "https:";
  } catch {
    return false;
  }
}

export function ContactForm() {
  const [purpose, setPurpose] = useState<Purpose>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [artistName, setArtistName] = useState("");
  const [musicLink, setMusicLink] = useState("");
  const [genre, setGenre] = useState("");
  const [outlet, setOutlet] = useState("");
  const [company, setCompany] = useState("");
  const [projectType, setProjectType] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [submitState, setSubmitState] = useState<SubmitState>({ kind: "idle" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const timestampRef = useRef<string>("");

  useEffect(() => {
    timestampRef.current = String(Math.floor(Date.now() / 1000));
  }, []);

  const requiredComplete =
    name.trim().length > 0 &&
    isLikelyEmail(email.trim()) &&
    purpose !== "" &&
    message.trim().length >= MESSAGE_MIN &&
    (purpose !== "submission" || isHttpsUrl(musicLink.trim()));

  function validate(): Record<string, string> {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Please add your name.";
    if (!isLikelyEmail(email.trim())) errs.email = "Email looks off. Mind double-checking?";
    if (purpose === "") errs.purpose = "Let us know what this is about.";
    if (message.trim().length < MESSAGE_MIN) errs.message = `Minimum ${MESSAGE_MIN} characters.`;
    if (message.length > MESSAGE_MAX) errs.message = `Maximum ${MESSAGE_MAX} characters.`;
    if (purpose === "submission" && !isHttpsUrl(musicLink.trim())) {
      errs.music_link = "Music link should be a full https:// URL.";
    }
    return errs;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      setSubmitState({ kind: "error", message: "Please check the form and try again." });
      return;
    }

    setSubmitState({ kind: "sending" });

    const body = new URLSearchParams();
    body.set("name", name);
    body.set("email", email);
    body.set("purpose", purpose);
    body.set("message", message);
    if (purpose === "submission") {
      if (artistName) body.set("artist_name", artistName);
      body.set("music_link", musicLink);
      if (genre) body.set("genre", genre);
    } else if (purpose === "press" && outlet) {
      body.set("outlet", outlet);
    } else if (purpose === "licensing") {
      if (company) body.set("company", company);
      if (projectType) body.set("project_type", projectType);
    }
    body.set("website", website);
    body.set("_t", timestampRef.current);

    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-Requested-With": "fetch",
          Accept: "application/json",
        },
        body: body.toString(),
      });

      if (res.status === 429) {
        setSubmitState({
          kind: "error",
          message: "Too many submissions right now. Please try again in a few minutes.",
        });
        return;
      }
      if (!res.ok) {
        setSubmitState({
          kind: "error",
          message:
            "Something went wrong on our end. Please try again, or email contact@hunyamunyarecords.com directly.",
        });
        return;
      }

      const data = await res.json().catch(() => ({ ok: true, id: "" }));
      setSubmitState({ kind: "success", id: String(data.id || "") });
    } catch {
      setSubmitState({
        kind: "error",
        message:
          "Couldn't reach the server. Please try again, or email contact@hunyamunyarecords.com directly.",
      });
    }
  }

  function resetForm() {
    setPurpose("");
    setName("");
    setEmail("");
    setMessage("");
    setArtistName("");
    setMusicLink("");
    setGenre("");
    setOutlet("");
    setCompany("");
    setProjectType("");
    setWebsite("");
    setFieldErrors({});
    setSubmitState({ kind: "idle" });
    timestampRef.current = String(Math.floor(Date.now() / 1000));
  }

  if (submitState.kind === "success") {
    return (
      <section role="status" aria-live="polite" className="rounded-sm border border-neutral-800 p-6 md:p-8">
        <h2 className="font-serif text-2xl text-neutral-50">Message received.</h2>
        <p className="mt-3 text-neutral-300">
          Thanks for writing. We read every submission ourselves; if you&rsquo;re hoping for a response, it might take a few weeks. Check your inbox for a quick acknowledgment
          {submitState.id ? (
            <>
              {" "}with your submission ID: <strong className="font-mono text-neutral-100">{submitState.id}</strong>.
            </>
          ) : (
            <>.</>
          )}
        </p>
        <p className="mt-3 text-neutral-300">
          In the meantime, the <Link href="/catalog" className="underline underline-offset-4">catalog</Link> is open, and new releases go out through the{" "}
          <Link href="/news" className="underline underline-offset-4">news</Link> feed.
        </p>
        <p className="mt-6 text-sm">
          <button
            type="button"
            onClick={resetForm}
            className="text-neutral-400 underline-offset-4 hover:text-neutral-100 hover:underline"
          >
            ← Send another message
          </button>
        </p>
      </section>
    );
  }

  return (
    <form
      method="POST"
      action={ENDPOINT}
      onSubmit={handleSubmit}
      noValidate
      className="space-y-5"
      aria-describedby={submitState.kind === "error" ? "form-error" : undefined}
    >
      {submitState.kind === "error" ? (
        <div
          id="form-error"
          role="alert"
          className="rounded-sm border border-rose-900/60 bg-rose-950/50 px-4 py-3 text-sm text-rose-100"
        >
          {submitState.message}
        </div>
      ) : null}

      <Field label="Name" htmlFor="name" required error={fieldErrors.name}>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          aria-required="true"
          aria-invalid={Boolean(fieldErrors.name)}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="field"
        />
      </Field>

      <Field label="Email" htmlFor="email" required error={fieldErrors.email}>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          aria-required="true"
          aria-invalid={Boolean(fieldErrors.email)}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field"
        />
      </Field>

      <Field label="What's this about?" htmlFor="purpose" required error={fieldErrors.purpose}>
        <select
          id="purpose"
          name="purpose"
          required
          aria-required="true"
          aria-invalid={Boolean(fieldErrors.purpose)}
          value={purpose}
          onChange={(e) => setPurpose(e.target.value as Purpose)}
          className="field"
        >
          <option value="">Choose one</option>
          <option value="submission">Submit music</option>
          <option value="press">Press / Media</option>
          <option value="licensing">Licensing / Sync</option>
          <option value="general">General</option>
        </select>
      </Field>

      {/* Conditional: submission */}
      <fieldset hidden={purpose !== "submission"} aria-hidden={purpose !== "submission"} className="space-y-5 border-0 p-0">
        <Field label="Artist name" htmlFor="artist_name" hint="Only if different from your name above.">
          <input
            id="artist_name"
            name="artist_name"
            type="text"
            value={artistName}
            onChange={(e) => setArtistName(e.target.value)}
            className="field"
          />
        </Field>
        <Field
          label="Music link"
          htmlFor="music_link"
          required={purpose === "submission"}
          hint="Bandcamp, SoundCloud, Google Drive, WeTransfer, private streaming link. Any https:// URL."
          error={fieldErrors.music_link}
        >
          <input
            id="music_link"
            name="music_link"
            type="url"
            inputMode="url"
            required={purpose === "submission"}
            aria-required={purpose === "submission"}
            aria-invalid={Boolean(fieldErrors.music_link)}
            value={musicLink}
            onChange={(e) => setMusicLink(e.target.value)}
            className="field"
          />
        </Field>
        <Field label="Genre / style" htmlFor="genre" hint="One line. Free text.">
          <input
            id="genre"
            name="genre"
            type="text"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="field"
          />
        </Field>
      </fieldset>

      {/* Conditional: press */}
      <fieldset hidden={purpose !== "press"} aria-hidden={purpose !== "press"} className="space-y-5 border-0 p-0">
        <Field label="Outlet" htmlFor="outlet" hint="Publication, station, show, podcast.">
          <input
            id="outlet"
            name="outlet"
            type="text"
            value={outlet}
            onChange={(e) => setOutlet(e.target.value)}
            className="field"
          />
        </Field>
      </fieldset>

      {/* Conditional: licensing */}
      <fieldset hidden={purpose !== "licensing"} aria-hidden={purpose !== "licensing"} className="space-y-5 border-0 p-0">
        <Field label="Company" htmlFor="company" hint="Production company, agency, etc.">
          <input
            id="company"
            name="company"
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="field"
          />
        </Field>
        <Field label="Project type" htmlFor="project_type" hint="Indie film, video game trailer, TV pilot, etc.">
          <input
            id="project_type"
            name="project_type"
            type="text"
            value={projectType}
            onChange={(e) => setProjectType(e.target.value)}
            className="field"
          />
        </Field>
      </fieldset>

      <Field label="Message" htmlFor="message" required error={fieldErrors.message}>
        <textarea
          id="message"
          name="message"
          required
          minLength={MESSAGE_MIN}
          maxLength={MESSAGE_MAX}
          aria-required="true"
          aria-invalid={Boolean(fieldErrors.message)}
          rows={8}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="field resize-y"
        />
        <div className={`mt-1 text-right text-xs ${message.length > MESSAGE_MAX - 100 ? "text-rose-300" : "text-neutral-500"}`}>
          {message.length} / {MESSAGE_MAX}
        </div>
      </Field>

      {/* Honeypot: off-screen, not focusable, autocomplete off. */}
      <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="website">Website (leave blank)</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <input type="hidden" name="_t" value={timestampRef.current} />

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!requiredComplete || submitState.kind === "sending"}
          className="w-full border border-neutral-100 bg-neutral-100 px-5 py-3 text-sm font-medium text-neutral-950 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:border-neutral-700 disabled:bg-neutral-800 disabled:text-neutral-500 md:w-auto"
        >
          {submitState.kind === "sending" ? "Sending..." : "Send message"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm text-neutral-300">
        {label}
        {required ? <span aria-hidden="true" className="ml-1 text-neutral-500">*</span> : null}
      </label>
      {hint ? <p className="mt-1 text-xs text-neutral-500">{hint}</p> : null}
      <div className="mt-2">{children}</div>
      {error ? (
        <p role="alert" className="mt-1 text-xs text-rose-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}
