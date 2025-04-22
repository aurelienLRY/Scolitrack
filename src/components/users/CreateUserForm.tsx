"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { CreateUserSchema, CreateUserSchemaType } from "@/schemas/UserSchema";
import { toast } from "sonner";
import { useRoles } from "@/hooks/query/useRoles";
import Input, { SelectInput } from "@/components/ui/inputs/Input";

/**
 * Formulaire de création d'utilisateur pour les administrateurs
 */
export default function CreateUserForm() {
  const { data: roles } = useRoles();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserSchemaType>({
    resolver: yupResolver(CreateUserSchema),
    defaultValues: {
      role: "USER",
    },
  });

  // Gérer la soumission du formulaire
  const onSubmit = async (data: CreateUserSchemaType) => {
    setIsLoading(true);
    try {
      // Envoyer la requête à l'API
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }).then((res) => res.json());

      if (!response.success) {
        throw new Error(
          response.feedback || "Erreur lors de la création de l'utilisateur"
        );
      }

      // Afficher un message de succès
      toast.success(
        "L'utilisateur a été créé avec succès , un email d'invitation a été envoyé à l'utilisateur"
      );
      // Réinitialiser le formulaire
      reset();
    } catch (error) {
      console.log(
        "une erreur est survenue lors de la création de l'utilisateur :",
        error
      );
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        label="Nom complet"
        type="text"
        {...register("name")}
        error={errors.name}
        placeholder="Nom complet"
      />
      <Input
        label="Adresse email"
        type="email"
        {...register("email")}
        error={errors.email}
        placeholder="Adresse email"
      />
      <SelectInput
        label="Rôle"
        error={errors.role}
        className="mt-1 block w-full rounded-md"
        options={roles?.data || []}
        {...register("role")}
      />

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
