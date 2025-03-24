import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Tooltip } from "@/components/shared/tooltip";

import { FaTrash, FaSave, FaEllipsisH } from "react-icons/fa";
import { BiEditAlt } from "react-icons/bi";

import { IconType } from "react-icons";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "text-primary-foreground border-primary",
        destructive: "text-destructive-foreground border-destructive",
        secondary: "text-secondary-foreground border-secondary",
        accent: "text-accent-foreground border-accent",
        success: "text-white  border-success",
        warning: "text-warning-foreground border-warning",
        info: "text-info-foreground border-info",
      },
      style: {
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
        variant: "default",
        style: "solid",
        className: "bg-primary hover:bg-primary/90",
      },
      {
        variant: "destructive",
        style: "solid",
        className: "bg-destructive hover:bg-destructive/90",
      },
      {
        variant: "secondary",
        style: "solid",
        className: "bg-secondary hover:bg-secondary/80",
      },
      {
        variant: "accent",
        style: "solid",
        className: "bg-accent hover:bg-accent/80",
      },
      {
        variant: "success",
        style: "solid",
        className: "bg-success hover:bg-success/90",
      },
      {
        variant: "warning",
        style: "solid",
        className: "bg-warning hover:bg-warning/90",
      },
      {
        variant: "info",
        style: "solid",
        className: "bg-info hover:bg-info/90",
      },
      // Soft variants
      {
        variant: "default",
        style: "soft",
        className: "bg-primary text-primary-foreground",
      },
      {
        variant: "destructive",
        style: "soft",
        className: "bg-destructive text-destructive-foreground",
      },
      {
        variant: "secondary",
        style: "soft",
        className: "bg-secondary text-secondary-foreground",
      },
      {
        variant: "accent",
        style: "soft",
        className: "bg-accent text-accent-foreground",
      },
      {
        variant: "success",
        style: "soft",
        className: "bg-success text-success-foreground",
      },
      {
        variant: "warning",
        style: "soft",
        className: "bg-warning text-warning-foreground",
      },
      {
        variant: "info",
        style: "soft",
        className: "bg-info text-info-foreground",
      },
      // Outline variants - adding text colors
      {
        variant: "default",
        style: "outline",
        className: "text-primary",
      },
      {
        variant: "destructive",
        style: "outline",
        className: "text-destructive",
      },
      {
        variant: "secondary",
        style: "outline",
        className: "text-secondary",
      },
      {
        variant: "accent",
        style: "outline",
        className: "text-accent",
      },
      {
        variant: "success",
        style: "outline",
        className: "text-success",
      },
      {
        variant: "warning",
        style: "outline",
        className: "text-warning",
      },
      {
        variant: "info",
        style: "outline",
        className: "text-info",
      },
      // Ghost variants
      {
        variant: "default",
        style: "ghost",
        className: "hover:bg-primary/10 text-primary",
      },
      {
        variant: "destructive",
        style: "ghost",
        className: "hover:bg-destructive/10 text-destructive",
      },
      {
        variant: "secondary",
        style: "ghost",
        className: "hover:bg-secondary/10 text-secondary",
      },
      {
        variant: "accent",
        style: "ghost",
        className: "hover:bg-accent/10 text-accent",
      },
      {
        variant: "success",
        style: "ghost",
        className: "hover:bg-success/10 text-success",
      },
      {
        variant: "warning",
        style: "ghost",
        className: "hover:bg-warning/10 text-warning",
      },
      {
        variant: "info",
        style: "ghost",
        className: "hover:bg-info/10 text-info",
      },
    ],
    defaultVariants: {
      variant: "default",
      style: "solid",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  icon?: IconType;
  iconPosition?: "left" | "right";
  iconOnly?: boolean;
  tooltip?: string;
  style?: "solid" | "outline" | "ghost" | "link" | "soft" | "glass";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      style = "solid",
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
            style,
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
    variant={props.variant || "destructive"}
    style={props.style || "solid"}
    icon={FaTrash}
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
    variant={props.variant || "success"}
    style={props.style || "solid"}
    icon={FaSave}
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
  <Button icon={FaEllipsisH} {...props}>
    {props.children || "Voir plus"}
  </Button>
);
MoreButton.displayName = "MoreButton";

export const UpdateButton = (props: Omit<ButtonProps, "icon">) => (
  <Button
    variant={props.variant || "warning"}
    style={props.style || "solid"}
    icon={BiEditAlt}
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
