import { Metadata } from "next";
import ActivateAccountForm from "@/components/users/ActivateAccountForm";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Activation de compte | Scolitrack",
  description: "Activez votre compte et définissez votre mot de passe",
};

export default function ActivateAccountPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Image
            src="/img/Logo_Scolitrack.png"
            alt="Scolitrack Logo"
            width={80}
            height={80}
            className="mx-auto h-20 w-auto"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Activation de votre compte
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Veuillez définir votre mot de passe pour activer votre compte et
            accéder à la plateforme Scolitrack.
          </p>
        </div>
        <ActivateAccountForm />
      </div>
    </div>
  );
}
