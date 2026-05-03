"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import {
  registerAction,
  type RegisterState,
} from "@/lib/actions/register";
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
    <Card className="w-full gap-6 border-0 bg-transparent py-0 ring-0">
      <CardHeader className="px-0">
        <CardTitle className="text-3xl font-light tracking-tight">
          Begin your saga
        </CardTitle>
        <CardDescription className="mt-1">
          Create an account to start managing your campaigns.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 px-0">
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
          <Button
            type="submit"
            size="lg"
            disabled={pending}
            className="mt-1"
          >
            {pending ? "Creating account…" : "Create account"}
          </Button>
        </form>
        <div
          role="separator"
          className="relative my-1 text-center text-xs uppercase tracking-[0.18em] text-muted-foreground/70"
        >
          <span className="relative z-10 bg-background px-3">or</span>
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
