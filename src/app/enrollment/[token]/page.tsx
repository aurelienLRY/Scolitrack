"use client";

import { useParams } from "next/navigation";
import { Card } from "@/components/ui";
import { useEnrollmentFileByToken } from "@/hooks";
import PublicEnrollmentForm from "@/components/enrollment-form/PublicEnrollmentForm";

export default function PublicEnrollmentPage() {
  const params = useParams();
  const rawToken = params.token;
  const token =
    typeof rawToken === "string"
      ? rawToken
      : Array.isArray(rawToken)
        ? rawToken[0] ?? ""
        : "";

  const { data, isLoading, error } = useEnrollmentFileByToken(token);
  const file = data?.data;

  if (isLoading) {
    return <div className="container mx-auto py-8">Chargement...</div>;
  }

  if (error || !file) {
    return (
      <div className="container mx-auto py-8">
        <Card className="p-6" variant="primary">
          <h1 className="text-xl font-bold">Lien invalide</h1>
          <p className="text-muted-foreground">
            Ce lien d&apos;inscription est invalide ou expiré.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <PublicEnrollmentForm token={token} file={file} />
    </div>
  );
}
