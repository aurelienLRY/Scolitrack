import { useSession } from "next-auth/react";
import Header from "./Header";
import MainSidebar from "../sidebar/MainSidebar";
export default function HeaderSwitch({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();

  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <Header />
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
      <MainSidebar />
      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto p-6">
        {children}
      </div>
    </div>
  );
}

HeaderSwitch.displayName = "HeaderSwitch";
