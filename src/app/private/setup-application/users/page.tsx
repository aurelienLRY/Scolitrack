import CreateUserForm from "@/components/users/CreateUserForm";
import UserList from "@/components/users/UserList";

export default function AdminUsersPage() {
  // Vérifier l'authentification et les autorisations

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-8">Gestion des utilisateurs</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Formulaire de création d'utilisateur */}
        <div className="md:col-span-1">
          <div className=" shadow overflow-hidden sm:rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Ajouter un utilisateur</h2>
            <p className="text-sm text-gray-500 mb-6">
              Créez un nouveau compte utilisateur qui recevra un email
              d&apos;invitation pour définir son mot de passe.
            </p>
            <CreateUserForm />
          </div>
        </div>

        {/* Liste des utilisateurs */}
        <div className="md:col-span-2">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Liste des utilisateurs
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Consultez et gérez les utilisateurs existants.
              </p>
            </div>
            <UserList />
          </div>
        </div>
      </div>
    </div>
  );
}
