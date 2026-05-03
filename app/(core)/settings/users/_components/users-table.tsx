"use client";

import { useMemo, useTransition } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { changeUserRole, deactivateUser } from "@/lib/actions/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Role } from "@/lib/generated/prisma/client";
import { useState } from "react";

const ROLES: Role[] = ["ADMIN", "SITE_MANAGER", "TECHNICIAN", "VIEWER"];

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Admin",
  SITE_MANAGER: "Site Manager",
  TECHNICIAN: "Technician",
  VIEWER: "Viewer",
};

type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
};

function RoleCell({ user, isSelf }: { user: User; isSelf: boolean }) {
  const [pending, start] = useTransition();

  const onRoleChange = (newRole: Role) => {
    if (newRole === user.role) return;
    start(async () => {
      const res = await changeUserRole(user.id, newRole);
      if (res.error) toast.error(res.error);
      else toast.success(`${user.name} is now ${ROLE_LABEL[newRole]}`);
    });
  };

  return (
    <select
      className="rounded-md border bg-background px-2 py-1 text-sm"
      value={user.role}
      disabled={isSelf || pending || !user.active}
      onChange={(e) => onRoleChange(e.target.value as Role)}
    >
      {ROLES.map((r) => (
        <option key={r} value={r}>
          {ROLE_LABEL[r]}
        </option>
      ))}
    </select>
  );
}

function ActionsCell({ user, isSelf }: { user: User; isSelf: boolean }) {
  const [pending, start] = useTransition();

  const onDeactivate = () => {
    start(async () => {
      const res = await deactivateUser(user.id);
      if (res.error) toast.error(res.error);
      else toast.success(`${user.name} deactivated`);
    });
  };

  if (!user.active || isSelf) return null;

  return (
    <Button variant="ghost" size="sm" disabled={pending} onClick={onDeactivate}>
      Deactivate
    </Button>
  );
}

export function UsersTable({
  users,
  currentUserId,
}: {
  users: User[];
  currentUserId: string;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => {
          return (
            <button
              className="flex items-center gap-1 hover:text-foreground"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Name
              <ArrowUpDown className="size-3" />
            </button>
          );
        },
        cell: (info) => (
          <span className="font-medium">{info.getValue() as string}</span>
        ),
      },
      {
        accessorKey: "email",
        header: ({ column }) => {
          return (
            <button
              className="flex items-center gap-1 hover:text-foreground"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Email
              <ArrowUpDown className="size-3" />
            </button>
          );
        },
        cell: (info) => (
          <span className="text-muted-foreground">
            {info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "role",
        header: ({ column }) => {
          return (
            <button
              className="flex items-center gap-1 hover:text-foreground"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Role
              <ArrowUpDown className="size-3" />
            </button>
          );
        },
        cell: ({ row }) => (
          <RoleCell
            user={row.original}
            isSelf={row.original.id === currentUserId}
          />
        ),
      },
      {
        accessorKey: "active",
        header: ({ column }) => {
          return (
            <button
              className="flex items-center gap-1 hover:text-foreground"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Status
              <ArrowUpDown className="size-3" />
            </button>
          );
        },
        cell: (info) => {
          const isActive = info.getValue() as boolean;
          return (
            <span
              className={
                isActive
                  ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
              }
            >
              {isActive ? "Active" : "Disabled"}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="text-right">
            <ActionsCell
              user={row.original}
              isSelf={row.original.id === currentUserId}
            />
          </div>
        ),
      },
    ],
    [currentUserId],
  );

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Filter by name or email..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => {
            const value = event.target.value;
            table.getColumn("name")?.setFilterValue(value);
            table.getColumn("email")?.setFilterValue(value);
          }}
          className="max-w-sm"
        />
      </div>

      <div className="overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3 font-medium">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No users found.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={row.original.active ? "" : "opacity-60"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {table.getRowModel().rows.length} of {users.length} users
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="size-4" />
            Previous
          </Button>
          <div className="flex items-center gap-1 text-sm">
            <span className="text-muted-foreground">Page</span>
            <span className="font-medium">
              {table.getState().pagination.pageIndex + 1}
            </span>
            <span className="text-muted-foreground">of</span>
            <span className="font-medium">{table.getPageCount()}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
