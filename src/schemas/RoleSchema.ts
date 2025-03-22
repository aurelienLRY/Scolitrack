import * as yup from "yup";

export const RoleSchema = yup.object().shape({
  name: yup.string().required("Nom du rôle requis"),
  description: yup.string().required("Description du rôle requis"),
});

export type RoleSchemaType = yup.InferType<typeof RoleSchema>;
