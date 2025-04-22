"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import  Input  from "@/components/ui/inputs/Input";
import Card from "@/components/ui/card"    

// Schéma de validation pour le changement de mot de passe
const passwordChangeSchema = yup.object({
  currentPassword: yup.string().required("Le mot de passe actuel est requis"),
  newPassword: yup
    .string()
    .required("Le nouveau mot de passe est requis")
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/,
      "Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial"
    ),
  confirmPassword: yup
    .string()
    .required("La confirmation du mot de passe est requise")
    .oneOf([yup.ref("newPassword")], "Les mots de passe ne correspondent pas"),
});

type PasswordChangeFormData = yup.InferType<typeof passwordChangeSchema>;

type ChangePasswordFormProps = {
  isLoading?: boolean;
  onSubmit: (data: { currentPassword: string; newPassword: string }) => void;
};

export function ChangePasswordForm({ isLoading, onSubmit }: ChangePasswordFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordChangeFormData>({
    resolver: yupResolver(passwordChangeSchema),
  });

  const handleFormSubmit = (data: PasswordChangeFormData) => {
    onSubmit({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
    // Réinitialiser le formulaire après la soumission
    reset();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Card>
     
          <h1>Changer mon mot de passe</h1>
      
        <div className="space-y-4">
          <div>
            <Input
              label="Mot de passe actuel"
              type="password"
              placeholder="Entrez votre mot de passe actuel"
              error={errors.currentPassword}
              {...register("currentPassword")}
            />
          </div>
          <div>
            <Input
              label="Nouveau mot de passe"
              type="password"
              placeholder="Entrez votre nouveau mot de passe"
              error={errors.newPassword}
              {...register("newPassword")}
            />
          </div>
          <div>
            <Input
              label="Confirmer le nouveau mot de passe"
              type="password"
              placeholder="Confirmez votre nouveau mot de passe"
              error={errors.confirmPassword}
              {...register("confirmPassword")}
            />
          </div>
        </div>
        <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
            {isLoading ? "Modification en cours..." : "Modifier le mot de passe"}
          </Button>
        </div>
      </Card>
    </form>
  );
} 