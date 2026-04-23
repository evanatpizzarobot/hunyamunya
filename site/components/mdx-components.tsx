import type { AnchorHTMLAttributes } from "react";

function isExternal(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

function Anchor({ href, children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (href && isExternal(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  }
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}

export const mdxComponents = {
  a: Anchor,
};
