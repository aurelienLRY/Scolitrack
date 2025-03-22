export type {
  Account,
  DefaultSession,
  Profile,
  Session,
  User,
} from "@auth/core/types";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      roleName: string;
      privileges: string[];
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    roleName: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    roleName?: string;
    privileges?: string[];
    id?: string;
  }
}
