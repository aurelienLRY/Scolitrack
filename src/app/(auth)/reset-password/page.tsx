"use client";

import { useState, Suspense, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Input from "@/components/ui/inputs/Input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Reset password schema
 */
const resetPasswordSchema = yup.object().shape({
  password: yup
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/,
      "Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial"
    )
    .required("Le mot de passe est requis"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Les mots de passe ne correspondent pas")
    .required("La confirmation du mot de passe est requise"),
});

type ResetPasswordFormData = yup.InferType<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (!token) {
      router.push("/unauthorized");
    }
  }, [token, router]);

  if (!token) {
    return null;
  }

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error("Lien de réinitialisation invalide");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      }).then((res) => res.json());

      if (!response.success) throw new Error(response.feedback);

      toast.success("Votre mot de passe a été réinitialisé avec succès");
      router.push("/");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-170px)] items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-900 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Réinitialiser votre mot de passe
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
            Entrez votre nouveau mot de passe
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <Input
                {...register("password")}
                type="password"
                placeholder="Nouveau mot de passe"
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div>
              <Input
                {...register("confirmPassword")}
                type="password"
                placeholder="Confirmer le mot de passe"
                className={errors.confirmPassword ? "border-red-500" : ""}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <div className="w-full flex justify-center">
            <Button
              type="submit"
              className="w-full max-w-fit"
              disabled={isLoading}
              color="accent"
            >
              {isLoading
                ? "Réinitialisation en cours..."
                : "Réinitialiser le mot de passe"}
            </Button>
          </div>

          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-primary-light/80 hover:text-primary-light/60"
            >
              Retour à la connexion
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
