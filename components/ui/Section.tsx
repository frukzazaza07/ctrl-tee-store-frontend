import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  as?: "section" | "div";
}

export function Section({
  className,
  as: Tag = "section",
  ...props
}: SectionProps) {
  return (
    <Tag
      className={cn("mx-auto w-full max-w-7xl px-6 py-16 md:px-10 md:py-24", className)}
      {...props}
    />
  );
}
