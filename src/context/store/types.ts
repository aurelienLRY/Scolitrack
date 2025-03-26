// Types partagés pour les stores Zustand

export interface Role {
  id: string;
  name: string;
  description?: string;
  isPermanent: boolean;
  privileges?: Privilege[];
  rolePrivileges?: RolePrivilege[];
}

export interface Privilege {
  id: string;
  name: string;
  description?: string;
  roles?: Role[];
  rolePrivileges?: RolePrivilege[];
}

export interface RolePrivilege {
  id: string;
  roleId: string;
  privilegeId: string;
  role?: Role;
  privilege: Privilege;
}

// Types pour les opérations d'API

export interface CreateRoleData {
  name: string;
  description?: string;
  privilegeIds?: string[];
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
  privilegeIds?: string[];
}
