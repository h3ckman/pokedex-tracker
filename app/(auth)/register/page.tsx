import { redirect } from "next/navigation";
import { Suspense } from "react";
import { RegisterForm } from "./_components/register-form";
import { getSession } from "@/lib/auth/session";

export default async function RegisterPage() {
  const session = await getSession();
  if (session?.user.emailVerified) redirect("/");

  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
