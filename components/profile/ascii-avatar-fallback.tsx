import { cn } from "cn";

import { AvatarFallback } from "@/components/ui/avatar";
import { animalAvatarFor } from "@/lib/profile/animal-avatar";

export function AsciiAvatarFallback({
  seed,
  size = "sm",
  className,
}: {
  seed: string;
  size?: "sm" | "lg";
  className?: string;
}) {
  const animal = animalAvatarFor(seed);

  return (
    <AvatarFallback
      aria-label={`${animal.label} avatar`}
      className={cn(
        "whitespace-pre font-mono",
        size === "lg"
          ? "text-[12px] leading-[11px]"
          : "text-[9px] leading-[8px]",
        className,
      )}
    >
      {animal.face}
    </AvatarFallback>
  );
}
