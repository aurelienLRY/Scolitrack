"use client";

import React, { useState } from "react";
import { Card, Button, DeleteButton, UpdateButton } from "@/components/ui";
import { useClassRooms } from "@/hooks/query/useClassRoom";
import { Plus, Users, School } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import CreateClassRoomForm from "./CreateClassRoomForm";
import { motion } from "framer-motion";
import { SkeletonClassRoomList } from "./Skeleton-ClassRoomList";
import Link from "next/link";
import { toast } from "sonner";
import { useDeleteClassRoom } from "@/hooks/query/useClassRoom";
import { ClassRoomWithPersonnel } from "@/types/classroom.type";

interface ClassRoomListProps {
  establishmentId: string;
}

export default function ClassRoomList({ establishmentId }: ClassRoomListProps) {
  const { data, isLoading } = useClassRooms(establishmentId);
  const classRooms = (data?.data as ClassRoomWithPersonnel[]) || [];

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedClassRoom, setSelectedClassRoom] =
    useState<ClassRoomWithPersonnel | null>(null);

  const { mutate: deleteClassRoom, isPending: isDeleting } =
    useDeleteClassRoom();

  const handleCreateClick = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditClick = (classRoom: ClassRoomWithPersonnel) => {
    setSelectedClassRoom(classRoom);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (classRoom: ClassRoomWithPersonnel) => {
    toast.warning(`Supprimer la classe "${classRoom.name}" ?`, {
      description: "Cette action ne peut pas être annulée.",
      action: {
        label: "Supprimer",
        onClick: () => {
          deleteClassRoom(classRoom.id, {
            onSuccess: () => {
              toast.success("Classe supprimée avec succès");
            },
            onError: (error) => {
              toast.error("Erreur lors de la suppression", {
                description: error.message,
              });
            },
          });
        },
      },
      cancel: {
        label: "Annuler",
        onClick: () => {},
      },
    });
  };

  if (isLoading) {
    return <SkeletonClassRoomList />;
  }

  return (
    <div className="space-y-6">
      {classRooms.length === 0 ? (
        <EmptyClassRoomList onCreateClick={handleCreateClick} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classRooms.map((classRoom) => (
            <ClassRoomCard
              key={classRoom.id}
              classRoom={classRoom}
              onEdit={() => handleEditClick(classRoom)}
              onDelete={() => handleDeleteClick(classRoom)}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      )}

      {/* Modal de création */}
      {isCreateModalOpen && (
        <CreateClassRoomForm
          establishmentId={establishmentId}
          isOpen={isCreateModalOpen}
          setIsOpen={setIsCreateModalOpen}
        />
      )}

      {/* Modal d'édition */}
      {isEditModalOpen && selectedClassRoom && (
        <CreateClassRoomForm
          classRoom={selectedClassRoom}
          establishmentId={establishmentId}
          isEditing={true}
          isOpen={isEditModalOpen}
          setIsOpen={setIsEditModalOpen}
        />
      )}
    </div>
  );
}

function ClassRoomCard({
  classRoom,
  onEdit,
  onDelete,
  isDeleting,
}: {
  classRoom: ClassRoomWithPersonnel;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}) {
  const personnelCount = classRoom.classPersonnel?.length || 0;
  const hasResponsible =
    classRoom.classPersonnel?.some((p) => p.roleInClass === "RESPONSABLE") ||
    false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Card
        className="p-4 h-full flex flex-col relative overflow-hidden min-w-[350px]"
        style={{
          borderLeft: `6px solid ${classRoom.colorCode || "#4A90E2"}`,
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">{classRoom.name}</h3>
          <div className="flex ">
            <UpdateButton
              onClick={onEdit}
              iconOnly
              size="icon"
              variant="ghost"
              disabled={isDeleting}
            />

            <DeleteButton
              iconOnly
              onClick={onDelete}
              size="icon"
              variant="ghost"
              disabled={isDeleting}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4 h-fit">
          {classRoom.logoUrl ? (
            <Image
              src={`/img/uploads/classrooms/${classRoom.logoFileId}_thumbnail.webp`}
              alt={`Logo de ${classRoom.name}`}
              width={80}
              height={80}
              className="object-contain rounded-md"
            />
          ) : (
            <div className="flex items-center justify-center w-[60px] h-[60px] bg-gray-100 rounded-md">
              <School className="h-8 w-8 text-gray-400" />
            </div>
          )}

          <div className="flex flex-col gap-2 box-content">
            <div className="mb-1 flex gap-2">
              {classRoom.educationLevels?.map((level) => {
                return (
                  <span
                    key={level.educationLevel.id}
                    className="text-sm bg-white/80 text-black p-3  rounded-full font-semibold"
                  >
                    {level.educationLevel.code}
                  </span>
                );
              })}
            </div>
            {classRoom.capacity && (
              <div>
                <span className="text-sm ">Nombre maximum : </span>{" "}
                <span className="text-sm font-medium">
                  {classRoom.capacity} élèves
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto pt-2 border-t flex justify-between items-center">
          <div className="flex items-center">
            {personnelCount > 0 ? (
              <div className="flex flex-col">
                <span className="text-sm flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">{personnelCount}</span>
                  {personnelCount > 1 ? "membres" : "membre"}
                </span>
                {hasResponsible && (
                  <span className="text-xs text-green-600">
                    Responsable assigné
                  </span>
                )}
              </div>
            ) : (
              <span className="text-xs text-gray-500 italic">
                Aucun personnel
              </span>
            )}
          </div>
          <Link
            href={`/private/setup-application/classrooms/${classRoom.id}/personnel`}
            className={cn(
              "flex items-center text-sm hover:underline ",
              "text-accent"
            )}
          >
            <Users className="h-4 w-4 mr-1" /> Gérer le personnel
          </Link>
        </div>
      </Card>
    </motion.div>
  );
}

function EmptyClassRoomList({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-8 text-center">
        <School className="h-16 w-16 mx-auto mb-4 text-gray-400" />
        <p className="text-xl font-semibold mb-2">Aucune classe configurée</p>
        <p className="text-gray-500 mb-6">
          Ajoutez des classes pour organiser votre établissement et assigner du
          personnel.
        </p>
        <Button
          onClick={onCreateClick}
          variant="solid"
          color="secondary"
          size="lg"
        >
          <Plus className="mr-2 h-4 w-4" /> Créer votre première classe
        </Button>
      </Card>
    </motion.div>
  );
}
