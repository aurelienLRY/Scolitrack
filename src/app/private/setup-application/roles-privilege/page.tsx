import { RoleList } from "@/components/roles-privileges";
import { CreateRoleForm } from "@/components/roles-privileges/CreateRoleForm";
import PrivilegesManager from "@/components/roles-privileges/PrivilegesManager";

export default function AdminRolesPage() {
  return (
    <section className="flex flex-col gap-20 ">
      <div className="flex flex-col  gap-10 items-start lg:flex-row lg:items-center justify-center">
        <RoleList />
        <CreateRoleForm />
      </div>
      <PrivilegesManager />
    </section>
  );
}
