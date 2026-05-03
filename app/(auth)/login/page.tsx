import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoginForm } from "./_components/login-form";
import { getSession } from "@/lib/auth/session";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/");
  // If the cookie is present but has no DB-backed session (revoked or wiped),
  // we just render the form. A successful login overwrites the cookie via
  // createSession(); cookies() can't be mutated from a server component.

  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
