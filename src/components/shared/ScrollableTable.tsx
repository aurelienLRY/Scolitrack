"use client";

import React, { useState, useEffect, useRef, ReactNode } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

// Définir les variants du composant
const scrollableTableVariants = cva(
  "overflow-x-auto rounded-lg border shadow-sm",
  {
    variants: {
      variant: {
        default: "border-input",
        primary: "border-primary",
        destructive: "border-destructive",
        secondary: "border-secondary",
        accent: "border-accent",
        success: "border-success",
        warning: "border-warning",
        info: "border-info",
      },
      size: {
        sm: "p-1 rounded-md",
        default: "p-0",
        lg: "p-2 rounded-lg",
      },
      scrollbarStyle: {
        visible:
          "scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent",
        minimal:
          "scrollbar-thin scrollbar-thumb-gray-300/50 scrollbar-track-transparent",
        hidden: "scrollbar-none",
        custom:
          "scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      scrollbarStyle: "custom",
    },
  }
);

// Interface pour les props du composant
export interface ScrollableTableProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof scrollableTableVariants> {
  children: ReactNode;
  showScrollButtons?: boolean;
  scrollButtonPosition?: "outsideTable" | "insideTable";
  scrollAmount?: number;
  enableWheelScroll?: boolean;
  className?: string;
  innerClassName?: string;
}

/**
 * Composant ScrollableTable - Wrapper pour les tableaux avec défilement horizontal amélioré
 *
 * @param children - Le contenu du tableau (généralement un élément <table>)
 * @param variant - Variante de couleur pour la bordure
 * @param size - Taille du conteneur
 * @param scrollbarStyle - Style de la barre de défilement
 * @param showScrollButtons - Affiche ou non les boutons de défilement
 * @param scrollButtonPosition - Position des boutons de défilement
 * @param scrollAmount - Quantité de défilement par clic
 * @param enableWheelScroll - Active ou non le défilement avec la molette
 * @param className - Classes CSS additionnelles pour le conteneur principal
 * @param innerClassName - Classes CSS additionnelles pour le conteneur intérieur
 */
export function ScrollableTable({
  children,
  variant,
  size,
  scrollbarStyle,
  showScrollButtons = true,
  scrollButtonPosition = "outsideTable",
  scrollAmount = 300,
  enableWheelScroll = true,
  className,
  innerClassName,
  ...props
}: ScrollableTableProps) {
  const tableRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);

  // Vérifier si les boutons de défilement doivent être affichés
  const checkScrollButtons = () => {
    if (tableRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tableRef.current;
      setShowLeftScroll(scrollLeft > 0);
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  // Défilement horizontal vers la gauche ou la droite
  const scroll = (direction: "left" | "right") => {
    if (tableRef.current) {
      const newScrollLeft =
        direction === "left"
          ? tableRef.current.scrollLeft - scrollAmount
          : tableRef.current.scrollLeft + scrollAmount;

      tableRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  // Gestion du défilement horizontal avec la molette de la souris
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (enableWheelScroll && tableRef.current && !e.ctrlKey && !e.metaKey) {
      // Empêcher le défilement vertical par défaut
      e.preventDefault();

      // Déterminer la quantité de défilement
      const scrollAmount = e.deltaY || e.deltaX;

      // Appliquer le défilement horizontal
      tableRef.current.scrollLeft += scrollAmount;

      // Mettre à jour l'état des boutons de défilement
      checkScrollButtons();
    }
  };

  // Ajouter l'écouteur d'événements pour le défilement et le redimensionnement
  useEffect(() => {
    const tableElement = tableRef.current;
    if (tableElement) {
      checkScrollButtons();
      tableElement.addEventListener("scroll", checkScrollButtons);
      window.addEventListener("resize", checkScrollButtons);

      // Vérifier une fois que le contenu est chargé
      setTimeout(checkScrollButtons, 100);
    }

    return () => {
      if (tableElement) {
        tableElement.removeEventListener("scroll", checkScrollButtons);
        window.removeEventListener("resize", checkScrollButtons);
      }
    };
  }, []);

  // Style des boutons de défilement en fonction de leur position
  const scrollButtonClasses =
    scrollButtonPosition === "outsideTable"
      ? "absolute top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm shadow-md text-primary hover:bg-primary/10 transition-colors"
      : "absolute top-1/2 -translate-y-1/2 z-10 bg-white/90 shadow-sm text-primary hover:bg-primary/10 transition-colors";

  const leftButtonClasses = cn(
    scrollButtonClasses,
    scrollButtonPosition === "outsideTable"
      ? "left-0 rounded-r-lg p-2"
      : "left-1 rounded-full p-1"
  );

  const rightButtonClasses = cn(
    scrollButtonClasses,
    scrollButtonPosition === "outsideTable"
      ? "right-0 rounded-l-lg p-2"
      : "right-1 rounded-full p-1"
  );

  return (
    <div className={cn("relative", className)} {...props}>
      {/* Boutons de défilement */}
      {showScrollButtons && showLeftScroll && (
        <button
          className={leftButtonClasses}
          onClick={() => scroll("left")}
          aria-label="Défiler vers la gauche"
        >
          <FaChevronLeft className="size-4" />
        </button>
      )}

      {showScrollButtons && showRightScroll && (
        <button
          className={rightButtonClasses}
          onClick={() => scroll("right")}
          aria-label="Défiler vers la droite"
        >
          <FaChevronRight className="size-4" />
        </button>
      )}

      {/* Conteneur du tableau avec les gestes tactiles */}
      <div
        ref={tableRef}
        className={cn(
          scrollableTableVariants({
            variant,
            size,
            scrollbarStyle,
          }),
          innerClassName
        )}
        style={{ touchAction: "pan-x" }}
        onWheel={handleWheel}
      >
        {children}
      </div>
    </div>
  );
}

export default ScrollableTable;
