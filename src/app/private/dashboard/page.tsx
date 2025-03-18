"use client";
import { useSession } from "next-auth/react";
import { LogoutForm } from "@/components/auth/logout-form";
export default function Dashboard() {
  const { data: session } = useSession();

  console.log(session);

  return (
    <section className="flex flex-col gap-8 items-center justify-center min-h-[calc(100vh-170px)]">
      <div className="flex flex-col items-center ">
        <h1>Dashboard - new version</h1>
        <p>{session?.user?.email || "No email"}</p>
      </div>
      <LogoutForm />
    </section>
  );
}
