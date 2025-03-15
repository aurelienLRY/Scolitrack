import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scolitack - Mot de passe oublié",
  description: "Réinitialisez votre mot de passe",
};

/**
 * Forgot password layout
 * @param children - The children to render
 * @returns
 */
export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
