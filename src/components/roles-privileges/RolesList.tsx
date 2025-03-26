"use client";
import { DeleteButton, UpdateButton } from "@/components/ui/button";
import { useRoleStore } from "@/context/store/RoleStore";
import { Role } from "@/context/store/types";
import Card from "../ui/card";
export const RoleList = () => {
  const { roles } = useRoleStore();

  return (
    <Card className="flex flex-col gap-4">
      <div className="px-4 py-5 sm:px-6 ">
        <h3 className=" leading-6">Liste des rôles</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Consultez et gérez les rôles existants.
        </p>
      </div>

      <RoleTable roles={roles} />
    </Card>
  );
};

const RoleTable = ({ roles }: { roles: Role[] }) => {
  const { deleteRole, isLoading } = useRoleStore();

  const handleDelete = async (id: string) => {
    const confirm = window.confirm("Voulez-vous vraiment supprimer ce rôle ?");
    if (confirm) {
      await deleteRole(id);
    }
  };
  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="overflow-x-auto ">
        <table className=" divide-y divide-primary overflow-x-auto">
          <thead className="bg-primary/10 ">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left  font-medium text-xl text-text/50  uppercase tracking-wider"
              >
                Nom
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xl font-medium text-text/50  uppercase tracking-wider"
              >
                Description
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xl font-medium text-text/50  uppercase tracking-wider"
              ></th>
            </tr>
          </thead>
          <tbody className=" divide-y divide-primary/20 py-4">
            {roles.map((role) => (
              <tr key={role.id} className="hover:bg-slate-400/10">
                <td className="px-6 py-4 whitespace-nowrap">{role.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {role.description}
                </td>

                <td className="h-full ">
                  {role.name !== "SUPER_ADMIN" &&
                    role.name !== "ADMIN" &&
                    role.name !== "USER" && (
                      <div className="flex gap-2 items-center justify-end">
                        <UpdateButton
                          variant="outline"
                          color="accent"
                          iconOnly
                          size="icon-sm"
                        >
                          Modifier
                        </UpdateButton>
                        <DeleteButton
                          variant="outline"
                          onClick={() => handleDelete(role.id)}
                          disabled={isLoading}
                          size="icon-sm"
                          iconOnly
                        >
                          {isLoading ? "en cours..." : "supprimer"}
                        </DeleteButton>
                      </div>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
