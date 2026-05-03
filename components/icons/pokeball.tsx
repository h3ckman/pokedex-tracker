import type { SVGProps } from "react";

export function Pokeball({
  className,
  "aria-label": ariaLabel = "Pokédex emblem",
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={ariaLabel}
      className={className}
      {...props}
    >
      <defs>
        <radialGradient id="pb-white-shade" cx="38%" cy="68%" r="72%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#f4f4f6" />
          <stop offset="100%" stopColor="#d6d6dd" />
        </radialGradient>
        <radialGradient id="pb-red-shade" cx="38%" cy="32%" r="72%">
          <stop offset="0%" stopColor="oklch(0.68 0.22 27)" />
          <stop offset="60%" stopColor="oklch(0.55 0.22 27)" />
          <stop offset="100%" stopColor="oklch(0.4 0.18 25)" />
        </radialGradient>
        <radialGradient id="pb-button-shade" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="70%" stopColor="#eaeaef" />
          <stop offset="100%" stopColor="#c5c5cd" />
        </radialGradient>
        <clipPath id="pb-clip">
          <circle cx="100" cy="100" r="92" />
        </clipPath>
      </defs>

      <g clipPath="url(#pb-clip)">
        {/* Top red hemisphere */}
        <rect x="0" y="0" width="200" height="100" fill="url(#pb-red-shade)" />
        {/* Bottom white hemisphere */}
        <rect x="0" y="100" width="200" height="100" fill="url(#pb-white-shade)" />
        {/* Equator band */}
        <rect x="0" y="92" width="200" height="16" fill="#161616" />
      </g>

      {/* Outer rim */}
      <circle
        cx="100"
        cy="100"
        r="92"
        fill="none"
        stroke="#161616"
        strokeWidth="6"
      />

      {/* Center button: chrome ring */}
      <circle cx="100" cy="100" r="22" fill="#161616" />
      <circle cx="100" cy="100" r="17" fill="url(#pb-button-shade)" />
      <circle
        cx="100"
        cy="100"
        r="11"
        fill="none"
        stroke="#161616"
        strokeWidth="2.5"
      />
      {/* Specular highlight on the button */}
      <circle cx="94" cy="94" r="3.6" fill="#ffffff" fillOpacity="0.85" />
    </svg>
  );
}
