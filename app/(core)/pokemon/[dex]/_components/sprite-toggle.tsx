"use client";

import { useMemo, useState } from "react";

import { Pokeball } from "@/components/icons/pokeball";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";

type Variant = "default" | "shiny" | "animated";

type Option = { value: Variant; label: string; src: string };

export function SpriteToggle({
  defaultUrl,
  shinyUrl,
  animatedUrl,
  spriteUrl,
  alt,
}: {
  defaultUrl: string | null;
  shinyUrl: string | null;
  animatedUrl: string | null;
  spriteUrl: string | null;
  alt: string;
}) {
  const fallback = defaultUrl ?? spriteUrl;

  const options = useMemo<Option[]>(() => {
    const list: Option[] = [];
    if (defaultUrl) list.push({ value: "default", label: "Default", src: defaultUrl });
    if (shinyUrl) list.push({ value: "shiny", label: "Shiny", src: shinyUrl });
    if (animatedUrl) list.push({ value: "animated", label: "Animated", src: animatedUrl });
    return list;
  }, [defaultUrl, shinyUrl, animatedUrl]);

  const [variant, setVariant] = useState<Variant>(options[0]?.value ?? "default");
  const [errored, setErrored] = useState(false);

  const active = options.find((o) => o.value === variant) ?? options[0] ?? null;
  const src = errored ? fallback : active?.src ?? fallback;

  if (!fallback && options.length === 0) {
    return (
      <div className="relative flex size-48 shrink-0 items-center justify-center rounded-2xl bg-muted/50 ring-1 ring-border sm:size-56">
        <Pokeball className="size-32" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex size-48 shrink-0 items-center justify-center rounded-2xl bg-muted/50 ring-1 ring-border sm:size-56">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            src={src}
            alt={alt}
            onError={() => setErrored(true)}
            className="size-44 object-contain sm:size-52"
          />
        ) : (
          <Pokeball className="size-32" />
        )}
      </div>
      {options.length > 1 && (
        <ToggleGroup
          value={[variant]}
          onValueChange={(values) => {
            const next = values[0];
            if (next === "default" || next === "shiny" || next === "animated") {
              setVariant(next);
              setErrored(false);
            }
          }}
          variant="outline"
          size="sm"
        >
          {options.map((o) => (
            <ToggleGroupItem
              key={o.value}
              value={o.value}
              aria-label={o.label}
            >
              {o.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      )}
    </div>
  );
}
