import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
/**
 * Hook pour vérifier si l'utilisateur actuel possède un privilège spécifique
 * @param privilege - Le privilège à vérifier
 * @returns Un objet contenant l'état de l'autorisation
 */
export function useHasPrivilege(privilege: string) {
  const { data: session, status } = useSession();
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Si l'utilisateur n'est pas connecté, il n'est pas autorisé
    if (status === "loading") {
      setIsLoading(true);
      return;
    }

    // Si l'utilisateur n'est pas connecté, il n'est pas autorisé
    if (status !== "authenticated" || !session?.user) {
      setIsAuthorized(false);
      setIsLoading(false);
      return;
    }

    // Si l'utilisateur est SUPER_ADMIN, il a tous les privilèges
    if (session.user.roleName === "SUPER_ADMIN") {
      setIsAuthorized(true);
      setIsLoading(false);
      return;
    }

    // Vérifier si l'utilisateur a le privilège demandé
    const hasPrivilege = session.user.privileges?.includes(privilege) ?? false;
    setIsAuthorized(hasPrivilege);
    setIsLoading(false);
  }, [session, status, privilege]);

  return { isAuthorized, isLoading };
}

/**
 * Hook pour vérifier si l'utilisateur actuel a un des privilèges spécifiés
 * @param privileges - Les privilèges à vérifier (OR logique)
 * @returns Un objet contenant l'état de l'autorisation
 */
export function useHasAnyPrivilege(privileges: string[]) {
  const { data: session, status } = useSession();
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Si le statut est en chargement, on attend
    if (status === "loading") {
      setIsLoading(true);
      return;
    }

    // Si l'utilisateur n'est pas connecté, il n'est pas autorisé
    if (status !== "authenticated" || !session?.user) {
      setIsAuthorized(false);
      setIsLoading(false);
      return;
    }

    // Si l'utilisateur est SUPER_ADMIN, il a tous les privilèges
    if (session.user.roleName === "SUPER_ADMIN") {
      setIsAuthorized(true);
      setIsLoading(false);
      return;
    }

    // Vérifier si l'utilisateur a au moins un des privilèges demandés
    const hasAnyPrivilege = privileges.some(
      (privilege) => session.user.privileges?.includes(privilege) ?? false
    );

    setIsAuthorized(hasAnyPrivilege);
    setIsLoading(false);
  }, [session, status, privileges]);

  return { isAuthorized, isLoading };
}

/**
 * Hook pour vérifier si l'utilisateur actuel a tous les privilèges spécifiés
 * @param privileges - Les privilèges à vérifier (AND logique)
 * @returns Un objet contenant l'état de l'autorisation
 */
export function useHasAllPrivileges(privileges: string[]) {
  const { data: session, status } = useSession();
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Si le statut est en chargement, on attend
    if (status === "loading") {
      setIsLoading(true);
      return;
    }

    // Si l'utilisateur n'est pas connecté, il n'est pas autorisé
    if (status !== "authenticated" || !session?.user) {
      setIsAuthorized(false);
      setIsLoading(false);
      return;
    }

    // Si l'utilisateur est SUPER_ADMIN, il a tous les privilèges
    if (session.user.roleName === "SUPER_ADMIN") {
      setIsAuthorized(true);
      setIsLoading(false);
      return;
    }

    // Vérifier si l'utilisateur a tous les privilèges demandés
    const hasAllPrivileges = privileges.every(
      (privilege) => session.user.privileges?.includes(privilege) ?? false
    );

    setIsAuthorized(hasAllPrivileges);
    setIsLoading(false);
  }, [session, status, privileges]);

  return { isAuthorized, isLoading };
}

/**
 * Hook pour vérifier si l'utilisateur est authentifié
 * Redirige vers la page non autorisée si l'utilisateur n'est pas connecté
 * @returns Un objet contenant le statut de l'authentification
 */
export function useIsAuthenticated() {
  const { data: session, status } = useSession();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    // Si le statut est en chargement, on attend
    if (status === "loading") {
      setIsLoading(true);
      return;
    }

    // Si l'utilisateur n'est pas connecté, rediriger vers la page non autorisée
    if (status !== "authenticated" || !session?.user) {
      setIsAuthenticated(false);
      router.push("/unauthorized");
      setIsLoading(false);
      return;
    }

    setIsAuthenticated(true);
    setIsLoading(false);
  }, [session, status, router]);

  return { isAuthenticated, isLoading };
}
