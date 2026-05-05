import Link from "next/link";
import { ChevronRight, GitBranchIcon } from "lucide-react";

import { Pokeball } from "@/components/icons/pokeball";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type ChainMember = {
  nationalDexNumber: number;
  name: string;
  spriteUrl: string | null;
  evolvesFromDexNumber: number | null;
  evolutionTriggerLabel: string | null;
};

type ChainNode = ChainMember & { children: ChainNode[] };

function pad4(n: number): string {
  return String(n).padStart(4, "0");
}

function buildTree(members: ChainMember[]): ChainNode | null {
  const root = members.find((m) => m.evolvesFromDexNumber == null);
  if (!root) return null;
  const expand = (node: ChainMember): ChainNode => ({
    ...node,
    children: members
      .filter((m) => m.evolvesFromDexNumber === node.nationalDexNumber)
      .sort((a, b) => a.nationalDexNumber - b.nationalDexNumber)
      .map(expand),
  });
  return expand(root);
}

function StageCard({
  member,
  isCurrent,
}: {
  member: ChainMember;
  isCurrent: boolean;
}) {
  return (
    <Link
      href={`/pokemon/${member.nationalDexNumber}`}
      aria-current={isCurrent ? "page" : undefined}
      className={cn(
        "flex w-28 flex-col items-center gap-1.5 rounded-xl bg-muted/50 p-3 ring-1 ring-border transition-colors hover:bg-muted",
        isCurrent && "ring-2 ring-primary",
      )}
    >
      <div className="flex size-20 items-center justify-center">
        {member.spriteUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.spriteUrl}
            alt={member.name}
            className="size-20 object-contain"
          />
        ) : (
          <Pokeball className="size-12" />
        )}
      </div>
      <div className="text-center">
        <p className="font-mono text-[10px] text-muted-foreground tabular-nums">
          #{pad4(member.nationalDexNumber)}
        </p>
        <p className="text-sm font-semibold leading-tight">{member.name}</p>
      </div>
    </Link>
  );
}

function EvolutionArrow({ label }: { label: string | null }) {
  return (
    <div className="flex flex-col items-center gap-1 px-1 sm:px-2">
      <ChevronRight className="size-5 text-muted-foreground" aria-hidden />
      {label && (
        <Badge variant="secondary" className="px-2 text-[10px]">
          {label}
        </Badge>
      )}
    </div>
  );
}

function ChainNodeView({
  node,
  currentDexNumber,
}: {
  node: ChainNode;
  currentDexNumber: number;
}) {
  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-2">
      <StageCard
        member={node}
        isCurrent={node.nationalDexNumber === currentDexNumber}
      />
      {node.children.length > 0 && (
        <div className="flex flex-col gap-3">
          {node.children.map((child) => (
            <div
              key={child.nationalDexNumber}
              className="flex flex-col items-center gap-3 sm:flex-row sm:gap-2"
            >
              <EvolutionArrow label={child.evolutionTriggerLabel} />
              <ChainNodeView node={child} currentDexNumber={currentDexNumber} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function EvolutionaryChain({
  members,
  currentDexNumber,
}: {
  members: ChainMember[];
  currentDexNumber: number;
}) {
  if (members.length <= 1) return null;
  const tree = buildTree(members);
  if (!tree) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <GitBranchIcon className="size-4 text-muted-foreground" aria-hidden />
          Evolution chain
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center overflow-x-auto">
          <ChainNodeView node={tree} currentDexNumber={currentDexNumber} />
        </div>
      </CardContent>
    </Card>
  );
}
