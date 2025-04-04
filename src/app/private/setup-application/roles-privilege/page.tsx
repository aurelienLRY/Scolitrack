import { RoleList } from "@/components/roles-privileges/roles-list";
import { CreateRoleForm } from "@/components/roles-privileges/CreateRoleForm";
import {} from "@/components/roles-privileges/privileges-manager";
import PrivilegesManager from "@/components/roles-privileges/privileges-manager/PrivilegesManager";

export default function AdminRolesPage() {
  return (
    <section className="flex flex-col gap-20 max-w-[1300px] mx-auto py-10 px-4">
      <div className="flex flex-col gap-10  lg:flex-row  justify-center max-w-[90%] md:max-w-none mx-auto ">
        <RoleList />
        <CreateRoleForm />
      </div>

      <PrivilegesManager />
    </section>
  );
}
