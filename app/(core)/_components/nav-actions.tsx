"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  ActivityIcon,
  BellIcon,
  DownloadIcon,
  MoreHorizontalIcon,
} from "lucide-react";

export function NavActions() {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Popover>
        <PopoverTrigger
          render={
            <button className="hidden cursor-pointer rounded-md px-2 py-1 font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground md:inline-block" />
          }
        >
          {new Date().toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </PopoverTrigger>
        <PopoverContent align="end" className="w-auto p-0">
          <Calendar mode="single" className="rounded-lg border" />
        </PopoverContent>
      </Popover>
      <Button variant="ghost" size="icon" className="relative h-7 w-7">
        <BellIcon />
        <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-white">
          3
        </span>
      </Button>
      <ThemeToggle />
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 data-open:bg-accent"
            />
          }
        >
          <MoreHorizontalIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem>
            <DownloadIcon />
            Export Dashboard
          </DropdownMenuItem>
          <DropdownMenuItem>
            <ActivityIcon />
            System Status
          </DropdownMenuItem>
          <DropdownMenuItem>
            <BellIcon />
            Manage Notifications
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
