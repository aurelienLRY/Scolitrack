"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  ActivateAccountSchema,
  ActivateAccountSchemaType,
} from "@/schemas/UserSchema";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

/**
 * Formulaire d'activation de compte
 */
export default function ActivateAccountForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Configurer react-hook-form avec validation Yup
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ActivateAccountSchemaType>({
    resolver: yupResolver(ActivateAccountSchema),
    defaultValues: {
      token: token || "",
    },
  });

  // Gérer la soumission du formulaire
  const onSubmit = async (data: ActivateAccountSchemaType) => {
    setIsLoading(true);
    setError(null);

    try {
      // Envoyer la requête à l'API
      const response = await fetch("/api/users/activate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      // Traiter la réponse
      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Erreur lors de l'activation du compte"
        );
      }

      // Afficher un message de succès
      toast.success("Votre compte a été activé avec succès");

      // Rediriger vers la page de connexion
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
        toast.error(error.message);
      } else {
        setError("Une erreur est survenue");
        toast.error("Une erreur est survenue");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="rounded-md bg-yellow-50 p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Lien d&apos;activation invalide
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Le lien d&apos;activation que vous avez utilisé est invalide ou
                incomplet. Veuillez vérifier que vous avez utilisé le lien
                complet fourni dans votre email d&apos;invitation.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
      <input type="hidden" {...register("token")} />

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Erreur d&apos;activation
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          className={`mt-1 block w-full rounded-md ${
            errors.password ? "border-red-500" : "border-gray-300"
          } shadow-sm focus:border-indigo-500 focus:ring-indigo-500`}
          {...register("password")}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700"
        >
          Confirmer le mot de passe
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          className={`mt-1 block w-full rounded-md ${
            errors.confirmPassword ? "border-red-500" : "border-gray-300"
          } shadow-sm focus:border-indigo-500 focus:ring-indigo-500`}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {isLoading ? "Activation en cours..." : "Activer mon compte"}
        </button>
      </div>

      <div className="flex items-center justify-center">
        <div className="text-sm">
          <Link
            href="/"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    </form>
  );
}
