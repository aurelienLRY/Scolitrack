import { appConfig } from "@/config/app.config";

/**
 * Configuration de l'invite d'installation PWA
 * Ce fichier gère le comportement et l'apparence de l'invite d'installation personnalisée
 * @see https://developer.mozilla.org/fr/docs/Web/Progressive_web_apps/Add_to_home_screen
 */
export const pwaConfig = {
  // Activation de l'invite d'installation personnalisée
  customInstallPrompt: true, // Si false, utilise l'invite native du navigateur

  // Temporisation et fréquence
  promptDelay: 1000, // Délai avant d'afficher l'invite (en millisecondes)
  maxPrompts: 3, // Nombre maximum de fois que le prompt sera affiché
  promptInterval: 24 * 60 * 60 * 1000, // 24 heures en millisecondes

  // Textes de l'invite d'installation
  messages: {
    title: `Installer ${appConfig.name}`, // Titre dynamique avec le nom de l'app
    description:
      "Installez notre application pour un accès rapide et hors ligne",
    installButton: "Installer", // Texte du bouton d'installation
    cancelButton: "Plus tard", // Texte du bouton d'annulation
  },

  // Personnalisation visuelle
  style: {
    primaryColor: "#3b82f6", // Couleur principale des boutons et éléments interactifs
    darkMode: true, // Support du mode sombre
  },
} as const; // Garantit l'immutabilité de la configuration
