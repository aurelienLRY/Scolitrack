"use client";
import { useParams } from "next/navigation";
import { useEnrollmentFile } from "@/hooks";
import { notFound } from "next/navigation";

export default function EnrollmentFileDetailsPage() {
    const params = useParams();
    const rawId = params.id;
    const id =
      typeof rawId === "string"
        ? rawId
        : Array.isArray(rawId)
          ? rawId[0] ?? ""
          : "";
    const { data, isLoading, error } = useEnrollmentFile(id);

    console.log("data",data?.data);

    if (isLoading) return <div>Loading...</div>;
    if (error) return notFound();

  return (
    <div className="container mx-auto">
        <h1 className="text-2xl font-bold">Dossier d&apos;inscription</h1>
        <p className="text-sm text-gray-500">Email: {data?.data?.email}</p>
        <p className="text-sm text-gray-500">Statut: {data?.data?.status}</p>
    </div>
  );
}
