"use client";
import { DeleteButton, UpdateButton } from "@/components/ui/button";
import { Role, useRoles, useDeleteRole } from "@/hooks/query/useRoles";
import Card from "../../ui/card";
import { SkeletonRolesList } from "./";
import { motion } from "framer-motion";
export const RoleList = () => {
  const { data, isError, isLoading } = useRoles();

  if (isError) return null;

  if (isLoading) return <SkeletonRolesList />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="overflow-hidden"
    >
      <Card className="flex flex-col gap-4 w-full" variant="primary">
        <div className="px-4 py-5 sm:px-6 ">
          <h3 className=" leading-6">Liste des rôles</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Consultez et gérez les rôles existants.
          </p>
        </div>
        <div className="overflow-auto">
          <RoleTable roles={data?.data || []} />
        </div>
      </Card>
    </motion.div>
  );
};

const RoleTable = ({ roles }: { roles: Role[] }) => {
  const { isPending, mutate } = useDeleteRole();

  const handleDelete = async (id: string) => {
    const confirm = window.confirm("Voulez-vous vraiment supprimer ce rôle ?");
    if (confirm) {
      await mutate(id);
    }
  };
  return (
    <div className="max-w-[1200px] mx-auto">
      <table className=" divide-y divide-primary ">
        <thead className="bg-gradient-to-b from-primary/0 to-primary/20 rounded-lg  ">
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
                        disabled={isPending}
                        size="icon-sm"
                        iconOnly
                      >
                        {isPending ? "en cours..." : "supprimer"}
                      </DeleteButton>
                    </div>
                  )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
