/**
 * Interface pour les réponses API standardisées
 * @interface ApiResponse
 * @template T Type de données retournées
 * @property {boolean} success - Indique si la requête a réussi
 * @property {string} feedback - Message d'information ou d'erreur
 * @property {T} [data] - Données de la réponse
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  feedback: string;
  data?: T;
  status?: number;
  meta?: object;
}

/**
 * Interface pour les données d'établissement
 */
export interface EstablishmentData {
  establishment: {
    id: string;
    name: string;
    address: string;
    postalCode: string;
    city: string;
    email: string | null;
    phone: string | null;
    website: string | null;
    logoUrl: string | null;
    logoFileId: string | null;
    description: string | null;
    adminId: string;
    createdAt: Date;
    updatedAt: Date;
    admin?: {
      id: string;
      name: string | null;
      email: string;
    } | null;
  };
}

/**
 * Interface pour la pagination
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/**
 * Interface pour une réponse d'erreur
 */
export interface ApiError {
  feedback: string;
  details?: Record<string, string>;
}
