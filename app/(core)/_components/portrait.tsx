import Image from "next/image";
import { UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  src: string | null | undefined;
  alt: string;
  size?: number;
  className?: string;
  fallbackText?: string;
  rounded?: "full" | "md" | "lg";
};

export function Portrait({
  src,
  alt,
  size = 40,
  className,
  fallbackText,
  rounded = "full",
}: Props) {
  const radius =
    rounded === "full"
      ? "rounded-full"
      : rounded === "lg"
        ? "rounded-lg"
        : "rounded-md";

  const common = cn(
    radius,
    "overflow-hidden bg-muted flex items-center justify-center text-muted-foreground shrink-0",
    className,
  );
  const style = { width: size, height: size };

  if (!src) {
    return (
      <div className={common} style={style}>
        {fallbackText ? (
          <span className="text-sm font-semibold uppercase">
            {fallbackText.slice(0, 1)}
          </span>
        ) : (
          <UserIcon className="size-1/2" />
        )}
      </div>
    );
  }

  if (src.startsWith("data:")) {
    return (
      <div className={common} style={style}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="size-full object-cover" />
      </div>
    );
  }

  return (
    <div className={common} style={style}>
      <Image
        src={src}
        alt={alt}
        width={size * 2}
        height={size * 2}
        className="size-full object-cover"
      />
    </div>
  );
}
