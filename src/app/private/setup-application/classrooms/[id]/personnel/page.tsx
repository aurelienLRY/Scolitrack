"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, Button, DeleteButton } from "@/components/ui";
import { Loading } from "@/components/ui/Loading";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Plus, UserPlus, Users, UserX, Shield } from "lucide-react";
import Modal, { ModalContent } from "@/components/ui/modal";
import {
  useClassRoom,
  useAssignPersonnelToClassRoom,
  useRemovePersonnelFromClassRoom,
} from "@/hooks/query/useClassRoom";
import { ClassRoomPersonnelFormData } from "@/schemas/ClassRoomSchema";
import { useUsers } from "@/hooks/useUsers";
import { motion } from "framer-motion";
import ClassRoomHeader from "@/components/classRoom/ClassRoomHeader";

export default function PersonnelPage() {
  const params = useParams();
  const classRoomId = params.id as string;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [responsibleId, setResponsibleId] = useState<string | null>(null);

  // Charger les données de la classe
  const { data, isLoading: isLoadingClass } = useClassRoom(classRoomId);
  const classRoom = data?.data;
  console.log(classRoom);
  const personnel = classRoom?.classPersonnel;

  // Charger les utilisateurs
  const { data: usersData, isLoading: isLoadingUsers } = useUsers();
  const allUsers = usersData?.data || [];

  // Hooks pour l'ajout et la suppression de personnel
  const { mutate: assignPersonnel, isPending: isAssigning } =
    useAssignPersonnelToClassRoom(classRoomId);
  const { mutate: removePersonnel, isPending: isRemoving } =
    useRemovePersonnelFromClassRoom(classRoomId);

  // Identifier le responsable actuel
  useEffect(() => {
    if (personnel && personnel.length > 0) {
      const currentResponsible = personnel.find(
        (p) => p.roleInClass === "RESPONSABLE"
      );
      if (currentResponsible) {
        setResponsibleId(currentResponsible.userId);
      }
    }
  }, [personnel]);

  // Si les données sont en cours de chargement, afficher un indicateur de chargement
  if (isLoadingClass || isLoadingUsers) {
    return <Loading />;
  }

  // Filtrer les utilisateurs non assignés et exclure super_admin et user
  const availableUsers = allUsers.filter(
    (user) =>
      // Exclure les utilisateurs déjà assignés
      !personnel?.some((p) => p.userId === user.id) &&
      // Exclure les super_admin et user
      user.roleName !== "SUPER_ADMIN" &&
      user.roleName !== "USER"
  );

  // Si la classe n'existe pas, afficher un message d'erreur
  if (!classRoom) {
    return (
      <Card className="p-8 text-center">
        <p className="text-xl font-semibold text-destructive mb-2">
          Classe introuvable
        </p>
        <p className="text-gray-500 mb-6">
          La classe que vous recherchez n&apos;existe pas ou a été supprimée.
        </p>
        <Link href="/private/setup-application/classrooms">
          <Button variant="outline" color="secondary">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux classes
          </Button>
        </Link>
      </Card>
    );
  }

  // Fonction pour définir un membre du personnel comme responsable
  const setAsResponsible = (userId: string) => {
    // Si c'est déjà le responsable, ne rien faire
    if (responsibleId === userId) return;

    // S'il y a déjà un responsable, le retirer d'abord
    if (responsibleId) {
      const currentResponsible = personnel?.find(
        (p) => p.userId === responsibleId
      );
      if (currentResponsible) {
        // Mise à jour du responsable actuel (on enlève son statut de responsable)
        assignPersonnel({
          userId: responsibleId,
          roleInClass: null,
        });
      }
    }

    // Définir le nouveau responsable
    assignPersonnel({
      userId: userId,
      roleInClass: "RESPONSABLE",
    });

    // Mettre à jour l'état local
    setResponsibleId(userId);
  };

  // Fonction pour ajouter un membre du personnel
  const handleAssignPersonnel = (userId: string) => {
    const formData: ClassRoomPersonnelFormData = {
      userId,
      roleInClass: null, // Par défaut, pas de rôle spécifique
    };

    assignPersonnel(formData, {
      onSuccess: () => {
        setIsModalOpen(false);
      },
    });
  };

  // Fonction pour supprimer un membre du personnel
  const handleRemovePersonnel = (userId: string) => {
    // Si c'est le responsable, mettre à jour l'état local
    if (userId === responsibleId) {
      setResponsibleId(null);
    }
    removePersonnel(userId);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <ClassRoomHeader
        classRoom={classRoom}
        action={
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="solid"
            color="secondary"
            disabled={availableUsers.length === 0}
          >
            <UserPlus className="mr-2 h-4 w-4" /> Ajouter du personnel
          </Button>
        }
      />

      {/* Liste du personnel */}
      <Card className="p-6" variant="primary">
        {personnel?.length === 0 ? (
          <div className="text-center p-8  rounded-md">
            <UserX className="h-12 w-12 mx-auto mb-4 text-text" />
            <p className="text-lg font-medium mb-2">Aucun personnel assigné</p>
            <p className="text-text/50 mb-6">
              Assignez du personnel à cette classe pour commencer.
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              variant="outline"
              color="secondary"
              disabled={availableUsers.length === 0}
            >
              <UserPlus className="mr-2 h-4 w-4" /> Ajouter du personnel
            </Button>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Users className="mr-2 h-5 w-5" /> Personnel assigné
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {personnel?.map((person) => {
                const isResponsible = person.userId === responsibleId;
                return (
                  <motion.div
                    key={person.userId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-center p-4 border rounded-md hover:bg-secondary/15 transition-all duration-300  ${
                      isResponsible ? "border-secondary bg-secondary/10" : ""
                    }`}
                  >
                    <div className="flex-shrink-0 mr-4">
                      <Image
                        src={person.user.image || "/icons/my-account.png"}
                        alt={person.user.name || "Personnel"}
                        width={50}
                        height={50}
                        className="rounded-full"
                      />
                    </div>
                    <div className="flex-grow">
                      <p className="font-medium">{person.user.name}</p>
                      <p className="text-sm text-gray-500">
                        {person.user.email}
                      </p>
                      {isResponsible && (
                        <p className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded mt-1 inline-flex items-center">
                          <Shield className="h-3 w-3 mr-1" /> Responsable
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {!isResponsible && (
                        <Button
                          variant="outline"
                          color="secondary"
                          size="sm"
                          onClick={() => setAsResponsible(person.userId)}
                          title="Définir comme responsable"
                          className="flex items-center gap-1 text-xs "
                        >
                          <Shield className="h-3 w-3" /> Responsable
                        </Button>
                      )}
                      <DeleteButton
                        iconOnly
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemovePersonnel(person.userId)}
                        disabled={isRemoving}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </Card>

      {/* Modal pour ajouter du personnel */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Ajouter du personnel à la classe"
      >
        <ModalContent>
          {isLoadingUsers ? (
            <div className="text-center p-4">
              <Loading />
            </div>
          ) : availableUsers.length === 0 ? (
            <div className="text-center p-4">
              <p className="text-lg font-medium mb-2">
                Aucun personnel disponible
              </p>
              <p className="text-gray-500">
                Tous les membres du personnel sont déjà assignés à cette classe.
              </p>
            </div>
          ) : (
            <>
              <div className="mt-2 pt-2">
                <h3 className="font-medium mb-3">Sélectionner du personnel</h3>
                <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto p-2">
                  {availableUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center p-3 border rounded-md hover:bg-primary/30 cursor-pointer"
                      onClick={() => handleAssignPersonnel(user.id)}
                    >
                      <div className="flex-shrink-0 mr-4">
                        <Image
                          src={user.image || "/icons/my-account.png"}
                          alt={user.name || "Personnel"}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      </div>
                      <div className="flex-grow">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <p className="text-xs text-gray-400">{user.roleName}</p>
                      </div>
                      <Button
                        variant="ghost"
                        color="secondary"
                        size="sm"
                        disabled={isAssigning}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
