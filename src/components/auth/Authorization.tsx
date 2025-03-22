import { ReactNode } from "react";
import {
  useHasPrivilege,
  useHasAnyPrivilege,
  useHasAllPrivileges,
} from "@/hooks/useAuthorization";
import { useSession } from "next-auth/react";
import { unauthorized } from "next/navigation";

/**
 * Composant qui vérifie un seul privilège
 */
function SinglePrivilegeAuthorization({
  privilege,
  children,
  loadingComponent,
  fallback,
}: {
  privilege: string;
  children: ReactNode;
  loadingComponent?: ReactNode;
  fallback?: ReactNode;
}) {
  const { isAuthorized, isLoading } = useHasPrivilege(privilege);

  if (isLoading) {
    return loadingComponent ? <>{loadingComponent}</> : null;
  }

  return isAuthorized ? <>{children}</> : fallback ? <>{fallback}</> : null;
}

/**
 * Composant qui vérifie plusieurs privilèges (OR logique)
 */
function AnyPrivilegeAuthorization({
  privileges,
  children,
  loadingComponent,
  fallback,
}: {
  privileges: string[];
  children: ReactNode;
  loadingComponent?: ReactNode;
  fallback?: ReactNode;
}) {
  const { isAuthorized, isLoading } = useHasAnyPrivilege(privileges);

  if (isLoading) {
    return loadingComponent ? <>{loadingComponent}</> : null;
  }

  return isAuthorized ? <>{children}</> : fallback ? <>{fallback}</> : null;
}

/**
 * Composant qui vérifie plusieurs privilèges (AND logique)
 */
function AllPrivilegesAuthorization({
  privileges,
  children,
  loadingComponent,
  fallback,
}: {
  privileges: string[];
  children: ReactNode;
  loadingComponent?: ReactNode;
  fallback?: ReactNode;
}) {
  const { isAuthorized, isLoading } = useHasAllPrivileges(privileges);

  if (isLoading) {
    return loadingComponent ? <>{loadingComponent}</> : null;
  }

  return isAuthorized ? <>{children}</> : fallback ? <>{fallback}</> : null;
}

type AuthorizationProps = {
  /** Contenu à afficher si l'utilisateur est autorisé */
  children: ReactNode;
  /** Contenu à afficher en attendant la vérification (optionnel) */
  loadingComponent?: ReactNode;
  /** Contenu à afficher si l'utilisateur n'est pas autorisé (optionnel) */
  fallback?: ReactNode;
} & (
  | {
      /** Un seul privilège à vérifier */
      privilege: string;
      privileges?: never;
      requireAll?: never;
    }
  | {
      /** Liste de privilèges à vérifier */
      privilege?: never;
      privileges: string[];
      /** Si true, tous les privilèges sont requis (AND), sinon au moins un (OR) */
      requireAll?: boolean;
    }
);

/**
 * Composant qui affiche son contenu uniquement si l'utilisateur possède les privilèges requis.
 *
 * Utilisation:
 *
 * ```tsx
 * // Avec un seul privilège
 * <Authorization privilege="CREATE_USER">
 *   <button>Créer un utilisateur</button>
 * </Authorization>
 *
 * // Avec plusieurs privilèges (OR logique - au moins un)
 * <Authorization privileges={["UPDATE_USER", "DELETE_USER"]}>
 *   <button>Gérer les utilisateurs</button>
 * </Authorization>
 *
 * // Avec plusieurs privilèges (AND logique - tous requis)
 * <Authorization privileges={["UPDATE_USER", "DELETE_USER"]} requireAll>
 *   <button>Gérer les utilisateurs</button>
 * </Authorization>
 * ```
 */
export default function Authorization(props: AuthorizationProps) {
  const { status } = useSession();

  // Si l'utilisateur n'est pas connecté, on affiche le fallback ou rien
  if (status === "unauthenticated") {
    return props.fallback ? <>{props.fallback}</> : null;
  }

  // Cas pour un seul privilège
  if ("privilege" in props && props.privilege) {
    return (
      <SinglePrivilegeAuthorization
        privilege={props.privilege}
        loadingComponent={props.loadingComponent}
        fallback={props.fallback}
      >
        {props.children}
      </SinglePrivilegeAuthorization>
    );
  }

  // Cas pour plusieurs privilèges
  if (
    "privileges" in props &&
    props.privileges &&
    props.privileges.length > 0
  ) {
    if (props.requireAll) {
      return (
        <AllPrivilegesAuthorization
          privileges={props.privileges}
          loadingComponent={props.loadingComponent}
          fallback={props.fallback}
        >
          {props.children}
        </AllPrivilegesAuthorization>
      );
    } else {
      return (
        <AnyPrivilegeAuthorization
          privileges={props.privileges}
          loadingComponent={props.loadingComponent}
          fallback={props.fallback}
        >
          {props.children}
        </AnyPrivilegeAuthorization>
      );
    }
  }

  // Si aucune condition n'est spécifiée, on n'affiche rien
  return unauthorized();
}
