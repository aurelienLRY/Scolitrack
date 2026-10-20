import { vi, type Mock } from "vitest";

type ModelDelegate = Record<string, Mock>;

const delegates = new Map<string, ModelDelegate>();
const clientFns = new Map<string, Mock>();

function createDelegate(): ModelDelegate {
  return new Proxy({} as ModelDelegate, {
    get(target, prop: string) {
      if (prop === "then") return undefined;
      if (!target[prop]) {
        target[prop] = vi.fn();
      }
      return target[prop];
    },
  });
}

/**
 * Client Prisma factice. Chaque modèle et chaque méthode
 * (`findMany`, `create`, etc.) est créé à la première utilisation.
 * `$transaction` reçoit le même client comme callback `tx`.
 */
export const prismaMock = new Proxy({} as Record<string, unknown>, {
  get(_target, prop: string) {
    if (typeof prop !== "string") return undefined;

    if (prop === "$transaction") {
      if (!clientFns.has(prop)) {
        clientFns.set(
          prop,
          vi.fn(async (arg: unknown) => {
            if (typeof arg === "function") {
              return arg(prismaMock);
            }
            return Promise.all(arg as Promise<unknown>[]);
          })
        );
      }
      return clientFns.get(prop);
    }

    if (!delegates.has(prop)) {
      delegates.set(prop, createDelegate());
    }
    return delegates.get(prop);
  },
}) as Record<string, ModelDelegate> & {
  $transaction: Mock;
};

export function resetPrismaMock() {
  for (const delegate of delegates.values()) {
    Object.values(delegate).forEach((method) => {
      method.mockReset();
    });
  }
  for (const fn of clientFns.values()) {
    fn.mockReset();
    fn.mockImplementation(async (arg: unknown) => {
      if (typeof arg === "function") {
        return (arg as (tx: unknown) => unknown)(prismaMock);
      }
      return Promise.all(arg as Promise<unknown>[]);
    });
  }
}
