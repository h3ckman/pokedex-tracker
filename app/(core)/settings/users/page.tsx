import { requireRole } from "@/lib/auth/can";
import { prisma } from "@/lib/prisma";
import { InviteUserDialog } from "./_components/invite-user-dialog";
import { UsersTable } from "./_components/users-table";

export default async function UsersPage() {
  const session = await requireRole("ADMIN");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      active: true,
    },
  });

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground">
            Invite users, change roles, or deactivate accounts.
          </p>
        </div>
        <InviteUserDialog />
      </div>
      <UsersTable users={users} currentUserId={session.user.id} />
    </div>
  );
}
