import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

const NOISE_SVG =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 240 240' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E\")";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-svh flex-col bg-background md:flex-row">
      <div className="absolute right-4 top-4 z-20 md:right-6 md:top-6">
        <ThemeToggle />
      </div>

      <section className="relative flex flex-col items-center justify-center overflow-hidden px-6 pt-14 pb-10 md:w-1/2 md:px-12 md:pt-0 md:pb-0 lg:w-[55%]">
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-accent/40 via-background to-background dark:from-primary/20 dark:via-background dark:to-background"
        />
        <div
          aria-hidden
          className="absolute left-1/2 top-1/2 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[120px] dark:bg-primary/30"
        />
        <div
          aria-hidden
          className="absolute -left-32 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-[100px] sm:h-80 sm:w-80 sm:blur-[120px] dark:bg-primary/35"
        />
        <div
          aria-hidden
          className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-amber-500/15 blur-[100px] sm:h-96 sm:w-96 sm:blur-[120px] dark:bg-amber-500/25"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay dark:opacity-[0.08]"
          style={{ backgroundImage: NOISE_SVG }}
        />

        <div className="relative z-10 flex max-w-lg flex-col items-center text-center motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-700">
          <Link
            href="/"
            aria-label="D&D Manager — home"
            className="rounded-full outline-offset-8 transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-ring"
          >
            <Image
              src="/dnd_logo.png"
              alt="D&D Manager"
              width={360}
              height={360}
              priority
              sizes="(min-width: 1024px) 340px, (min-width: 768px) 280px, (min-width: 640px) 200px, 160px"
              className="h-auto w-[clamp(9rem,32vw,11rem)] drop-shadow-2xl md:w-[clamp(16rem,30vw,18rem)] lg:w-[clamp(18rem,26vw,21rem)]"
            />
          </Link>
          <h1 className="mt-5 font-heading text-3xl font-light leading-[1.05] tracking-tight text-foreground sm:text-4xl md:mt-10 md:text-5xl lg:text-6xl">
            Roll for initiative.
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground sm:text-base md:mt-5">
            Run your campaigns, track your party, and keep every legendary
            moment within reach.
          </p>
        </div>
      </section>

      <main className="relative flex flex-1 flex-col items-center justify-center px-6 pt-10 pb-12 md:px-10 md:py-12">
        <div className="w-full max-w-sm motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 motion-safe:duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
