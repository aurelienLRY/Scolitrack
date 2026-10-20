/**
 * Catalogue des signatures demandées dans le dossier d'inscription.
 * subjectKey stable en BDD ; labels sans numéros de fiches papier.
 */

export type EnrollmentSignatureSubjectKey =
  | "FICHE1_HORAIRES"
  | "FICHE3_SORTIES"
  | "FICHE3_QUITTER_SEUL"
  | "FICHE4_ADHESION"
  | "FICHE7_CANTINE_GARDERIE"
  | "FICHE9_REGLEMENTS"
  | "FICHE11_DROIT_IMAGE"
  | "FICHE2_CONSENTEMENT_MEDICAL";

export interface EnrollmentSignatureSubject {
  key: EnrollmentSignatureSubjectKey;
  label: string;
  /** Texte affiché dans l'email et sur la page de confirmation */
  acceptanceText: string;
  /** Rappel affiché sur le formulaire (optionnel) */
  formReminder?: string;
}

/**
 * Signatures au niveau responsable (chaque parent signe une fois pour la campagne).
 */
export const GUARDIAN_SIGNATURE_ORDER: EnrollmentSignatureSubjectKey[] = [
  "FICHE1_HORAIRES",
  "FICHE4_ADHESION",
  "FICHE7_CANTINE_GARDERIE",
  "FICHE9_REGLEMENTS",
];

/**
 * Signatures liées à un enfant (chaque parent signe par enfant, via son email).
 * Sorties, quitter seul, droit à l'image, consentement médical.
 */
export const CHILD_SIGNATURE_ORDER: EnrollmentSignatureSubjectKey[] = [
  "FICHE3_SORTIES",
  "FICHE3_QUITTER_SEUL",
  "FICHE11_DROIT_IMAGE",
  "FICHE2_CONSENTEMENT_MEDICAL",
];

export const ENROLLMENT_SIGNATURE_SUBJECTS: Record<
  EnrollmentSignatureSubjectKey,
  EnrollmentSignatureSubject
> = {
  FICHE1_HORAIRES: {
    key: "FICHE1_HORAIRES",
    label: "Horaires & fonctionnement de l'école",
    formReminder:
      "Il est rappelé que les horaires de classe doivent être respectés pour un bon fonctionnement de l'école. Matin : arrivée avant 9h et départ à 12h — Après-midi : arrivée avant 14h et départ (ou garderie) à 17h. La classe débute à 9 h et 14 h précises ; les enfants doivent être présents en classe avant ces horaires.",
    acceptanceText:
      "Je reconnais avoir pris connaissance des horaires de classe de l'Escòla Calandreta Los Cascamèls (matin : arrivée avant 9h / départ 12h ; après-midi : arrivée avant 14h / départ ou garderie 17h) et m'engage à les respecter.",
  },
  FICHE3_SORTIES: {
    key: "FICHE3_SORTIES",
    label: "Sorties & classes de découverte",
    formReminder:
      "Les sorties et classes de découverte sont organisées par l'école ; une information est envoyée à l'avance par mail pour chaque sortie.",
    acceptanceText:
      "J'autorise mon enfant à participer à toutes les sorties et classes de découverte organisées par l'escòla Calandreta Los Cascamèls. Je m'engage à vêtir mon enfant de manière adéquate et à me tenir informé(e) des activités proposées.",
  },
  FICHE3_QUITTER_SEUL: {
    key: "FICHE3_QUITTER_SEUL",
    label: "Autorisation de quitter l'école seul",
    formReminder:
      "À n'accepter que si vous autorisez réellement votre enfant à partir seul après les cours.",
    acceptanceText:
      "J'autorise mon enfant à quitter l'école seul après les cours.",
  },
  FICHE4_ADHESION: {
    key: "FICHE4_ADHESION",
    label: "Adhésion aux associations",
    formReminder:
      "Inscription = adhésion à Los Cascamèls et à Lo Rossinholet. Lisez le détail (participation, vie associative) avant de signer.",
    acceptanceText:
      "Après avoir pris connaissance de leurs fonctionnements, je souhaite adhérer aux associations « Los Cascamèls » et « Lo Rossinholet ».",
  },
  FICHE7_CANTINE_GARDERIE: {
    key: "FICHE7_CANTINE_GARDERIE",
    label: "Cantine, garderie & saquetas",
    formReminder:
      "Vous confirmez avoir lu le fonctionnement de la cantine, de la garderie et du système des saquetas, et vous engagez à le respecter.",
    acceptanceText:
      "J'ai pris connaissance du fonctionnement de la cantine et de la garderie et m'engage à le respecter, ainsi que les préconisations pour le système des saquetas.",
  },
  FICHE9_REGLEMENTS: {
    key: "FICHE9_REGLEMENTS",
    label: "Règlements intérieurs",
    formReminder:
      "Vous confirmez avoir lu les règlements de l'association, de l'école et du périscolaire, et vous engagez à les respecter.",
    acceptanceText:
      "Lu et approuvé : j'ai pris connaissance des règlements intérieurs de l'association, de l'école et du périscolaire et je m'engage à les respecter.",
  },
  FICHE11_DROIT_IMAGE: {
    key: "FICHE11_DROIT_IMAGE",
    label: "Droit à l'image",
    formReminder:
      "Autorisation de prises de vue / captations dans le cadre associatif (hors refus spécifiques ; les photos de classe de début d'année restent concernées).",
    acceptanceText:
      "Lu et approuvé : j'autorise l'association Escòla Calandreta Los Cascamèls à réaliser et diffuser des prises de vue / captations dans le cadre associatif, selon les conditions du droit à l'image.",
  },
  FICHE2_CONSENTEMENT_MEDICAL: {
    key: "FICHE2_CONSENTEMENT_MEDICAL",
    label: "Consentement médical d'urgence",
    formReminder:
      "En cas d'accident, autorisation donnée aux enseignants de prendre les mesures nécessaires (soins, hospitalisation, intervention).",
    acceptanceText:
      "En cas d'accident, j'autorise les enseignants à prendre, le cas échéant, toutes mesures (traitement médical, hospitalisation, intervention chirurgicale) rendues nécessaires par l'état de mon enfant.",
  },
};

export function getSignatureSubject(
  key: string
): EnrollmentSignatureSubject | null {
  return (
    ENROLLMENT_SIGNATURE_SUBJECTS[
      key as EnrollmentSignatureSubjectKey
    ] ?? null
  );
}
