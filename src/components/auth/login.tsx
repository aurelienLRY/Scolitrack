"use client";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";

import Input from "../shared/Input";
import { Button } from "@/components/shared/button";
import { toast } from "sonner";
import { LoginSchema } from "@/schemas/LoginSchema";
import { yupResolver } from "@hookform/resolvers/yup";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface LoginFormData {
  email: string;
  password: string;
}

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: yupResolver(LoginSchema),
  });

  const router = useRouter();

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
        callbackUrl: "/private/dashboard",
      });

      if (result?.error === "CredentialsSignin") {
        toast.error("Email ou mot de passe incorrect");
        return;
      }

      if (result?.error) {
        toast.error("Une erreur est survenue");
        return;
      }
    } catch (error) {
      console.error("Erreur de connexion:", error);
      toast.error("Une erreur est survenue lors de la connexion");
    }
  };
  const { status } = useSession();

  if (status === "authenticated") {
    router.push("/private/dashboard");
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex min-w-[300px] w-[90%] max-w-[400px] flex-col items-center gap-6 rounded-md bg-primary p-6 shadow-md dark:bg-primary/50 shadow-primary border-t-2 border-white/20"
    >
      <h2 className="text-white">Connexion</h2>

      <div className="flex w-full max-w-[250px] flex-col gap-4 items-center">
        <Input
          label="Email"
          type="email"
          {...register("email", {
            required: "L'email est requis",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Adresse email invalide",
            },
          })}
          error={errors.email}
        />

        <Input
          label="Mot de passe"
          type="password"
          {...register("password", {
            required: "Le mot de passe est requis",
          })}
          error={errors.password}
        />
        <Link
          href="/forget-password"
          className="text-sm text-gray-500 dark:text-gray-400 italic hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          Mot de passe oublié ?
        </Link>

        <Button
          type="submit"
          disabled={isSubmitting}
          variant="secondary"
          className="max-w-[150px]"
        >
          {isSubmitting ? "Connexion en cours..." : "Se connecter"}
        </Button>
      </div>
    </form>
  );
}
