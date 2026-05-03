"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  resendVerificationAction,
  verifyEmailAction,
  type VerifyEmailState,
} from "@/lib/actions/register";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const verifyInitial: VerifyEmailState = { error: null };
const RESEND_COOLDOWN_S = 60;

type Props = {
  initialEmail: string;
  unverified?: boolean;
};

export function VerifyEmailForm({ initialEmail, unverified = false }: Props) {
  const [code, setCode] = useState("");
  const [verifyState, verifyAction, verifying] = useActionState(
    verifyEmailAction,
    verifyInitial,
  );
  const [resending, startResend] = useTransition();
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (verifyState.error) toast.error(verifyState.error);
  }, [verifyState]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  function handleResend(formData: FormData) {
    startResend(async () => {
      const result = await resendVerificationAction({ error: null }, formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("New code sent. Check your inbox.");
      setCooldown(RESEND_COOLDOWN_S);
    });
  }

  return (
    <Card className="w-full gap-6 border-0 bg-transparent py-0 ring-0">
      <CardHeader className="px-0">
        <CardTitle className="text-3xl font-light tracking-tight">
          Verify your email
        </CardTitle>
        <CardDescription className="mt-1">
          {unverified
            ? "Your account isn't verified yet. Enter the 6-digit code we emailed to you."
            : initialEmail
              ? `We sent a 6-digit code to ${initialEmail}.`
              : "Enter the 6-digit code we emailed to you."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 px-0">
        <form
          action={verifyAction}
          className="flex flex-col items-center gap-5"
        >
          <input type="hidden" name="email" value={initialEmail} />
          <input type="hidden" name="code" value={code} />
          <InputOTP
            maxLength={6}
            value={code}
            onChange={setCode}
            autoFocus
            inputMode="numeric"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <Button
            type="submit"
            size="lg"
            disabled={verifying || code.length !== 6}
            className="w-full"
          >
            {verifying ? "Verifying…" : "Verify email"}
          </Button>
        </form>
        <form action={handleResend} className="flex flex-col gap-2">
          <input type="hidden" name="email" value={initialEmail} />
          <Button
            type="submit"
            size="lg"
            variant="outline"
            disabled={resending || cooldown > 0 || !initialEmail}
          >
            {cooldown > 0
              ? `Resend in ${cooldown}s`
              : resending
                ? "Sending…"
                : "Resend code"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
