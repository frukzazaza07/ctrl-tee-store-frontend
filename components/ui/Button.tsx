import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonOwnProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export type ButtonProps = ButtonOwnProps & ComponentPropsWithoutRef<"button">;

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-fg hover:brightness-110",
  secondary:
    "bg-transparent text-fg border border-fg/30 hover:border-fg hover:bg-fg/5",
  ghost: "bg-transparent text-fg hover:bg-fg/10",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-14 px-8 text-base",
};

/** Shared class generator so non-<button> elements (e.g. <Link>) can look like a Button. */
export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: ButtonOwnProps & { className?: string } = {}): string {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, variant = "primary", size = "md", ...props },
    ref,
  ) {
    return (
      <button
        ref={ref}
        className={buttonVariants({ variant, size, className })}
        {...props}
      />
    );
  },
);
