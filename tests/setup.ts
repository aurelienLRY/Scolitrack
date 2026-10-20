import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import React from "react";
import { afterEach, vi } from "vitest";

afterEach(() => {
  cleanup();
});

class MockObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
}

vi.stubGlobal("IntersectionObserver", MockObserver);
vi.stubGlobal("ResizeObserver", MockObserver);
function matchMedia(query: string) {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  };
}

Object.defineProperty(window, "matchMedia", {
  writable: true,
  configurable: true,
  value: matchMedia,
});

vi.mock("next/navigation", async () => {
  const { mockRouter, navigationState } = await import(
    "./mocks/next-navigation"
  );

  return {
    useRouter: () => mockRouter,
    usePathname: () => navigationState.pathname,
    useParams: () => navigationState.params,
    useSearchParams: () => new URLSearchParams(navigationState.search),
    redirect: vi.fn(),
    notFound: vi.fn(),
  };
});

vi.mock("next/image", () => ({
  default: (props: { src?: string; alt?: string }) =>
    React.createElement("img", { src: props.src, alt: props.alt ?? "" }),
}));

vi.mock("next-auth/react", async () => {
  const { authState, mockSignIn, mockSignOut } = await import(
    "./mocks/next-auth"
  );

  return {
    useSession: () => ({
      data: authState.session,
      status: authState.status,
    }),
    signIn: mockSignIn,
    signOut: mockSignOut,
    SessionProvider: ({ children }: { children: React.ReactNode }) => children,
  };
});
