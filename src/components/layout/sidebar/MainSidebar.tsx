import React from "react";
import Authorized from "@/components/auth/Authorization";
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
} from "@/components/ui/sidebar.aceternity";
import { UserMenu } from "@/components/users/UserMenu";
import { TSideBarItem, sidebarItem } from "@/config/Main-sidebar.config";
import { Home } from "lucide-react";
import Image from "next/image";

const CustomSidebar = ({ navItem }: { navItem: TSideBarItem }) => {
  return (
    <Authorized privilege={navItem.privilege}>
      <SidebarLink
        link={{
          label: navItem.label,
          href: navItem.href,
          icon: navItem.icon,
        }}
      />
    </Authorized>
  );
};

export default function MainSidebar() {
  const [open, setOpen] = React.useState(false);

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10 ">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-2 overflow-x-hidden">
            <Image
              src="/img/Logo_Scolitrack.svg"
              alt="logo"
              width={25}
              height={25}
            />
            <p className=" font-bold">
              Scoli<span className="text-accent">Track</span>
            </p>
          </div>
          <div className="w-full h-1 bg-primary/30  rounded-full"></div>
          <div>
            <SidebarLink
              link={{
                label: "Home",
                href: "/private",
                icon: <Home />,
              }}
            />
            {sidebarItem.map((item) => (
              <CustomSidebar key={item.href} navItem={item} />
            ))}
          </div>
        </div>
        <div className="flex justify-center items-center ">
          <UserMenu />
        </div>
      </SidebarBody>
    </Sidebar>
  );
}

MainSidebar.displayName = "MainSidebar";
