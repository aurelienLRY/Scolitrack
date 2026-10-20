/**
 * Textes d'information du dossier d'inscription (issus des fiches papier).
 * Affichés en pop-up — lecture avant signature / info sur le formulaire.
 */

export type EnrollmentInfoDocId =
  | "horaires"
  | "adhesion"
  | "cantine_garderie"
  | "reglements"
  | "commissions"
  | "sorties"
  | "quitter_seul"
  | "droit_image"
  | "consentement_medical";

export interface EnrollmentInfoSection {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  note?: string;
}

export interface EnrollmentInfoDoc {
  id: EnrollmentInfoDocId;
  title: string;
  subtitle?: string;
  sections: EnrollmentInfoSection[];
}

export const ENROLLMENT_INFO_DOCS: Record<
  EnrollmentInfoDocId,
  EnrollmentInfoDoc
> = {
  horaires: {
    id: "horaires",
    title: "Horaires & fonctionnement",
    subtitle: "Pour un bon démarrage de la journée de classe",
    sections: [
      {
        title: "Horaires de classe",
        bullets: [
          "Matin : arrivée avant 9 h — départ à 12 h",
          "Après-midi : arrivée avant 14 h — départ (ou garderie) à 17 h",
          "La classe commence à 9 h et 14 h précises",
        ],
        paragraphs: [
          "L'école est fermée à clé à 9 h et à 14 h. Les retards perturbent le démarrage et le taux d'encadrement : un enfant en retard n'est accepté en classe qu'à la récréation.",
        ],
      },
      {
        title: "Garderie",
        bullets: [
          "Matin : 7 h 45 – 9 h (sans inscription)",
          "Soir : 17 h – 18 h 30 (inscription obligatoire sur le tableau du hall)",
          "À 18 h 30 l'école est fermée",
        ],
      },
    ],
  },

  adhesion: {
    id: "adhesion",
    title: "Adhésion Los Cascamèls & Lo Rossinholet",
    subtitle: "École associative — engagement de chaque famille",
    sections: [
      {
        title: "Pourquoi adhérer ?",
        paragraphs: [
          "Los Cascamèls est une école associative : l'accueil et la scolarisation de votre (vos) enfant(s) reposent sur l'implication des familles, avec les enseignants et les salariés.",
          "Toute inscription entraîne aussi l'adhésion à l'association amie Lo Rossinholet, qui organise des événements culturels pour soutenir l'école.",
        ],
      },
      {
        title: "Participation financière (rappel)",
        paragraphs: [
          "L'adhésion couvre l'accueil (7 h 45 – 18 h 30 les lundi, mardi, jeudi et vendredi en période scolaire) et le fonctionnement de l'école.",
          "Durée : du 1er septembre au 31 août. Toute année commencée est due en entier. Les montants peuvent être révisés en assemblée générale.",
        ],
        bullets: [
          "Adhésion : 70 € / mois (1 enfant), 110 € (2), 140 € (3)",
          "Frais pédagogiques : 20 € par enfant",
          "Cotisation Fédération des Calandretas : 75 € par enfant",
          "Saquetas : 5 € / pièce (commande possible en cours d'année)",
        ],
        note: "Les modalités de règlement (virement, espèces, chèques en 1 / 4 / 12 fois) sont indiquées dans le dossier papier. Un dossier incomplet à la rentrée peut empêcher l'accueil.",
      },
      {
        title: "Vie associative",
        paragraphs: [
          "Chaque parent s'inscrit à au moins une commission et y est actif. Les 4 « L » : Lieu, Langage, Limite, Loi — pour garder une atmosphère sereine.",
          "La langue occitane a sa place dans la vie associative, conformément à la charte des Calandretas.",
        ],
      },
    ],
  },

  cantine_garderie: {
    id: "cantine_garderie",
    title: "Cantine, garderie & saquetas",
    subtitle: "Fonctionnement du temps méridien et du périscolaire",
    sections: [
      {
        title: "Garderie",
        bullets: [
          "Matin : 7 h 45 – 9 h — pas d'inscription",
          "Soir : 17 h – 18 h 25 (fermeture 18 h 30) — inscription obligatoire sur le tableau du hall",
          "Annulation soir : SMS au 07 49 89 51 13 (portable périscolaire)",
          "Tout enfant non inscrit n'est pas accepté en garderie du soir",
        ],
      },
      {
        title: "Cantine (12 h – 14 h)",
        paragraphs: [
          "Si l'enfant est absent le matin : déposer le repas avant 9 h pour permettre la réchauffe avec les autres. Sinon, accueil seulement à 13 h 50.",
        ],
      },
      {
        title: "Système des saquetas",
        paragraphs: [
          "Vous préparez une saqueta ; les encadrants la réchauffent au four. À déposer le matin au plus tard à 9 h dans le réfrigérateur du réfectoire.",
          "Ce système demande une organisation rigoureuse : pour qu'il perdure, merci de respecter les pratiques suivantes.",
        ],
        bullets: [
          "Apporter les saquetas dans une glacière / sac marqué au nom de l'enfant (pour y replacer plats et desserts non mangés)",
          "Par enfant : une entrée + un repas chaud, OU un repas chaud + un dessert",
          "Tous les contenants marqués VISIBLEMENT (prénom + initiale du nom) — couvercles et boîtes",
          "Respecter les étagères du frigo (maternelles / primaires = 2 services)",
          "Saquetas verre de réchauffe fournies par l'école (14×14 cm, Duralex) — commande 5 € / pièce auprès de Julie / du bureau",
          "Saquetas non conformes en taille : servies froides (place limitée dans le four)",
          "Exception : prévenir par SMS (07 49 89 51 13) et apporter le repas à 11 h",
          "Récupérer chaque soir la saqueta vide à l'endroit dédié",
          "Maternelles : repas découpés à l'avance ; repas froids : post-it « FROID »",
        ],
      },
    ],
  },

  reglements: {
    id: "reglements",
    title: "Règlements intérieurs",
    subtitle: "École, périscolaire et association",
    sections: [
      {
        title: "École — points essentiels",
        bullets: [
          "Assurance scolaire obligatoire (responsabilité civile + individuelle accident)",
          "Vaccinations obligatoires selon la réglementation en vigueur",
          "Absences : prévenir l'école ; justificatif (SMS ou certificat)",
          "Pas de médicaments dans les cartables (sauf disposition particulière avec le chef d'établissement)",
          "Sorties : autorisation parentale en début d'année ; info par mail pour chaque sortie",
          "Tenue pratique, affaires marquées au nom de l'enfant",
          "Goûters matin et après-midi conseillés",
          "Respect des personnes, du matériel et des locaux ; portail fermé à chaque passage",
        ],
      },
      {
        title: "Périscolaire (garderie / cantine)",
        bullets: [
          "Inscription obligatoire sur les tableaux (cantine, repas API, garderie du soir)",
          "Fermeture garderie 18 h 30 — au-delà, procédure réglementaire (gendarmerie)",
          "Enfant remis à un membre de l'équipe ; reprise uniquement par personne autorisée (pièce d'identité si besoin)",
          "Enfants malades / contagieux : pas d'accueil ; signaler les maladies contagieuses",
        ],
      },
      {
        title: "Association",
        paragraphs: [
          "L'inscription implique d'être membre actif de Los Cascamèls : au moins une commission, respect des décisions collectives, des équipes et des lieux.",
          "En signant, vous confirmez avoir pris connaissance des règlements de l'association, de l'école et du périscolaire, et vous vous engagez à les respecter.",
        ],
      },
    ],
  },

  commissions: {
    id: "commissions",
    title: "Les commissions",
    subtitle: "Au moins une commission par parent, active toute l'année",
    sections: [
      {
        title: "Engagement",
        paragraphs: [
          "Je m'inscris sur au moins une commission et m'engage à y être actif : proposer, prendre en charge une mission, participer aux réunions, relayer l'info. En cas d'absence, je me tiens informé des décisions.",
          "Le budget d'entrée des recettes n'est pas fixe : les festivités et le mécénat sont essentiels au fonctionnement de l'école.",
        ],
      },
      {
        title: "Festivités",
        paragraphs: [
          "Organisation des événements (loto, marchés, kermesse…), bilan, affichage. Même hors commission, chaque famille donne un coup de main le jour J (installation, stands, rangement, ménage).",
        ],
      },
      {
        title: "Mécénat & subventions",
        paragraphs: [
          "Recherche de donateurs et subventions, dossiers auprès des collectivités, suivi des forfaits de scolarité des communes, remerciements et invitations.",
        ],
      },
      {
        title: "Communication",
        paragraphs: [
          "Affiches, flyers, diffusion médias et réseaux, supports internes (livret, trombinoscope, plaquette…).",
        ],
      },
      {
        title: "Bricolage & extérieurs",
        paragraphs: [
          "Petits et gros travaux, entretien des espaces extérieurs, demandes d'achat de matériel via le bureau.",
        ],
      },
    ],
  },

  sorties: {
    id: "sorties",
    title: "Sorties & classes de découverte",
    sections: [
      {
        title: "Autorisation",
        paragraphs: [
          "Vous autorisez votre enfant à participer à toutes les sorties et classes de découverte organisées par l'escòla Calandreta Los Cascamèls.",
          "Une information est envoyée à l'avance par mail pour chaque sortie. Vous vous engagez à vêtir votre enfant de manière adaptée (notamment pour l'école du dehors / sorties nature) et à vous tenir informé(e) des activités proposées.",
        ],
      },
    ],
  },

  quitter_seul: {
    id: "quitter_seul",
    title: "Quitter l'école seul",
    sections: [
      {
        title: "Attention",
        paragraphs: [
          "N'acceptez cette autorisation que si vous autorisez réellement votre enfant à quitter l'école seul après les cours.",
          "Pour les enfants de plus de six ans, une autorisation de sortie seule peut être demandée. En dehors des heures légales, une décharge écrite est obligatoire.",
        ],
      },
    ],
  },

  droit_image: {
    id: "droit_image",
    title: "Droit à l'image",
    sections: [
      {
        title: "Ce que vous autorisez",
        paragraphs: [
          "Vous autorisez l'association Escòla Calandreta Los Cascamèls (chemin de la Campagnette, 11160 Rieux-Minervois) à réaliser des prises de vue photographiques, vidéos ou captations numériques de votre enfant, dans le cadre associatif.",
          "Les images pourront être utilisées sur les supports de l'association (presse, livre, exposition, site, réseaux sociaux, etc.), sans rémunération, pour un territoire et une durée non limités, dans le respect de la vie privée et de la réputation.",
        ],
        note: "Les refus ne s'appliquent pas aux photos de classe de début d'année.",
      },
    ],
  },

  consentement_medical: {
    id: "consentement_medical",
    title: "Consentement médical d'urgence",
    sections: [
      {
        title: "En cas d'accident",
        paragraphs: [
          "Vous autorisez les enseignants à prendre, le cas échéant, toutes les mesures rendues nécessaires par l'état de votre enfant : traitement médical, hospitalisation, intervention chirurgicale.",
          "Pensez à renseigner l'hôpital / clinique souhaité(e) et votre médecin traitant dans la fiche santé de l'enfant.",
        ],
      },
    ],
  },
};

/** Lien sujet de signature → document d'info à lire avant d'envoyer. */
export const SIGNATURE_INFO_DOC: Partial<
  Record<string, EnrollmentInfoDocId>
> = {
  FICHE1_HORAIRES: "horaires",
  FICHE4_ADHESION: "adhesion",
  FICHE7_CANTINE_GARDERIE: "cantine_garderie",
  FICHE9_REGLEMENTS: "reglements",
  FICHE3_SORTIES: "sorties",
  FICHE3_QUITTER_SEUL: "quitter_seul",
  FICHE11_DROIT_IMAGE: "droit_image",
  FICHE2_CONSENTEMENT_MEDICAL: "consentement_medical",
};

export function getEnrollmentInfoDoc(
  id: EnrollmentInfoDocId
): EnrollmentInfoDoc {
  return ENROLLMENT_INFO_DOCS[id];
}
