"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showCloseButton?: boolean;
  className?: string;
}

export default function Modal({
  isOpen,
  onClose,
  children,
  title,
  description,
  size = "md",
  showCloseButton = true,
  className,
}: ModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Gestion de l'état monté pour le portail
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Gestion de la touche Échap pour fermer la modal
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, [isOpen, onClose]);

  // Gestion du focus à l'ouverture de la modal
  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Sauvegarder l'élément actuellement focus
      const activeElement = document.activeElement;

      // Focus sur la modal
      modalRef.current.focus();

      // Restaurer le focus au démontage
      return () => {
        if (activeElement instanceof HTMLElement) {
          activeElement.focus();
        }
      };
    }
  }, [isOpen]);

  // Tailles de la modal
  const sizeClasses = {
    sm: "min-w-[300px] w-full max-w-sm",
    md: "min-w-[300px] w-full max-w-md",
    lg: "min-w-[300px] w-full max-w-lg",
    xl: "min-w-[300px] w-fit max-w-[1200px]",
    full: "max-w-full",
  };

  // Si non monté, ne rien afficher (SSR)
  if (!isMounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
          {/* Overlay avec animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
          />

          {/* Contenu de la modal avec animation */}
          <motion.div
            ref={modalRef}
            tabIndex={-1}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "relative z-50 w-full bg-background-component/90 border border-primary/30 shadow-lg shadow-primary/20  rounded-lg",
              sizeClasses[size],
              className
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* En-tête de la modal */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between border-b p-4">
                <div>
                  {title && <h2 className="text-xl font-semibold">{title}</h2>}
                  {description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {description}
                    </p>
                  )}
                </div>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="rounded-full p-2 hover:bg-muted transition-colors"
                    aria-label="Fermer"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            )}

            {/* Corps de la modal */}
            <div className="p-4 overflow-y-auto max-h-[calc(100vh-180px)]">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

// Composant ModalContent pour un accès plus simple
export function ModalContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("flex flex-col gap-4", className)}>{children}</div>;
}

// Composant ModalFooter pour les boutons d'action
export function ModalFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-2 pt-2 border-t mt-4",
        className
      )}
    >
      {children}
    </div>
  );
}

// Exemple d'utilisation:
/*
import { useState } from "react";
import Modal, { ModalContent, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

export default function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>Ouvrir la modal</Button>
      
      <Modal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        title="Titre de la modal"
        description="Description optionnelle de la modal"
      >
        <ModalContent>
          <p>Contenu de la modal...</p>
          <input type="text" placeholder="Champ avec focus automatique" />
        </ModalContent>
        
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Annuler</Button>
          <Button onClick={() => {
            // Action à effectuer
            setIsOpen(false);
          }}>Confirmer</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
*/
