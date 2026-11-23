"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Container } from "./Container";
import { contactLink, navGroups, utilityLinks } from "@/lib/nav";
import { SiteLink } from "@/components/ui/SiteLink";

const UNIVERSITY_HOME = "https://www.catholic.edu/";

function Chevron({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 12 8"
      className={`h-2 w-3 shrink-0 ${className}`}
    >
      <path d="M1 1.5 6 6.5 11 1.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [openId, setOpenId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [condensed, setCondensed] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  const headerRef = useRef<HTMLElement | null>(null);
  const triggers = useRef<Record<string, HTMLButtonElement | null>>({});
  const menuButton = useRef<HTMLButtonElement | null>(null);
  // Hover opens a panel for as long as the pointer is in the header region. A
  // click pins it, and the pin belongs to the trigger that was clicked, so the
  // click that lands on the button the hover already opened is treated as a
  // pin, not as a close. Clicking that same trigger again closes it.
  const pinnedId = useRef<string | null>(null);
  const closeTimer = useRef<number | null>(null);

  const activeGroup = navGroups.find((g) =>
    g.match.some((m) => pathname === m || pathname.startsWith(`${m}/`)),
  );

  function cancelClose() {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function closePanel() {
    cancelClose();
    pinnedId.current = null;
    setOpenId(null);
  }

  // Whenever no panel is open, the pin and any pending close are released.
  // Kept in an effect because refs cannot be touched during render, which is
  // where the route-change reset below happens.
  useEffect(() => {
    if (openId) return;
    pinnedId.current = null;
    cancelClose();
  }, [openId]);

  // This header stays mounted across routes, so an open menu has to be closed
  // when the route changes. React's documented way to reset state on a change
  // is during render, not in an effect.
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setDrawerOpen(false);
    setOpenId(null);
  }

  useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!openId && !drawerOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      cancelClose();
      if (event.key !== "Escape") return;
      pinnedId.current = null;
      if (openId) {
        const id = openId;
        setOpenId(null);
        triggers.current[id]?.focus();
        return;
      }
      setDrawerOpen(false);
      menuButton.current?.focus();
    };
    const onPointerDown = (event: MouseEvent) => {
      if (!headerRef.current) return;
      if (headerRef.current.contains(event.target as Node)) return;
      cancelClose();
      pinnedId.current = null;
      setOpenId(null);
      setDrawerOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [openId, drawerOpen]);

  const openGroup = navGroups.find((g) => g.id === openId) ?? null;

  return (
    <header ref={headerRef} className="sticky top-0 z-50">
      {/* Tier 1: the university. Official logo, never recoloured. */}
      <div className="border-b border-grey/35 bg-white">
        <Container wide>
          <div
            className={`flex items-center justify-between gap-6 transition-[padding] duration-200 ${
              condensed ? "py-2" : "py-2.5 md:py-3"
            }`}
          >
            <a
              href={UNIVERSITY_HOME}
              className="focus-ring inline-flex items-center"
              aria-label="The Catholic University of America home"
            >
              <Image
                src="/brand/cua-logo-horizontal.svg"
                alt=""
                width={594}
                height={46}
                unoptimized
                className={`w-auto transition-all duration-200 ${
                  condensed ? "h-[19px] md:h-[22px]" : "h-[17px] md:h-[23px]"
                }`}
                priority
              />
            </a>

            <ul className="hidden items-center gap-5 md:flex">
              {utilityLinks.map((link) => (
                <li key={link.label}>
                  <SiteLink
                    link={link}
                    className="eyebrow text-catholic-red underline-offset-4 hover:underline hover:decoration-2"
                  />
                </li>
              ))}
            </ul>

            <Link
              href="/programs-admission/request-information"
              className="focus-ring eyebrow rounded-full bg-catholic-red px-3.5 py-1.5 text-white hover:bg-white hover:text-catholic-red md:hidden"
            >
              Request Info
            </Link>
          </div>
        </Container>
      </div>

      {/* Tier 2: the college. Full-bleed, so the bar never crops the nav.
          The mouseleave region covers both the bar and the panel under it. */}
      <div
        className="relative bg-catholic-blue text-white"
        onMouseLeave={() => {
          cancelClose();
          // Small delay so the pointer can cross the gap to the panel, or to a
          // neighbour trigger, without the menu flickering shut. Leaving the
          // region always closes, including a panel pinned by a click, so an
          // open menu can never sit on top of the page while the reader has
          // moved on.
          closeTimer.current = window.setTimeout(closePanel, 160);
        }}
        onMouseEnter={() => {
          // Back inside the region with nothing under the pointer: drop any
          // panel the last visit left open.
          cancelClose();
          setOpenId(null);
        }}
      >
        <Container wide>
          <div
            className={`flex items-center gap-5 transition-[padding] duration-200 md:gap-8 ${
              condensed ? "py-2.5" : "py-3 md:py-3.5"
            }`}
          >
            <Link
              href="/"
              className="focus-ring font-headline max-w-[18rem] shrink-0 text-[15px] font-bold leading-[1.15] md:max-w-[21rem] md:text-[19px]"
            >
              College of Engineering, Physics, and Computing
            </Link>

            <nav aria-label="Primary" className="ml-auto hidden lg:block">
              <ul className="flex items-center gap-1">
                {navGroups.map((group) => {
                  const open = openId === group.id;
                  const current = activeGroup?.id === group.id;
                  return (
                    <li key={group.id}>
                      <button
                        ref={(node) => {
                          triggers.current[group.id] = node;
                        }}
                        id={`trigger-${group.id}`}
                        type="button"
                        aria-expanded={open}
                        aria-controls={`panel-${group.id}`}
                    onClick={() => {
                      cancelClose();
                      if (open && pinnedId.current === group.id) {
                        // Clicking the trigger that already holds the pin
                        // closes the panel.
                        closePanel();
                        return;
                      }
                      pinnedId.current = group.id;
                      setOpenId(group.id);
                    }}
                    onMouseEnter={() => {
                      // Hover swaps which panel is visible. A panel pinned by
                      // an earlier click stays pinned, so moving along the bar
                      // keeps a panel open rather than flickering shut.
                      cancelClose();
                      setOpenId(group.id);
                    }}
                        className={`focus-ring-dark flex min-h-10 items-center gap-1.5 rounded-sm px-3 text-sm font-medium transition-colors ${
                          open ? "bg-white/12" : "hover:bg-white/8"
                        }`}
                      >
                        <span className="relative py-1">
                          {group.label}
                          <span
                            aria-hidden="true"
                            className={`absolute -bottom-0.5 left-0 h-[2px] w-full origin-left bg-bright-red transition-transform duration-200 ${
                              current ? "scale-x-100" : "scale-x-0"
                            }`}
                          />
                        </span>
                        <Chevron className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
                      </button>
                    </li>
                  );
                })}
                <li>
                  <Link
                    href={contactLink.href}
                    className="focus-ring-dark block min-h-10 rounded-sm px-3 py-2 text-sm font-medium hover:bg-white/8"
                  >
                    {contactLink.label}
                  </Link>
                </li>
              </ul>
            </nav>

            <button
              ref={menuButton}
              type="button"
              aria-expanded={drawerOpen}
              aria-controls="mobile-nav"
              onClick={() => setDrawerOpen((v) => !v)}
              className="focus-ring-dark ml-auto flex min-h-11 items-center gap-2 rounded-sm px-2 lg:hidden"
            >
              <span className="eyebrow">{drawerOpen ? "Close" : "Menu"}</span>
              <span aria-hidden="true" className="flex flex-col gap-[3px]">
                <span
                  className={`block h-[2px] w-5 bg-white transition-transform duration-200 ${
                    drawerOpen ? "translate-y-[5px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`block h-[2px] w-5 bg-white transition-opacity duration-150 ${
                    drawerOpen ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`block h-[2px] w-5 bg-white transition-transform duration-200 ${
                    drawerOpen ? "-translate-y-[5px] -rotate-45" : ""
                  }`}
                />
              </span>
            </button>
          </div>
        </Container>

        {/* Mega panel: one row of columns plus a featured card. */}
        {openGroup ? (
          <div
            id={`panel-${openGroup.id}`}
            role="region"
            aria-labelledby={`trigger-${openGroup.id}`}
            className="animate-panel absolute inset-x-0 top-full hidden border-b border-grey/40 bg-white text-black shadow-[0_20px_34px_-24px_rgba(10,50,85,0.75)] lg:block"
          >
            <Container wide className="py-7">
              {/* Three link columns, then the feature as a fourth column so the
                  panel reads as one grid instead of a list with a photo parked
                  underneath it. */}
              <div className="grid grid-cols-[repeat(3,minmax(0,1fr))_19rem] gap-x-8">
                {openGroup.columns.map((column) => (
                  <div key={column.heading}>
                    <h2 className="eyebrow text-catholic-blue/80">{column.heading}</h2>
                    <ul className="mt-3 space-y-3.5">
                      {column.links.map((link) => (
                        <li key={link.href}>
                          <SiteLink
                            link={link}
                            className="block font-headline text-[15px] font-medium leading-tight text-catholic-blue hover:text-catholic-red hover:underline hover:decoration-1 hover:underline-offset-4"
                          />
                          {link.note ? (
                            <p className="mt-0.5 text-[13px] leading-snug text-black/75">
                              {link.note}
                            </p>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                <Link
                  href={openGroup.feature.href}
                  className="focus-ring group flex flex-col overflow-hidden rounded-sm border border-grey/35 bg-sandstone"
                >
                  <Image
                    src={openGroup.feature.image}
                    alt=""
                    width={1200}
                    height={801}
                    className="aspect-[3/2] w-full object-cover"
                  />
                  <span className="flex flex-1 flex-col p-4">
                    <span className="font-headline block text-[15px] font-bold leading-tight text-catholic-blue group-hover:text-catholic-red">
                      {openGroup.feature.title}
                    </span>
                    <span className="mt-1.5 block flex-1 text-[13px] leading-snug text-black/75">
                      {openGroup.feature.line}
                    </span>
                    <span className="eyebrow mt-3 inline-flex items-center gap-1.5 text-catholic-red">
                      Learn more
                      <Chevron className="rotate-[-90deg] text-catholic-red" />
                    </span>
                  </span>
                  <span className="sr-only">{openGroup.feature.alt}</span>
                </Link>
              </div>
            </Container>
          </div>
        ) : null}

        {/* Drawer: same three sections, as native disclosures. */}
        {drawerOpen ? (
          <div
            id="mobile-nav"
            className="absolute inset-x-0 top-full max-h-[calc(100dvh-120px)] overflow-y-auto border-b border-grey/40 bg-white px-4 py-4 text-black shadow-[0_20px_34px_-24px_rgba(10,50,85,0.75)] lg:hidden"
          >
            <nav aria-label="Sections">
              <ul className="divide-y divide-grey/35">
                {navGroups.map((group) => (
                  <li key={group.id}>
                    <details className="group" open={activeGroup?.id === group.id}>
                      <summary className="focus-ring flex min-h-12 cursor-pointer list-none items-center justify-between gap-2 font-headline text-[17px] font-bold text-catholic-blue [&::-webkit-details-marker]:hidden">
                        {group.label}
                        <Chevron className="text-catholic-red transition-transform duration-150 group-open:rotate-180" />
                      </summary>
                      <div className="pb-4">
                        {group.columns.map((column) => (
                          <div key={column.heading}>
                            <p className="eyebrow pt-2 text-catholic-blue/80">{column.heading}</p>
                            <ul className="mt-2 space-y-2.5 pb-3">
                              {column.links.map((link) => (
                                <li key={link.href}>
                                  <SiteLink
                                    link={link}
                                    onNavigate={() => setDrawerOpen(false)}
                                    className="block text-[15px] leading-snug text-black"
                                  />
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </details>
                  </li>
                ))}
                <li>
                  <SiteLink
                    link={contactLink}
                    onNavigate={() => setDrawerOpen(false)}
                    className="flex min-h-12 font-headline text-[17px] font-bold text-catholic-blue"
                  />
                </li>
              </ul>
            </nav>

            <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 border-t border-grey/35 pt-4">
              {utilityLinks.map((link) => (
                <li key={link.label}>
                  <SiteLink link={link} className="eyebrow text-catholic-red" />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </header>
  );
}
