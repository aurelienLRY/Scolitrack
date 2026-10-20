import { vi } from "vitest";

export type MockSession = {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    privileges?: string[];
  };
} | null;

export const authState: {
  session: MockSession;
  status: "authenticated" | "unauthenticated" | "loading";
} = {
  session: null,
  status: "unauthenticated",
};

export const mockSignIn = vi.fn();
export const mockSignOut = vi.fn();

export function resetAuthMocks() {
  authState.session = null;
  authState.status = "unauthenticated";
  mockSignIn.mockReset();
  mockSignOut.mockReset();
}
