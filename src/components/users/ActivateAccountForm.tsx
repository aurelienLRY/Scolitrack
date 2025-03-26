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
import Input from "@/components/ui/inputs/Input";

/**
 * Formulaire d'activation de compte
 */
export default function ActivateAccountForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);

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

    try {
      // Envoyer la requête à l'API
      const response = await fetch("/api/auth/activate-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }).then((res) => res.json());

      if (response.success) {
        toast.success("Votre compte a été activé avec succès");
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        toast.error(response.feedback);
      }
    } catch (error) {
      console.error("Erreur lors de l'activation du compte:", error);
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

      <div>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          {...register("password")}
          label="Mot de passe"
          error={errors.password}
        />
      </div>

      <div>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          {...register("confirmPassword")}
          label="Confirmer le mot de passe"
          error={errors.confirmPassword}
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-accent text-white"
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
