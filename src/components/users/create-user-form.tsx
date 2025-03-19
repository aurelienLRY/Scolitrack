"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { CreateUserSchema, CreateUserSchemaType } from "@/schemas/UserSchema";
import { UserRole } from "@prisma/client";
import { toast } from "sonner";

/**
 * Formulaire de création d'utilisateur pour les administrateurs
 */
export default function CreateUserForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  // Configurer react-hook-form avec validation Yup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserSchemaType>({
    resolver: yupResolver(CreateUserSchema),
    defaultValues: {
      role: UserRole.USER,
    },
  });

  // Gérer la soumission du formulaire
  const onSubmit = async (data: CreateUserSchemaType) => {
    setIsLoading(true);
    setSuccess(null);

    try {
      // Envoyer la requête à l'API
      const response = await fetch("/api/users", {
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
          result.error || "Erreur lors de la création de l'utilisateur"
        );
      }

      // Afficher un message de succès
      toast.success("L'utilisateur a été créé avec succès");
      setSuccess(`Un email d'invitation a été envoyé à ${data.email}`);

      // Réinitialiser le formulaire
      reset();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Une erreur est survenue");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Nom complet
        </label>
        <input
          id="name"
          type="text"
          className={`mt-1 block w-full rounded-md ${
            errors.name ? "border-red-500" : "border-gray-300"
          } shadow-sm focus:border-indigo-500 focus:ring-indigo-500`}
          {...register("name")}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Adresse email
        </label>
        <input
          id="email"
          type="email"
          className={`mt-1 block w-full rounded-md ${
            errors.email ? "border-red-500" : "border-gray-300"
          } shadow-sm focus:border-indigo-500 focus:ring-indigo-500`}
          {...register("email")}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="role"
          className="block text-sm font-medium text-gray-700"
        >
          Rôle
        </label>
        <select
          id="role"
          className={`mt-1 block w-full rounded-md ${
            errors.role ? "border-red-500" : "border-gray-300"
          } shadow-sm focus:border-indigo-500 focus:ring-indigo-500`}
          {...register("role")}
        >
          <option value={UserRole.USER}>Parent / Tuteur</option>
          <option value={UserRole.TEACHER}>Enseignant</option>
          <option value={UserRole.ADMIN}>Administrateur</option>
          <option value={UserRole.SUPER_ADMIN}>Super Administrateur</option>
        </select>
        {errors.role && (
          <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
        )}
      </div>

      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {isLoading ? "Création en cours..." : "Créer l'utilisateur"}
        </button>
      </div>
    </form>
  );
}
