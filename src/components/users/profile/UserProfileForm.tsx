"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { updateUserProfileSchema } from "@/schemas/UserSchema";
import { type CurrentUser } from "@/hooks/query/useUsers";
import { Button } from "@/components/ui/button";
import Input, { SelectInput } from "@/components/ui/inputs/Input";
import Card from "@/components/ui/card"
import { Checkbox } from "@/components/ui/inputs/checkbox";
import Textarea from "@/components/ui/inputs/textarea";
import { Edit, Save, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

type UserProfileFormProps = {
  user: CurrentUser;
  isLoading?: boolean;
  onSubmit: (data: Partial<CurrentUser>) => void;
};

export function UserProfileForm({ user, isLoading, onSubmit }: UserProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: yupResolver(updateUserProfileSchema),
    defaultValues: {
      name: user.name || "",
      firstName: user.firstName || "",
      parentType: user.parentType || undefined,
      gender: user.gender || undefined,
      phoneNumber: user.phoneNumber || "",
      address: user.address || "",
      postalCode: user.postalCode || "",
      city: user.city || "",
      socialSecurityNum: user.socialSecurityNum || "",
      profession: user.profession || "",
      maritalStatus: user.maritalStatus || undefined,
      bio: user.bio || "",
      skills: user.skills || "",
      isHousekeeping: user.isHousekeeping || false,
      isDaycare: user.isDaycare || false,
      isCanteen: user.isCanteen || false,
    },
  });

  // Surveiller les valeurs des checkboxes
  const isHousekeeping = watch("isHousekeeping");
  const isDaycare = watch("isDaycare");
  const isCanteen = watch("isCanteen");

  const handleFormSubmit = (data: Partial<CurrentUser>) => {
    onSubmit(data);
    setIsEditing(false);
  };

  // Fonction pour activer le mode édition
  const enableEditMode = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsEditing(true);
  };

  // Fonction pour annuler les modifications
  const cancelEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsEditing(false);
  };

  const formContent = (
    <Card variant="primary" className="p-4" >
      <div className="flex items-center justify-between mb-4">
        <h2 className="py-2 text-xl font-bold">Mes informations personnelles</h2>
        {isEditing ? (
          <div className="flex items-center gap-2">
          <Button 
            type="submit"
            size="sm"
     
            color="success"
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isLoading ? "Enregistrement..." : "Enregistrer"}
          </Button>
          <Button 
            type="button"
       
            size="sm"
            color="destructive"
            onClick={cancelEdit}
            className="flex items-center gap-2 opacity-50"
            
          >
              <X className="h-4 w-4" />
              Annuler
            </Button>
          </div>
        ) : (
          <Button
          size="sm"
          color="secondary"
            type="button"
            onClick={enableEditMode}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Modifier
          </Button>
        )}
      </div>

      {/* Informations de base */}
      <div className="flex gap-6 items-start mb-8">
        <div className="w-[120px] h-[120px] rounded-full overflow-hidden flex-shrink-0">
          <Image src={user.image || "/icons/my-account.png"} alt={`Photo de ${user.name}`} width={120} height={120} />
        </div>
        <div className="flex flex-col gap-4 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Prénom"
              placeholder="Prénom"
              error={errors.firstName}
              disabled={!isEditing}
              {...register("firstName")}
            />
            <Input
              label="Nom"
              placeholder="Nom"
              error={errors.name}
              disabled={!isEditing}
              {...register("name")}
            />
          </div>
          <div className="text-sm text-gray-500">{user.email}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Colonne gauche */}
        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-lg mb-4">Contact</h3>
            <div className="space-y-4">
              <Input
                label="Numéro de téléphone"
                placeholder="Téléphone"
                error={errors.phoneNumber}
                disabled={!isEditing}
                {...register("phoneNumber")}
              />
              <div>
                <p className="text-sm font-medium mb-1">Numéro de sécurité sociale</p>
                <div className="p-2.5 border rounded-lg bg-gray-50 text-gray-500 text-sm">
                  {user.socialSecurityNum || "Non renseigné"}
                </div>
              </div>
              <Input
                label="Profession"
                placeholder="Profession"
                error={errors.profession}
                disabled={!isEditing}
                {...register("profession")}
              />
            </div>
          </div>

          <div>
            <h3 className="font-medium text-lg mb-4">Adresse</h3>
            <div className="space-y-4">
              <Input
                label="Adresse"
                placeholder="Adresse"
                error={errors.address}
                disabled={!isEditing}
                {...register("address")}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Code postal"
                  placeholder="Code postal"
                  error={errors.postalCode}
                  disabled={!isEditing}
                  {...register("postalCode")}
                />
                <Input
                  label="Ville"
                  placeholder="Ville"
                  error={errors.city}
                  disabled={!isEditing}
                  {...register("city")}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Colonne droite */}
        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-lg mb-4">Profil</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">Type de parent</p>
                <div className="p-2.5 border rounded-lg bg-gray-50 text-gray-500 text-sm">
                  {user.parentType ? 
                    user.parentType === "MERE" ? "Mère" :
                    user.parentType === "PERE" ? "Père" :
                    user.parentType === "TUTEUR" ? "Tuteur" : 
                    user.parentType === "AUTRE" ? "Autre" : "Non spécifié"
                    : "Non spécifié"}
                </div>
              </div>
              <SelectInput
                label="Genre"
                error={errors.gender}
                disabled={!isEditing}
                options={[
                  { id: "", name: "Non spécifié" },
                  { id: "M", name: "Homme" },
                  { id: "F", name: "Femme" },
                  { id: "N", name: "Non genré" }
                ]}
                {...register("gender")}
              />
              <SelectInput
                label="Situation matrimoniale"
                error={errors.maritalStatus}
                disabled={!isEditing}
                options={[
                  { id: "", name: "Non spécifié" },
                  { id: "CELIBATAIRE", name: "Célibataire" },
                  { id: "MARIE", name: "Marié(e)" },
                  { id: "PACSE", name: "Pacsé(e)" },
                  { id: "DIVORCE", name: "Divorcé(e)" },
                  { id: "VEUF", name: "Veuf/Veuve" },
                  { id: "AUTRE", name: "Autre" }
                ]}
                {...register("maritalStatus")}
              />
            </div>
          </div>

          <div>
            <h3 className="font-medium text-lg mb-4">Groupes d&apos;appartenance</h3>
            <div className="p-4 border rounded-lg ">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="isHousekeeping" 
                    checked={isHousekeeping} 
                    disabled={!isEditing}
                    onCheckedChange={(checked) => setValue("isHousekeeping", checked === true)}
                  />
                  <label 
                    htmlFor="isHousekeeping" 
                    className="text-sm text-gray-500 cursor-pointer"
                  >
                    Ménage
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="isDaycare" 
                    checked={isDaycare} 
                    disabled={!isEditing}
                    onCheckedChange={(checked) => setValue("isDaycare", checked === true)}
                  />
                  <label 
                    htmlFor="isDaycare" 
                    className="text-sm text-gray-500 cursor-pointer"
                  >
                    Garderie
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="isCanteen" 
                    checked={isCanteen} 
                    disabled={!isEditing}
                    onCheckedChange={(checked) => setValue("isCanteen", checked === true)}
                  />
                  <label 
                    htmlFor="isCanteen" 
                    className="text-sm text-gray-500 cursor-pointer"
                  >
                    Cantine
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <h3 className="font-medium text-lg">À propos de moi</h3>
        <Textarea
          label="Biographie"
          placeholder="Parlez un peu de vous..."
          error={errors.bio}
          disabled={!isEditing}
          {...register("bio")}
        />
        
        <Textarea
          label="Compétences"
          placeholder="Vos compétences..."
          error={errors.skills}
          disabled={!isEditing}
          {...register("skills")}
        />
      </div>
      
    </Card>
  );

  // Rendu conditionnel selon mode édition ou affichage
  return (
    <>
      {isEditing ? (
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          {formContent}
        </form>
      ) : (
        <div>
          {formContent}
        </div>
      )}
    </>
  );
} 