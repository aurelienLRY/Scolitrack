"use client";

import React from "react";
import {  useDeleteCommission } from "@/hooks/query/useCommission";
import { Commission } from "@prisma/client";
import { Card, Button, DeleteButton, UpdateButton } from "@/components/ui";
import { Plus, Users, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui";
import { cn, formatDate } from "@/lib/utils";
import { motion } from "framer-motion";
import { SkeletonCommissionList } from "./Skeleton-CommissionList";
import { useRouter } from "next/navigation";
import { TCommissionWithAllRelations } from "@/types/commission.type";
interface CommissionListProps {
  commissions: TCommissionWithAllRelations[];
  onAddMember: (commission: Commission) => void;
  isLoading?: boolean;
  onEdit?: (commission: Commission) => void;
  onCreate?: () => void;
}

export default function CommissionList({ 
  commissions, 
  onAddMember, 
  isLoading = false, 
  onEdit,
  onCreate
}: CommissionListProps) {
  const { mutate: deleteCommission, isPending: isDeleting } = useDeleteCommission();

  const handleEditClick = (commission: Commission) => {
    if (onEdit) {
      onEdit(commission);
    }
  };

  const handleCreateClick = () => {
    if (onCreate) {
      onCreate();
    }
  };

  const handleDeleteClick = (commission: Commission) => {
    toast.warning(`Supprimer la commission "${commission.name}" ?`, {
      description: "Cette action ne peut pas être annulée.",
      action: {
        label: "Supprimer",
        onClick: () => {
          deleteCommission(commission.id, {
            onSuccess: () => {
              toast.success("Commission supprimée avec succès");
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
    return <SkeletonCommissionList />;
  }

  if (commissions.length === 0) {
    return (
        <EmptyCommissionList onCreateClick={handleCreateClick} />
    );
  }

  return (
      <div className="container grid grid-cols-1 lg:grid-cols-2  gap-4">
        {commissions.map((commission) => (
          <CommissionCard
            key={commission.id}
            commission={commission}
            onEdit={() => handleEditClick(commission)}
            onDelete={() => handleDeleteClick(commission)}
            onAddMember={() => onAddMember(commission)}
            isDeleting={isDeleting}
          />
        ))}
      </div>
  );
}

function CommissionCard({
  commission,
  onEdit,
  onDelete,

  isDeleting,
}: {
  commission: TCommissionWithAllRelations;
  onEdit: () => void;
  onDelete: () => void;
  onAddMember: () => void;
  isDeleting?: boolean;
}) {
  const membersCount = commission.members?.length || 0;
  const router = useRouter();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Card
        className="p-4 h-full flex flex-col relative overflow-hidden min-w-[350px] max-w-[650px]"
        style={{
          borderLeft: `6px solid ${commission.colorCode || "#4A90E2"}`,
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">{commission.name}</h3>
          <div className="flex">
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
          <div className="flex items-center justify-center w-[60px] h-[60px] bg-gray-100 rounded-md">
            <BookOpen className="h-8 w-8 text-gray-400 aspect-square" />
          </div>

          <div className="flex flex-1 flex-col gap-2 box-content">
            <div className="mb-1">
              <Badge className="capitalize">
                {commission.speciality}
              </Badge>
            </div>
            {commission.description && (
              <div>
                <span className="text-sm">{commission.description}</span>
              </div>
            )}
            <div>
              <span className="text-sm text-gray-500">Créée le {formatDate(commission.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-2 border-t flex justify-between items-center">
          <div className="flex items-center">
            {membersCount > 0 ? (
              <div className="flex flex-col">
                <span className="text-sm flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">{membersCount}</span>
                  {membersCount > 1 ? " membres" : " membre"}
                </span>
              </div>
            ) : (
              <span className="text-xs text-gray-500 italic">
                Aucun membre
              </span>
            )}
          </div>
          <button
            onClick={() => router.push(`/private/setup-application/commission/${commission.id}/members`)}
            className={cn(
              "flex items-center text-sm hover:underline",
              "text-accent"
            )}
          >
            <Users className="h-4 w-4 mr-1" /> Gérer les membres
          </button>
        </div>
      </Card>
    </motion.div>
  );
}

function EmptyCommissionList({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-8 text-center">
        <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
        <p className="text-xl font-semibold mb-2">Aucune commission configurée</p>
        <p className="text-gray-500 mb-6">
          Ajoutez des commissions pour organiser votre établissement et assigner des membres.
        </p>
        <Button
          onClick={onCreateClick}
          variant="solid"
          color="secondary"
          size="lg"
        >
          <Plus className="mr-2 h-4 w-4" /> Créer votre première commission
        </Button>
      </Card>
    </motion.div>
  );
} 