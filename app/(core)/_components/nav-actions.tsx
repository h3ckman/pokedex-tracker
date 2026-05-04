"use client";

import * as React from "react";

import { ThemeToggle } from "@/components/theme-toggle";

export function NavActions() {
  return (
    <div className="flex items-center gap-2 text-sm">
      <ThemeToggle />
    </div>
  );
}
