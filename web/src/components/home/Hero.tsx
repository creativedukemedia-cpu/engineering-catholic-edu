import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";

/**
 * Hero for the College of Engineering, Physics, and Computing.
 *
 * The background is the college's own aerial still
 * (`public/media/hero-campus-aerial.jpg`, pulled from the live homepage on
 * 2026-11-23). The live site runs a muted, looping aerial clip over that same
 * still:
 *
 *   https://engineering.catholic.edu/sites/engineering.catholic.edu/files/2026-08/engineering-homepage-video.mp4
 *
 * Cloudflare refuses non-browser requests for the mp4, so it is not vendored
 * here yet. Save it as `public/media/hero-campus-aerial.mp4` and pass
 * `videoSrc="/media/hero-campus-aerial.mp4"` to switch the photo for the clip.
 * The still stays as the poster, so the text contrast does not change.
 */
export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden bg-catholic-blue text-white"
    >
      <div className="absolute inset-0 -z-10">
        <Image
          src="/media/hero-campus-aerial.jpg"
          alt="An aerial view of the Catholic University of America campus, with the Basilica of the National Shrine at left."
          fill
          priority
          fetchPriority="high"
          quality={80}
          sizes="100vw"
          className="hero-photo"
        />
        {/* Catholic Blue scrims only. They darken the plate rather than tinting
            it, so the measured text contrast stays above 7:1. */}
        <div aria-hidden="true" className="absolute inset-0 scrim-vertical" />
        <div aria-hidden="true" className="absolute inset-0 scrim-horizontal" />
        <div aria-hidden="true" className="absolute inset-0 scrim-light" />
      </div>

      <Container
        wide
        className="flex min-h-[420px] flex-col justify-end pb-9 pt-16 sm:min-h-[520px] md:h-[calc(100svh-118px)] md:max-h-[780px] md:min-h-[600px] md:pb-14 md:pt-24"
      >
        <p className="eyebrow animate-rise text-yellow">Lead with Light</p>

        <h1
          id="hero-title"
          className="animate-rise delay-1 font-headline mt-3 max-w-[14ch] text-[clamp(2.15rem,6.2vw,4.3rem)] font-bold leading-[0.97]"
        >
          Hard problems, taken up in service
        </h1>

        <p className="animate-rise delay-2 font-editorial mt-4 max-w-[48ch] text-[clamp(1.05rem,1.8vw,1.3rem)] leading-relaxed">
          Engineering, physics, and computing at The Catholic University of
          America, in Washington, D.C.
        </p>

        <div className="animate-rise delay-3 mt-8 flex flex-wrap items-center gap-4">
          <Button href="/programs-admission/request-information" size="lg">
            Request Info
          </Button>
          <Button
            href="/programs-admission/undergraduate-programs"
            variant="secondary"
            size="lg"
            onDark
          >
            Explore Programs
          </Button>
          <Button href="/programs-admission/visit" variant="quiet" size="lg" onDark>
            Plan a visit
          </Button>
        </div>
      </Container>

      <div aria-hidden="true" className="horizon-rule" />
    </section>
  );
}
