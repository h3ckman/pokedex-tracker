"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import {
  CharacterSwitcher,
  type CharacterSummary,
} from "./character-switcher";
import { UserMenu } from "./user-menu";
import type { Role } from "@/lib/generated/prisma/client";
import type { CampaignSummary } from "@/lib/campaigns/access";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  BookOpenIcon,
  BookTextIcon,
  CrownIcon,
  DicesIcon,
  InfoIcon,
  MessageCircleQuestionIcon,
  NotebookTextIcon,
  PackageIcon,
  ScrollTextIcon,
  SendIcon,
  Settings2Icon,
  SparklesIcon,
  SwordsIcon,
  UsersIcon,
} from "lucide-react";

type NavItem = {
  title: string;
  url: string;
  icon: React.ReactNode;
};

export function AppSidebar({
  user,
  characters,
  activeCharacterId,
  campaigns,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: { name: string; email: string; role: Role };
  characters: CharacterSummary[];
  activeCharacterId: string | null;
  campaigns: CampaignSummary[];
}) {
  const pathname = usePathname();
  const active =
    characters.find((c) => c.id === activeCharacterId) ?? characters[0] ?? null;

  const campaignMatch = pathname.match(/^\/campaigns\/([^/]+)/);
  const urlCampaignId =
    campaignMatch && campaignMatch[1] !== "join" ? campaignMatch[1] : null;
  const currentCampaign =
    (urlCampaignId && campaigns.find((c) => c.id === urlCampaignId)) ||
    campaigns[0] ||
    null;

  const characterNav: NavItem[] = active
    ? [
        {
          title: "Sheet",
          url: `/characters/${active.id}/sheet`,
          icon: <ScrollTextIcon />,
        },
        {
          title: "Inventory",
          url: `/characters/${active.id}/inventory`,
          icon: <PackageIcon />,
        },
        {
          title: "Spells",
          url: `/characters/${active.id}/spells`,
          icon: <SparklesIcon />,
        },
        {
          title: "Features",
          url: `/characters/${active.id}/features`,
          icon: <BookOpenIcon />,
        },
        {
          title: "Notes",
          url: `/characters/${active.id}/notes`,
          icon: <NotebookTextIcon />,
        },
      ]
    : [];

  const campaignNav: NavItem[] = currentCampaign
    ? [
        {
          title: "Overview",
          url: `/campaigns/${currentCampaign.id}`,
          icon: <InfoIcon />,
        },
        {
          title: "Party",
          url: `/campaigns/${currentCampaign.id}/roster`,
          icon: <UsersIcon />,
        },
        {
          title: "Handouts",
          url: `/campaigns/${currentCampaign.id}/handouts`,
          icon: <SendIcon />,
        },
        {
          title: "Session Log",
          url: `/campaigns/${currentCampaign.id}/sessions`,
          icon: <BookOpenIcon />,
        },
        ...(currentCampaign.role === "DM"
          ? [
              {
                title: "Campaign Settings",
                url: `/campaigns/${currentCampaign.id}/settings`,
                icon: <CrownIcon />,
              },
            ]
          : []),
      ]
    : [];

  const topNav: NavItem[] = [
    { title: "Characters", url: "/characters", icon: <UsersIcon /> },
    { title: "Campaigns", url: "/campaigns", icon: <SwordsIcon /> },
    { title: "Dice Roller", url: "/dice", icon: <DicesIcon /> },
  ];

  const navSecondary: NavItem[] = [
    { title: "Settings", url: "/settings", icon: <Settings2Icon /> },
    { title: "Help", url: "/help", icon: <MessageCircleQuestionIcon /> },
  ];
  const filteredSecondary =
    user.role === "ADMIN"
      ? navSecondary
      : navSecondary.filter((i) => i.url !== "/settings");

  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <CharacterSwitcher
          characters={characters}
          activeId={activeCharacterId}
        />
        <NavMain items={topNav} pathname={pathname} />
      </SidebarHeader>
      <SidebarContent>
        {active && (
          <div className="mt-4 px-2">
            <div className="mb-1 px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <BookTextIcon className="mr-1 inline size-3" />
              {active.name}
            </div>
            <NavMain items={characterNav} pathname={pathname} />
          </div>
        )}
        {currentCampaign && (
          <div className="mt-4 px-2">
            <div className="mb-1 px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <SwordsIcon className="mr-1 inline size-3" />
              {currentCampaign.name}
            </div>
            <NavMain items={campaignNav} pathname={pathname} />
          </div>
        )}
        <NavSecondary
          items={filteredSecondary}
          pathname={pathname}
          className="mt-auto"
        />
      </SidebarContent>
      <SidebarFooter>
        <UserMenu user={user} role={user.role} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
