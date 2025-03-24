import { Tooltip } from "@/components/shared/tooltip";
import { CiLogout } from "react-icons/ci";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
export default function Footer() {
  const session = useSession();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <footer className="bg-background/20 relative min-h-20 border-t border-primary/10">
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-600 dark:text-gray-400">
          &copy; {new Date().getFullYear()} Scolitrack. Tous droits réservés.
        </p>
      </div>

      {session.data?.user && (
        <div className="absolute top-1/2 -translate-y-1/2 right-4">
          <Tooltip content="Déconnexion" position="left">
            <form action={handleLogout}>
              <button type="submit">
                <CiLogout className="text-4xl rotate-180 hover:text-accent cursor-pointer" />
              </button>
            </form>
          </Tooltip>
        </div>
      )}
    </footer>
  );
}
