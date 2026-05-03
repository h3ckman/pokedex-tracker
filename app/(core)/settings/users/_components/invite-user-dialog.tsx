"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { inviteUser } from "@/lib/actions/users";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusIcon } from "lucide-react";

const initial = { error: null as string | null };

export function InviteUserDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(inviteUser, initial);

  useEffect(() => {
    if (state.error === null && state !== initial) {
      toast.success("User invited");
      setOpen(false);
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <PlusIcon className="size-4" />
        Invite user
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite user</DialogTitle>
          <DialogDescription>
            Create a new account. Share the temporary password securely.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="invite-name">Name</Label>
            <Input id="invite-name" name="name" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="invite-email">Email</Label>
            <Input id="invite-email" name="email" type="email" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="invite-role">Role</Label>
            <select
              id="invite-role"
              name="role"
              defaultValue="VIEWER"
              className="rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="ADMIN">Admin</option>
              <option value="SITE_MANAGER">Site Manager</option>
              <option value="TECHNICIAN">Technician</option>
              <option value="VIEWER">Viewer</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="invite-password">Temporary password</Label>
            <Input
              id="invite-password"
              name="password"
              type="text"
              minLength={8}
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Inviting…" : "Invite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
