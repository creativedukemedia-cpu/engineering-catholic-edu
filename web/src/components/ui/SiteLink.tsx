import Link from "next/link";
import { type NavLink } from "@/lib/nav";

export function isInternal(href: string) {
  return href.startsWith("/");
}

/**
 * The one link renderer for the whole site.
 *
 * Links whose redesigned page exists stay in the app. Links whose page is not
 * built yet point at the current site and open in a new tab, and the title
 * says so before the click rather than after. Nothing gets invented and no
 * production path is renamed while those pages migrate.
 */
export function SiteLink({
  link,
  className = "",
  onNavigate,
  children,
}: {
  link: NavLink;
  className?: string;
  onNavigate?: () => void;
  children?: React.ReactNode;
}) {
  const label = children ?? link.label;
  const props = {
    href: link.href,
    className: `focus-ring ${className}`,
    onClick: onNavigate,
    ...(link.currentSite ? { title: "Opens the current site in a new tab" } : null),
  };
  return isInternal(link.href) ? (
    <Link {...props}>{label}</Link>
  ) : (
    <a {...props} target="_blank" rel="noopener noreferrer">
      {label}
    </a>
  );
}

/** External link that is not part of the nav data, e.g. a news story. */
export function OutboundLink({
  href,
  className = "",
  children,
  hint = "Opens the current site in a new tab",
  onDark = false,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
  hint?: string;
  /** On a dark surface the focus ring flips to white (WCAG 2.2 SC 2.4.13). */
  onDark?: boolean;
}) {
  const tone = onDark ? `focus-ring focus-ring-dark ${className}` : `focus-ring ${className}`;
  if (isInternal(href)) {
    return (
      <Link href={href} className={tone}>
        {children}
      </Link>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={hint}
      className={tone}
    >
      {children}
    </a>
  );
}
