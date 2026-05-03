import Link from "next/link";
import { requireRole } from "@/lib/auth/can";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldIcon, UsersIcon } from "lucide-react";

export default async function SettingsPage() {
  await requireRole("ADMIN");
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account, notifications and enterprise preferences.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link href="/settings/users">
          <Card className="transition hover:shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UsersIcon className="size-5" />
                User management
              </CardTitle>
              <CardDescription>
                Invite users, change roles, deactivate accounts.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/settings/audit">
          <Card className="transition hover:shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldIcon className="size-5" />
                Audit log
              </CardTitle>
              <CardDescription>
                Review security-sensitive actions across the platform.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
