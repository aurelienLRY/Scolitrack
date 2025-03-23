"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Input from "@/components/shared/Input";
import { Button } from "@/components/shared/button";
import { toast } from "sonner";
import Link from "next/link";

const forgotPasswordSchema = yup.object().shape({
  email: yup.string().email("Email invalide").required("L'email est requis"),
});

type ForgotPasswordFormData = yup.InferType<typeof forgotPasswordSchema>;

/**
 * Forgot password page
 * @returns
 */
export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }).then((res) => res.json());

      toast.success(response.feedback);
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
      <div className="w-full max-w-4xl space-y-8">
        <div>
          <h2 className="mt-6 text-center">Mot de passe oublié ?</h2>
          <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
            Entrez votre email pour recevoir un lien de réinitialisation
          </p>
        </div>
        <form
          className="mt-8 space-y-6 max-w-[300px] mx-auto"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <Input
                {...register("email")}
                type="email"
                placeholder="Email"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              type="submit"
              className="min-w-fit"
              disabled={isLoading}
              variant="accent"
            >
              {isLoading ? "Envoi en cours..." : "Envoyer le lien"}
            </Button>
          </div>

          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-primary-light hover:text-primary-light/80"
            >
              Retour à la connexion
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
