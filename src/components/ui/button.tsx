import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Tooltip } from "@/components/ui/tooltip";

import { Trash, Save, Ellipsis, Edit, LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      color: {
        default: "text-text border-black",
        primary: "text-primary-foreground border-primary",
        destructive: "text-destructive-foreground border-destructive",
        secondary: "text-secondary-foreground border-secondary",
        accent: "text-accent-foreground border-accent",
        success: "text-white  border-success",
        warning: "text-warning-foreground border-warning",
        info: "text-info-foreground border-info",
      },
      variant: {
        solid: "",
        outline: "border-2 bg-transparent hover:bg-opacity-10",
        ghost: "bg-transparent border-transparent hover:bg-opacity-10",
        link: "bg-transparent border-transparent underline-offset-4 hover:underline",
        soft: "border-transparent bg-opacity-20 hover:bg-opacity-30",
        glass: "border bg-opacity-10 backdrop-blur-sm hover:bg-opacity-20",
      },
      size: {
        xs: "h-7 px-2 text-xs",
        sm: "h-9 px-3",
        default: "h-10 px-4 py-2",
        lg: "h-11 px-6",
        xl: "h-12 px-8 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
    },
    compoundVariants: [
      // Solid variants
      {
        color: "default",
        variant: "solid",
        className: "bg-primary hover:bg-primary/90",
      },
      {
        color: "destructive",
        variant: "solid",
        className: "bg-destructive hover:bg-destructive/90",
      },
      {
        color: "secondary",
        variant: "solid",
        className: "bg-secondary hover:bg-secondary/80",
      },
      {
        color: "accent",
        variant: "solid",
        className: "bg-accent hover:bg-accent/80",
      },
      {
        color: "success",
        variant: "solid",
        className: "bg-success hover:bg-success/90",
      },
      {
        color: "warning",
        variant: "solid",
        className: "bg-warning hover:bg-warning/90",
      },
      {
        color: "info",
        variant: "solid",
        className: "bg-info hover:bg-info/90",
      },
      // Soft variants
      {
        color: "default",
        variant: "soft",
        className: "bg-primary text-primary-foreground",
      },
      {
        color: "destructive",
        variant: "soft",
        className: "bg-destructive text-destructive-foreground",
      },
      {
        color: "secondary",
        variant: "soft",
        className: "bg-secondary text-secondary-foreground",
      },
      {
        color: "accent",
        variant: "soft",
        className: "bg-accent text-accent-foreground",
      },
      {
        color: "success",
        variant: "soft",
        className: "bg-success text-success-foreground",
      },
      {
        color: "warning",
        variant: "soft",
        className: "bg-warning text-warning-foreground",
      },
      {
        color: "info",
        variant: "soft",
        className: "bg-info text-info-foreground",
      },
      // Outline variants - adding text colors
      {
        color: "default",
        variant: "outline",
        className: "text-primary",
      },
      {
        color: "destructive",
        variant: "outline",
        className: "text-destructive",
      },
      {
        color: "secondary",
        variant: "outline",
        className: "text-secondary",
      },
      {
        color: "accent",
        variant: "outline",
        className: "text-accent",
      },
      {
        color: "success",
        variant: "outline",
        className: "text-success",
      },
      {
        color: "warning",
        variant: "outline",
        className: "text-warning",
      },
      {
        color: "info",
        variant: "outline",
        className: "text-info",
      },
      // Ghost variants
      {
        color: "default",
        variant: "ghost",
        className: "hover:bg-primary/10 text-primary",
      },
      {
        color: "destructive",
        variant: "ghost",
        className: "hover:bg-destructive/10 text-destructive",
      },
      {
        color: "secondary",
        variant: "ghost",
        className: "hover:bg-secondary/10 text-secondary",
      },
      {
        color: "accent",
        variant: "ghost",
        className: "hover:bg-accent/10 text-accent",
      },
      {
        color: "success",
        variant: "ghost",
        className: "hover:bg-success/10 text-success",
      },
      {
        color: "warning",
        variant: "ghost",
        className: "hover:bg-warning/10 text-warning",
      },
      {
        color: "info",
        variant: "ghost",
        className: "hover:bg-info/10 text-info",
      },
    ],
    defaultVariants: {
      variant: "solid",
      color: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  iconOnly?: boolean;
  tooltip?: string;
  color?:
    | "default"
    | "destructive"
    | "secondary"
    | "accent"
    | "success"
    | "warning"
    | "info";
  variant?: "solid" | "outline" | "ghost" | "link" | "soft" | "glass";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      color,
      size,
      asChild = false,
      icon: Icon,
      iconPosition = "left",
      iconOnly = false,
      tooltip,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const content = (
      <Comp
        className={cn(
          buttonVariants({
            variant,
            color,
            size: iconOnly ? (size?.includes("icon") ? size : "icon") : size,
            className,
          }),
          "cursor-pointer"
        )}
        ref={ref}
        {...props}
      >
        {Icon && (iconPosition === "left" || iconOnly) && <Icon />}
        {!iconOnly && children}
        {Icon && iconPosition === "right" && !iconOnly && <Icon />}
      </Comp>
    );

    if (iconOnly && tooltip) {
      return <Tooltip content={tooltip}>{content}</Tooltip>;
    }

    return content;
  }
);

Button.displayName = "Button";

// Boutons d'action prédéfinis
export const DeleteButton = (props: Omit<ButtonProps, "icon">) => (
  <Button
    variant={props.variant || "solid"}
    color={props.color || "destructive"}
    icon={Trash}
    tooltip={
      props.iconOnly ? (props.children as string) || "Supprimer" : undefined
    }
    {...props}
  >
    {props.children || "Supprimer"}
  </Button>
);
DeleteButton.displayName = "DeleteButton";

export const SaveButton = (props: Omit<ButtonProps, "icon">) => (
  <Button
    variant={props.variant || "solid"}
    color={props.color || "success"}
    icon={Save}
    tooltip={
      props.iconOnly ? (props.children as string) || "Enregistrer" : undefined
    }
    {...props}
  >
    {props.children || "Enregistrer"}
  </Button>
);
SaveButton.displayName = "SaveButton";

export const MoreButton = (props: Omit<ButtonProps, "icon">) => (
  <Button icon={Ellipsis} {...props}>
    {props.children || "Voir plus"}
  </Button>
);
MoreButton.displayName = "MoreButton";

export const UpdateButton = (props: Omit<ButtonProps, "icon">) => (
  <Button
    variant={props.variant || "solid"}
    color={props.color || "warning"}
    icon={Edit}
    tooltip={
      props.iconOnly ? (props.children as string) || "Mettre à jour" : undefined
    }
    {...props}
  >
    {props.children || "Mettre à jour"}
  </Button>
);
UpdateButton.displayName = "UpdateButton";

export { Button, buttonVariants };
