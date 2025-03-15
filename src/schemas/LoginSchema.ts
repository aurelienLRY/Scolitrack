import * as yup from "yup";

export const LoginSchema = yup.object().shape({
  email: yup.string().email("Email invalide").required("Email requis"),
  password: yup.string().required("Mot de passe requis"),
});

export type LoginSchemaType = yup.InferType<typeof LoginSchema>;
