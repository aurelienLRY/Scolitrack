import { vi } from "vitest";

export const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
};

export const navigationState = {
  pathname: "/",
  params: {} as Record<string, string>,
  search: "",
};

export function resetNavigationMocks() {
  mockRouter.push.mockReset();
  mockRouter.replace.mockReset();
  mockRouter.prefetch.mockReset();
  mockRouter.back.mockReset();
  mockRouter.forward.mockReset();
  mockRouter.refresh.mockReset();
  navigationState.pathname = "/";
  navigationState.params = {};
  navigationState.search = "";
}
