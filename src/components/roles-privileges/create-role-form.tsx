"use client";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { RoleSchema, RoleSchemaType } from "@/schemas/RoleSchema";
import { useRoleStore } from "@/context";
import Input from "@/components/shared/Input";
import { SaveButton } from "@/components/shared/button";
import Card from "../shared/card";

export const CreateRoleForm = () => {
  const { createRole, isLoading } = useRoleStore();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoleSchemaType>({
    resolver: yupResolver(RoleSchema),
  });

  const onSubmit = async (data: RoleSchemaType) => {
    const response = await createRole(data);
    if (response) {
      reset();
    }
  };

  return (
    <Card className="flex flex-col  gap-4 max-w-[1200px]  rounded-lg p-4">
      <div className="px-4 py-5 sm:px-6 ">
        <h3 className=" leading-6 ">Créer un rôle</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Créez un nouveau rôle pour gérer les permissions des utilisateurs.
        </p>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 items-center"
      >
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
        <SaveButton type="submit" disabled={isLoading} className="w-fit">
          {isLoading ? "Création en cours..." : "Créer le rôle"}
        </SaveButton>
      </form>
    </Card>
  );
};
