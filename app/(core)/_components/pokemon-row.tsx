"use client";

import { EyeIcon } from "lucide-react";
import Link from "next/link";
import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";

import { Pokeball } from "@/components/icons/pokeball";
import { SidebarMenuSubButton } from "@/components/ui/sidebar";
import { setPokemonStatus, type CatchStatus } from "@/lib/actions/pokedex";

import type { SidebarPokemon } from "./pokemon-grouping";

function pad4(n: number): string {
  return String(n).padStart(4, "0");
}

function deriveStatus(p: { seen?: boolean; caught?: boolean }): CatchStatus {
  if (p.caught) return "caught";
  if (p.seen) return "seen";
  return "none";
}

export function PokemonRow({
  pokemon,
  isActive,
}: {
  pokemon: SidebarPokemon;
  isActive: boolean;
}) {
  const href = `/pokemon/${pokemon.nationalDexNumber}`;
  const propsStatus = deriveStatus(pokemon);
  const [status, setOptimisticStatus] = useOptimistic<CatchStatus>(propsStatus);
  const [isPending, startTransition] = useTransition();

  const next: CatchStatus = status === "caught" ? "none" : "caught";
  const actionLabel =
    status === "caught"
      ? `Uncatch ${pokemon.name}`
      : `Mark ${pokemon.name} as caught`;

  function onCatchClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (isPending) return;
    startTransition(async () => {
      setOptimisticStatus(next);
      const result = await setPokemonStatus(pokemon.id, next);
      if (result.error) {
        toast.error(result.error);
      }
    });
  }

  return (
    <>
      <SidebarMenuSubButton
        isActive={isActive}
        render={<Link href={href} prefetch={false} />}
        className="h-8 gap-2 pr-8"
      >
        {pokemon.spriteUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={pokemon.spriteUrl}
            alt=""
            className="size-6 shrink-0"
            loading="lazy"
          />
        ) : (
          <Pokeball className="size-5 shrink-0" />
        )}
        <span className="text-muted-foreground tabular-nums text-xs">
          #{pad4(pokemon.nationalDexNumber)}
        </span>
        <span className="truncate">{pokemon.name}</span>
      </SidebarMenuSubButton>
      <button
        type="button"
        aria-label={actionLabel}
        title={actionLabel}
        onClick={onCatchClick}
        disabled={isPending}
        data-status={status}
        className={
          "absolute top-1/2 right-1 -translate-y-1/2 flex size-5 items-center justify-center rounded-md " +
          "ring-sidebar-ring outline-hidden focus-visible:ring-2 hover:bg-sidebar-accent " +
          "transition-opacity disabled:pointer-events-none " +
          "data-[status=none]:opacity-0 group-hover/menu-sub-item:data-[status=none]:opacity-60 " +
          "data-[status=seen]:opacity-100 data-[status=caught]:opacity-100 " +
          "focus-visible:opacity-100"
        }
      >
        {status === "caught" ? (
          <Pokeball className="size-3.5" aria-hidden />
        ) : status === "seen" ? (
          <EyeIcon
            className="size-3.5 text-muted-foreground"
            aria-hidden
          />
        ) : (
          <Pokeball className="size-3.5 opacity-70" aria-hidden />
        )}
      </button>
    </>
  );
}
