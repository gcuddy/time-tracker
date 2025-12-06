import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  Button as AriaButton,
  composeRenderProps,
  type ButtonProps as AriaButtonProps,
} from "react-aria-components";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold",
    "ring-offset-background transition-all duration-150 ease-out",
    "cursor-pointer select-none",
    /* Disabled */
    "data-disabled:pointer-events-none data-disabled:opacity-50",
    /* Focus Visible */
    "data-focus-visible:outline-none data-focus-visible:ring-2 data-focus-visible:ring-ring data-focus-visible:ring-offset-2 data-focus-visible:ring-offset-background",
    /* Pressed state */
    "data-pressed:scale-[0.98]",
    /* Resets */
    "focus-visible:outline-none",
  ],
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm data-hovered:bg-amber-400 data-hovered:shadow-md data-hovered:shadow-amber-500/20",
        destructive:
          "bg-destructive text-white shadow-sm data-hovered:bg-red-500 data-hovered:shadow-md data-hovered:shadow-red-500/20",
        outline:
          "border border-border bg-transparent text-foreground data-hovered:bg-accent data-hovered:border-accent",
        secondary:
          "bg-secondary text-secondary-foreground border border-border/50 data-hovered:bg-accent data-hovered:border-border",
        ghost:
          "text-muted-foreground data-hovered:bg-accent data-hovered:text-foreground",
        link: "text-primary underline-offset-4 data-hovered:underline data-hovered:text-amber-400",
        icon: "text-muted-foreground bg-transparent hover:bg-accent hover:text-foreground border-none p-2 h-auto aspect-square",
      },
      size: {
        default: "h-9 px-4 py-2 text-sm",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-lg px-8 text-base",
        icon: "size-9 rounded-lg p-0 flex items-center justify-center",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps
  extends AriaButtonProps, VariantProps<typeof buttonVariants> {}

const Button = ({ className, variant, size, ...props }: ButtonProps) => {
  return (
    <AriaButton
      className={composeRenderProps(className, (className) =>
        cn(
          buttonVariants({
            variant,
            size,
            className,
          })
        )
      )}
      {...props}
    />
  );
};

export { Button, buttonVariants };
export type { ButtonProps };
