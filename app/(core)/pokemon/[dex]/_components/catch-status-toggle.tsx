"use client";

import { CircleIcon, EyeIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Pokeball } from "@/components/icons/pokeball";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { setPokemonStatus, type CatchStatus } from "@/lib/actions/pokedex";

export function CatchStatusToggle({
  pokemonId,
  initialStatus,
}: {
  pokemonId: string;
  initialStatus: CatchStatus;
}) {
  const [status, setStatus] = useState<CatchStatus>(initialStatus);
  const [isPending, startTransition] = useTransition();

  function onChange(values: string[]) {
    const next = (values[0] ?? "none") as CatchStatus;
    if (next !== "none" && next !== "seen" && next !== "caught") return;
    if (next === status) return;

    const previous = status;
    setStatus(next);
    startTransition(async () => {
      const result = await setPokemonStatus(pokemonId, next);
      if (result.error) {
        setStatus(previous);
        toast.error(result.error);
      }
    });
  }

  return (
    <ToggleGroup
      value={[status]}
      onValueChange={onChange}
      variant="outline"
      size="sm"
      disabled={isPending}
      aria-label="Catch status"
    >
      <ToggleGroupItem value="none" aria-label="Not seen">
        <CircleIcon className="size-3.5" aria-hidden />
        None
      </ToggleGroupItem>
      <ToggleGroupItem value="seen" aria-label="Seen">
        <EyeIcon className="size-3.5" aria-hidden />
        Seen
      </ToggleGroupItem>
      <ToggleGroupItem value="caught" aria-label="Caught">
        <Pokeball className="size-3.5" aria-hidden />
        Caught
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
