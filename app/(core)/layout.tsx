import { redirect } from "next/navigation";
import { AppSidebar } from "./_components/app-sidebar";
import { NavActions } from "./_components/nav-actions";
import { Breadcrumbs } from "./_components/breadcrumbs";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getSession } from "@/lib/auth/session";
import { listCharactersForUser } from "@/lib/characters/access";
import { readActiveCharacterId } from "@/lib/characters/active";
import { listCampaignsForUser } from "@/lib/campaigns/access";

export default async function AuthedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!session.user.emailVerified) redirect("/verify-email");

  const [characters, activeCharacterId, campaigns] = await Promise.all([
    listCharactersForUser(session.user.id),
    readActiveCharacterId(),
    listCampaignsForUser(session.user.id),
  ]);

  return (
    <TooltipProvider>
      <SidebarProvider
        style={{ "--sidebar-width": "16rem" } as React.CSSProperties}
      >
        <AppSidebar
          user={session.user}
          characters={characters}
          activeCharacterId={activeCharacterId}
          campaigns={campaigns}
        />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2">
            <div className="flex flex-1 items-center gap-2 px-3">
              <SidebarTrigger />
              <Separator
                orientation="vertical"
                className="mr-2 data-vertical:h-4 data-vertical:self-auto"
              />
              <Breadcrumbs />
            </div>
            <div className="ml-auto px-3">
              <NavActions />
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-10">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
