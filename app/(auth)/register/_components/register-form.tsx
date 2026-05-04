"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { registerAction, type RegisterState } from "@/lib/actions/register";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleIcon } from "@/components/icons";
import { Pokeball } from "@/components/icons/pokeball";

const initialState: RegisterState = { error: null };

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(
    registerAction,
    initialState,
  );

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <Card
      className={[
        "relative isolate w-full gap-6 rounded-3xl border-2 border-transparent px-6 py-8 ring-1 ring-foreground/5 shadow-[0_30px_80px_-20px_oklch(0.395_0.155_261/0.25)]",
        "[background:linear-gradient(var(--card),var(--card))_padding-box,conic-gradient(from_var(--holo-angle),var(--color-holo-magenta),var(--color-holo-cyan),var(--color-holo-amber),var(--color-holo-mint),var(--color-holo-peri),var(--color-holo-magenta))_border-box]",
        "motion-safe:[animation:holo-spin_12s_linear_infinite]",
        "dark:shadow-[0_30px_80px_-10px_oklch(0_0_0/0.7)]",
      ].join(" ")}
    >
      {/* Hero: pokeball + eyebrow */}
      <div className="relative flex flex-col items-center gap-3 pt-2">
        <span className="relative isolate inline-block size-24 motion-safe:[animation:pokeball-float_6s_ease-in-out_infinite]">
          <Pokeball className="size-full" />
          <span
            aria-hidden
            className={[
              "pointer-events-none absolute inset-0 rounded-full",
              "[clip-path:circle(46%_at_50%_50%)]",
              "[background:conic-gradient(from_var(--holo-angle),oklch(0.85_0.18_330/0.6),oklch(0.85_0.18_215/0.55),oklch(0.92_0.16_75/0.55),oklch(0.85_0.18_165/0.55),oklch(0.85_0.18_330/0.6))]",
              "mix-blend-overlay opacity-70",
              "dark:mix-blend-screen dark:opacity-50",
              "motion-safe:[animation:holo-spin_5s_linear_infinite]",
            ].join(" ")}
          />
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
          New trainer
        </span>
      </div>

      <CardHeader className="text-center">
        <CardTitle className="font-heading text-4xl font-medium tracking-tight">
          Start your Pokédex.
        </CardTitle>
        <CardDescription className="mt-1.5">
          Create an account to begin tracking.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>
          {state.error && (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          )}
          <Button type="submit" size="lg" disabled={pending} className="mt-1">
            {pending ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <div
          role="separator"
          className="relative my-1 text-center text-xs uppercase tracking-[0.22em] text-muted-foreground/70"
        >
          <span className="relative z-10 bg-card px-3">or</span>
          <span
            aria-hidden
            className="absolute inset-x-0 top-1/2 -z-0 h-px bg-border"
          />
        </div>

        <Button
          variant="outline"
          size="lg"
          render={<a href="/api/auth/google/start" />}
          nativeButton={false}
        >
          <GoogleIcon className="size-4" />
          Continue with Google
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
