import Link from "next/link";

type Props = {
  className?: string;
};

/**
 * Email display. Text stays obfuscated as `contact[at]hunyamunyarecords[dot]com`
 * in the rendered DOM to frustrate casual text scrapers, but the element is a
 * real `mailto:` anchor so clicking still opens the user's mail client. Bots
 * that read the href get the real address; bots that only scrape visible text
 * do not. This is cosmetic anti-spam, intentionally lightweight.
 *
 * Intentionally a server component: no hydration-swap, no client state. The
 * static HTML delivered by SSR is what stays on the page.
 */
export function ContactEmail({ className = "" }: Props) {
  const local = "contact";
  const domain = "hunyamunyarecords.com";
  const display = `${local}[at]${domain.split(".").join("[dot]")}`;

  return (
    <Link
      href={`mailto:${local}@${domain}`}
      className={`${className} underline-offset-[8px] decoration-[color:var(--hm-accent)]/0 transition-all duration-300 hover:underline hover:decoration-[color:var(--hm-accent)]`}
    >
      {display}
    </Link>
  );
}
