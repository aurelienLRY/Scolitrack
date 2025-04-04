import { ApiResponse } from "@/types/api.type";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface FetchOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  cache?: RequestCache;
}

/**
 * Service pour effectuer des requêtes HTTP standardisées
 * Optimisé pour une API locale
 */
class FetchService {
  /**
   * Effectue une requête HTTP et gère les erreurs
   * @param url URL de la requête
   * @param options Options de la requête
   * @returns Données de la réponse
   */
  static async fetchApi<T = unknown>(
    url: string,
    options?: FetchOptions
  ): Promise<ApiResponse<T>> {
    const { method = "GET", body, headers = {}, cache } = options || {};

    const requestOptions: RequestInit = {
      method,
      cache,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      credentials: "same-origin", // Optimisé pour API locale
    };

    // Ajouter le body si présent
    if (body) {
      requestOptions.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        // Essayer d'extraire le message d'erreur
        try {
          const errorData = await response.json();
          throw new Error(
            errorData.feedback || `Erreur HTTP: ${response.status}`
          );
        } catch {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
      }

      const data = (await response.json()) as ApiResponse<T>;

      if (!data.success) {
        throw new Error(data.feedback || `Requête échouée: ${method} ${url}`);
      }

      return data;
    } catch (error) {
      console.error(`Erreur lors de la requête ${method} ${url}:`, error);
      throw error;
    }
  }

  /**
   * Effectue une requête GET
   * @param url URL de la requête
   * @param options Options additionnelles
   * @returns Données de la réponse
   */
  static async get<T = unknown>(
    url: string,
    options?: Omit<FetchOptions, "method" | "body">
  ): Promise<ApiResponse<T>> {
    return this.fetchApi<T>(url, {
      method: "GET",
      ...options,
    });
  }

  /**
   * Effectue une requête POST
   * @param url URL de la requête
   * @param body Corps de la requête
   * @param options Options additionnelles
   * @returns Données de la réponse
   */
  static async post<T = unknown>(
    url: string,
    body: unknown,
    options?: Omit<FetchOptions, "method" | "body">
  ): Promise<ApiResponse<T>> {
    return this.fetchApi<T>(url, {
      method: "POST",
      body,
      ...options,
    });
  }

  /**
   * Effectue une requête POST avec FormData (pour upload de fichiers)
   * @param url URL de la requête
   * @param formData FormData à envoyer
   * @returns Données de la réponse
   */
  static async postFormData<T = unknown>(
    url: string,
    formData: FormData
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
        credentials: "same-origin",
      });

      if (!response.ok) {
        try {
          const errorData = await response.json();
          throw new Error(
            errorData.feedback || `Erreur HTTP: ${response.status}`
          );
        } catch {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
      }

      return (await response.json()) as ApiResponse<T>;
    } catch (error) {
      console.error(`Erreur lors de l'upload à ${url}:`, error);
      throw error instanceof Error ? error : new Error("Erreur réseau");
    }
  }

  /**
   * Effectue une requête PUT
   * @param url URL de la requête
   * @param body Corps de la requête
   * @param options Options additionnelles
   * @returns Données de la réponse
   */
  static async put<T = unknown>(
    url: string,
    body: unknown,
    options?: Omit<FetchOptions, "method" | "body">
  ): Promise<ApiResponse<T>> {
    return this.fetchApi<T>(url, {
      method: "PUT",
      body,
      ...options,
    });
  }

  /**
   * Effectue une requête DELETE
   * @param url URL de la requête
   * @param options Options additionnelles
   * @returns Données de la réponse
   */
  static async delete<T = unknown>(
    url: string,
    options?: Omit<FetchOptions, "method">
  ): Promise<ApiResponse<T>> {
    return this.fetchApi<T>(url, {
      method: "DELETE",
      ...options,
    });
  }
}

export default FetchService;
