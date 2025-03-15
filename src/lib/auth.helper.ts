import { auth } from "@/lib/auth";
import { unauthorized } from "next/navigation";

export const requiredAuth = async () => {
  const user = await auth();
  if (!user) {
    unauthorized();
  }
};
