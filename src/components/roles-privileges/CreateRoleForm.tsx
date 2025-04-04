"use client";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { RoleSchema, RoleSchemaType } from "@/schemas/RoleSchema";
import { useCreateRole } from "@/hooks/query/useRoles";
import Input from "@/components/ui/inputs/Input";
import { SaveButton } from "@/components/ui/button";
import Card from "../ui/card";

export const CreateRoleForm = () => {
  const { mutate: createRole, isPending, isSuccess } = useCreateRole();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoleSchemaType>({
    resolver: yupResolver(RoleSchema),
  });

  const onSubmit = (data: RoleSchemaType) => {
    createRole(data);
    if (isSuccess) {
      reset();
    }
  };

  return (
    <div className=" w-full flex flex-1 items-center justify-center  ">
      <Card
        className="flex flex-col  gap-4 w-full h-full rounded-lg p-4 "
        variant="primary"
      >
        <div className="px-4 py-5 sm:px-6 ">
          <h3 className=" leading-6 ">Créer un rôle</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Créez un nouveau rôle pour gérer les permissions des utilisateurs.
          </p>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 justify-evenly h-full"
        >
          <div className="flex flex-col gap-4">
            <Input
              type="text"
              placeholder="Nom du rôle"
              {...register("name")}
              error={errors.name}
            />
            <Input
              type="text"
              placeholder="Description du rôle"
              {...register("description")}
              error={errors.description}
            />
          </div>
          <SaveButton type="submit" disabled={isPending} className="w-fit">
            {isPending ? "Création en cours..." : "Créer le rôle"}
          </SaveButton>
        </form>
      </Card>
    </div>
  );
};
