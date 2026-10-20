import { Tooltip } from "@/components/ui/tooltip";
import { LogOut } from "lucide-react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
export default function Footer() {
  const session = useSession();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <footer className="relative shrink-0 border-t border-primary/10 bg-background/20">
      <div className="container mx-auto px-4 py-2.5">
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          &copy; {new Date().getFullYear()} Scolitrack. Tous droits réservés.
        </p>
      </div>

      {session.data?.user && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <Tooltip content="Déconnexion" position="left">
            <form action={handleLogout}>
              <button type="submit">
                <LogOut className="size-5 rotate-180 cursor-pointer hover:text-accent" />
              </button>
            </form>
          </Tooltip>
        </div>
      )}
    </footer>
  );
}
