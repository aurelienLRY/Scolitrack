import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scolitack - Réinitialiser le mot de passe",
  description: "Réinitialisez votre mot de passe",
};

/**
 * Reset password layout
 * @param children - The children to render
 * @returns
 */
export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
