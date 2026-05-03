import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-background">
      {/* Layer 1: drifting prismatic orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20"
      >
        <div className="auth-orb absolute -top-32 -left-24 size-[420px] rounded-full bg-holo-rose/25 blur-[120px] motion-safe:[animation:orb-drift-a_38s_ease-in-out_infinite_alternate] dark:bg-holo-rose/18" />
        <div className="auth-orb absolute top-1/3 -right-32 size-[480px] rounded-full bg-holo-mint/22 blur-[120px] motion-safe:[animation:orb-drift-b_44s_ease-in-out_infinite_alternate] dark:bg-holo-cyan/18" />
        <div className="auth-orb absolute -bottom-24 left-1/4 size-[440px] rounded-full bg-holo-peri/25 blur-[120px] motion-safe:[animation:orb-drift-c_50s_ease-in-out_infinite_alternate] dark:bg-holo-magenta/18" />
        <div className="auth-orb absolute top-10 right-1/4 size-[300px] rounded-full bg-holo-amber/18 blur-[120px] motion-safe:[animation:orb-drift-a_60s_ease-in-out_infinite_alternate] dark:bg-holo-amber/14" />
      </div>

      {/* Layer 2: dot grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.05] [background-image:radial-gradient(circle_at_center,var(--foreground)_1px,transparent_1px)] [background-size:24px_24px] dark:opacity-[0.07]"
      />

      {/* Layer 3: subtle grain via SVG noise */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 mix-blend-overlay opacity-[0.04] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      {/* Theme toggle */}
      <div className="absolute right-4 top-4 z-20 md:right-6 md:top-6">
        <ThemeToggle />
      </div>

      <main className="relative flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 motion-safe:duration-500">
          {children}
        </div>
        {/* Brand foot */}
        <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground/70">
          Pokédex Tracker · v0.1
        </p>
      </main>
    </div>
  );
}
