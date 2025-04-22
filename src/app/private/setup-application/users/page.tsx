import CreateUserForm from "@/components/users/CreateUserForm";
import { UserTable } from "@/components/users/data-table/userTable";

export default function AdminUsersPage() {
  // Vérifier l'authentification et les autorisations

  return (
      <div className=" flex flex-col-reverse xl:flex-row items-center justify-center xl:items-start gap-14 ">
        {/* Formulaire de création d'utilisateur */}
        <div className="max-w-[500px]">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="">Ajouter un utilisateur</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Créez un nouveau compte utilisateur qui recevra un email
              d&apos;invitation pour définir son mot de passe.
            </p>
          </div>
          <CreateUserForm />

        </div>

        {/* Liste des utilisateurs */}

        <div className="shadow overflow-hidden sm:rounded-lg w-full ">
          <div className="px-4 py-5 sm:px-6 ">
            <h3 className="">
              Liste des utilisateurs
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Consultez les utilisateurs existants.
            </p>
          </div>
          <UserTable />
        </div>

      </div>


  );
}
