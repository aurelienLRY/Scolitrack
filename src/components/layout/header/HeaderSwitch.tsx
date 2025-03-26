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
      <>
        <Header />
        {children}
      </>
    );
  } else {
    return (
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-89px)]">
        <MainSidebar />
        <div className="flex-1 p-6">{children}</div>
      </div>
    );
  }
}

HeaderSwitch.displayName = "HeaderSwitch";
