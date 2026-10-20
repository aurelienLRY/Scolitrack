import {
  hasAllPrivileges,
  hasAnyPrivilege,
  hasPrivilege,
  PrivilegeName,
} from "@/config/privileges.config";
import {
  DEFAULT_LOGIN_REDIRECT,
  privilegesApiRoutes,
  privilegesRoutes,
  publicRoutes,
} from "@/config/routes.config";

const privileges = [
  { name: PrivilegeName.MANAGE_CAMPAIGNS },
  { name: PrivilegeName.MANAGE_ENROLLMENTS },
];

describe("hasPrivilege", () => {
  it("détecte un privilège présent", () => {
    expect(hasPrivilege(privileges, PrivilegeName.MANAGE_CAMPAIGNS)).toBe(true);
  });

  it("refuse un privilège absent", () => {
    expect(hasPrivilege(privileges, PrivilegeName.DELETE_DATA)).toBe(false);
  });
});

describe("hasAnyPrivilege", () => {
  it("accepte si un seul privilège de la liste est présent", () => {
    expect(
      hasAnyPrivilege(privileges, [
        PrivilegeName.DELETE_DATA,
        PrivilegeName.MANAGE_ENROLLMENTS,
      ])
    ).toBe(true);
  });
});

describe("hasAllPrivileges", () => {
  it("exige tous les privilèges demandés", () => {
    expect(
      hasAllPrivileges(privileges, [
        PrivilegeName.MANAGE_CAMPAIGNS,
        PrivilegeName.MANAGE_ENROLLMENTS,
      ])
    ).toBe(true);
    expect(
      hasAllPrivileges(privileges, [
        PrivilegeName.MANAGE_CAMPAIGNS,
        PrivilegeName.SETUP_APPLICATION,
      ])
    ).toBe(false);
  });
});

describe("routes.config", () => {
  it("expose les routes publiques d'accès sans session", () => {
    expect(publicRoutes).toEqual(
      expect.arrayContaining([
        "/",
        "/activate-account",
        "/forgot-password",
        "/reset-password",
        "/enrollment/[token]",
      ])
    );
    expect(DEFAULT_LOGIN_REDIRECT).toBe("/");
  });

  it("protège les campagnes et les dossiers par les privilèges attendus", () => {
    expect(privilegesApiRoutes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "/api/enrollment/campaigns",
          privilege: PrivilegeName.MANAGE_CAMPAIGNS,
        }),
        expect.objectContaining({
          path: "/api/enrollment/files",
          privilege: PrivilegeName.MANAGE_ENROLLMENTS,
        }),
      ])
    );
    expect(privilegesRoutes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "/private/enrollment/campaign",
          privilege: PrivilegeName.MANAGE_CAMPAIGNS,
        }),
      ])
    );
  });
});
