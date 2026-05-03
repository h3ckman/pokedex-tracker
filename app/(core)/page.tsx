import { requireAuth } from "@/lib/auth/can";

export default async function HomePage() {
  const session = await requireAuth();
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome, {session.user.name}.
        </h1>
        <p className="text-sm text-muted-foreground">
          Pokédex Tracker is just getting started. More to come.
        </p>
      </div>
    </div>
  );
}
