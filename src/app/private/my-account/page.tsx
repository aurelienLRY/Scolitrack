  "use client";

import { useCurrentUser, useUpdateCurrentUser, useChangePassword } from "@/hooks/query/useUsers";
import { UserProfileForm } from "@/components/users/profile/UserProfileForm";
import { ChangePasswordForm } from "@/components/users/profile/ChangePasswordForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.21st";
import { User as UserIcon, Lock } from "lucide-react";
import { Loading } from "@/components/ui/Loading";
import RotatingText from "@/components/ui/rotate-text.ReactBits";

export default function MyAccount() {

  const { data : currentUser, isLoading } = useCurrentUser();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateCurrentUser();
  const { mutate: changePassword, isPending: isChangingPassword } = useChangePassword();

  if (isLoading) return <Loading />;

  // Accès aux données utilisateur
  const user = currentUser?.data;
  if (!user) return;

  return (
    <section className="container mx-auto py-8">
      <div className="flex items-center gap-2 mb-8 w-full">
      <h1 className="text-6xl ">Mon</h1>
      <RotatingText 
        texts={["compte", "espace", "univers"]}
        rotationInterval={3500}
        loop={true}
        auto={true}
        splitBy="characters"
        mainClassName="text-6xl font-semibold overflow-hidden "
        staggerFrom={"last"}
        transition={{ type: "spring", damping: 150, stiffness: 1000 }}
        staggerDuration={0.025}
      />
      </div>
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" /> Profil
          </TabsTrigger>
          <TabsTrigger value="password" className="flex items-center gap-2">
            <Lock className="h-4 w-4" /> Mot de passe
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <UserProfileForm 
            user={user} 
            isLoading={isUpdating} 
            onSubmit={(data) => {
              console.log(data);
              updateUser(data)}}
          />
        </TabsContent>
        
        <TabsContent value="password">
          <ChangePasswordForm 
            isLoading={isChangingPassword}
            onSubmit={({ currentPassword, newPassword }) => 
              changePassword({ currentPassword, newPassword })
            }
          />
        </TabsContent>
      </Tabs>
    </section>
  );
}
