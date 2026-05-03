"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type BreadcrumbSegment = {
  label: string;
  href?: string;
};

const STATIC_ROUTES: Record<string, string> = {
  "/settings": "Settings",
  "/help": "Help",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const [segments, setSegments] = useState<BreadcrumbSegment[]>([]);

  useEffect(() => {
    const staticLabel = STATIC_ROUTES[pathname];
    if (staticLabel) {
      setSegments([{ label: staticLabel }]);
      return;
    }

    // Fallback: derive from path segments
    setSegments([{ label: pathname.slice(1) }]);
  }, [pathname]);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.map((segment, i) => {
          const isLast = i === segments.length - 1;
          return (
            <React.Fragment key={`${segment.label}-${i}`}>
              {i > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="line-clamp-1">
                    {segment.label}
                  </BreadcrumbPage>
                ) : segment.href ? (
                  <BreadcrumbLink render={<Link href={segment.href} />}>
                    {segment.label}
                  </BreadcrumbLink>
                ) : (
                  <span>{segment.label}</span>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
