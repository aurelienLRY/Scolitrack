"use client"
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { Card, Button, DeleteButton, UpdateButton } from "@/components/ui";
import { Loading } from "@/components/ui/Loading";
import Link from "next/link";
import { ArrowLeft, Plus, UserPlus, Users, UserX } from "lucide-react";
import Modal, { ModalContent } from "@/components/ui/modal";
import { useCommission, useAddCommissionMember, useRemoveCommissionMember, useUpdateMemberRole } from "@/hooks/query/useCommission";
import { useUsers } from "@/hooks/query/useUsers";
import { motion } from "framer-motion";
import { CommissionMemberFormData } from "@/schemas/commissionSchema";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Image from "next/image";

// Liste des rôles possibles dans une commission
const COMMISSION_ROLES = [
    { value: "Président", label: "Président" },
    { value: "Vice-président", label: "Vice-président" },
    { value: "Secrétaire", label: "Secrétaire" },
    { value: "Trésorier", label: "Trésorier" },
    { value: "Référent", label: "Référent" },
    { value: "Membre", label: "Membre" },
];

// Couleurs pour les rôles (pour les badges)
const ROLE_COLORS: Record<string, string> = {
    "Président": "bg-blue-100 text-blue-800",
    "Vice-président": "bg-indigo-100 text-indigo-800",
    "Secrétaire": "bg-purple-100 text-purple-800",
    "Trésorier": "bg-amber-100 text-amber-800",
    "Référent": "bg-green-100 text-green-800",
    "Membre": "bg-gray-100 text-gray-800"
};

export default function CommissionIdMembersPage() {
    const { id } = useParams();
    const { data: commissionData, isLoading: isLoadingCommission } = useCommission(id as string);
    const commission = commissionData?.data;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

    // Hooks pour les actions sur les membres
    const { mutate: addMember, isPending: isAddingMember } = useAddCommissionMember();
    const { mutate: removeMember, isPending: isRemovingMember } = useRemoveCommissionMember();
    const { mutate: updateRole } = useUpdateMemberRole();

    // Charger les utilisateurs
    const { data: usersData, isLoading: isLoadingUsers } = useUsers();
    const allUsers = usersData?.data || [];

    // Si les données sont en cours de chargement
    if (isLoadingCommission || isLoadingUsers) {
        return <div className="container mx-auto p-6"><Loading /></div>;
    }

    // Si la commission n'existe pas
    if (!commission) {
        return (
            <div className="container mx-auto p-6">
                <Card className="p-8 text-center">
                    <p className="text-xl font-semibold text-destructive mb-2">
                        Commission introuvable
                    </p>
                    <p className="text-gray-500 mb-6">
                        La commission que vous recherchez n&apos;existe pas ou a été supprimée.
                    </p>
                    <Link href="/private/setup-application/commission">
                        <Button variant="outline" color="secondary">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux commissions
                        </Button>
                    </Link>
                </Card>
            </div>
        );
    }

    // Filtrer les utilisateurs non membres
    const availableUsers = allUsers.filter(
        (user) => !commission.members?.some((member) => member.userId === user.id)
    );

    // Fonction pour ajouter un membre
    const handleAddMember = (userId: string) => {
        const formData: CommissionMemberFormData = {
            userId,
            commissionId: commission.id,
            role: "Membre", // Par défaut, on assigne le rôle "Membre"
        };

        addMember(formData, {
            onSuccess: () => {
                setIsModalOpen(false);
            },
        });
    };

    // Fonction pour supprimer un membre
    const handleRemoveMember = (userId: string) => {
        toast.warning("Retirer ce membre de la commission ?", {
            description: "Cette action ne peut pas être annulée.",
            action: {
                label: "Retirer",
                onClick: () => {
                    removeMember({
                        userId,
                        commissionId: commission.id,
                    });
                },
            },
            cancel: {
                label: "Annuler",
                onClick: () => { },
            },
        });
    };

    // Fonction pour mettre à jour le rôle d'un membre
    const handleUpdateRole = (userId: string, role: string) => {
        updateRole({
            userId,
            commissionId: commission.id,
            role,
        }, {
            onSuccess: () => {
                setEditingMemberId(null);
            },
        });
    };

    return (
        <div className="container mx-auto p-6 space-y-8">
            {/* En-tête avec bouton de retour et titre */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div >
                    <Link href="/private/setup-application/commission"
                        className="flex items-center text-sm text-gray-500 hover:text-secondary mb-4"
                    >

                        <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux commissions

                    </Link>

                    <div className="flex items-center gap-4">
                        <div
                            className="flex items-center justify-center rounded-full p-1 min-w-16 min-h-16"
                            style={{ backgroundColor: commission.colorCode || "#4A90E2" }} >
                            {commission.logoUrl ? (
                                <Image
                                    src={commission.logoUrl}
                                    alt={commission.name}
                                    width={60}
                                    height={60}
                                    className="rounded-full object-cover aspect-square"
                                />
                            ) : (
                                <span className="text-white text-2xl font-bold text-center">
                                    {commission.name.charAt(0)}
                                </span>
                            )}
                        </div>
                        <h3>{commission.name}</h3>
                    </div>
                </div>
                <Button
                    onClick={() => setIsModalOpen(true)}
                    variant="solid"
                    color="secondary"
                    disabled={availableUsers.length === 0}
                >
                    <UserPlus className="mr-2 h-4 w-4" /> Ajouter un membre
                </Button>
            </div>

            {/* Liste des membres */}
            <Card className="p-6" variant="primary">
                {!commission.members || commission.members.length === 0 ? (
                    <div className="text-center p-8 rounded-md">
                        <UserX className="h-12 w-12 mx-auto mb-4 text-text" />
                        <p className="text-lg font-medium mb-2">Aucun membre dans cette commission</p>
                        <p className="text-text/50 mb-6">
                            Ajoutez des membres pour organiser les responsabilités de votre commission.
                        </p>
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            variant="outline"
                            color="secondary"
                            disabled={availableUsers.length === 0}
                        >
                            <UserPlus className="mr-2 h-4 w-4" /> Ajouter un membre
                        </Button>
                    </div>
                ) : (
                    <>
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                            <Users className="mr-2 h-5 w-5" /> {commission.members.length} membre(s)
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {commission.members.map((member) => (
                                <motion.div
                                    key={member.userId}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="border rounded-md p-4 hover:bg-secondary/5 transition-all duration-300"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full ">
                                                <Image
                                                    src={member.user?.image || "/icons/my-account.png"}
                                                    alt={member.user?.name || ""}
                                                    width={40}
                                                    height={40}
                                                    className="rounded-full object-cover aspect-square"
                                                />
                                            </div>
                                            <div>
                                                <p className="font-medium">{member.user?.name || "Sans nom"}</p>
                                                <p className="text-sm text-gray-500">{member.user?.email}</p>
                                            </div>
                                        </div>

                                    </div>

                                    {editingMemberId === member.userId ? (
                                        <div className="mt-2 border-t pt-2">
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {COMMISSION_ROLES.map((role) => (
                                                    <Button
                                                        key={role.value}
                                                        variant="outline"
                                                        size="sm"
                                                        className={cn(
                                                            "text-xs",
                                                            member.role === role.value && "bg-secondary text-white"
                                                        )}
                                                        onClick={() => handleUpdateRole(member.userId, role.value)}
                                                    >
                                                        {role.label}
                                                    </Button>
                                                ))}
                                            </div>
                                            <div className="flex justify-end mt-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setEditingMemberId(null)}
                                                >
                                                    Annuler
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-center mt-2 border-t pt-2">
                                            <span className={cn(
                                                "px-2 py-1 rounded-full text-xs font-medium",
                                                ROLE_COLORS[member.role] || "bg-gray-100 text-gray-800"
                                            )}>
                                                {member.role}
                                            </span>

                                            <div>

                                                <UpdateButton
                                                    iconOnly
                                                    size="icon-sm"
                                                    variant="ghost"
                                                    onClick={() => setEditingMemberId(member.userId)}
                                                />
                                                
                                                <DeleteButton
                                                    iconOnly
                                                    size="icon-sm"
                                                    variant="ghost"
                                                    onClick={() => handleRemoveMember(member.userId)}
                                                    disabled={isRemovingMember}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </>
                )}
            </Card>

            {/* Modal pour ajouter un membre */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Ajouter un membre à la commission"
            >
                <ModalContent>
                    {isLoadingUsers ? (
                        <div className="text-center p-4">
                            <Loading />
                        </div>
                    ) : availableUsers.length === 0 ? (
                        <div className="text-center p-4">
                            <p className="text-lg font-medium mb-2">
                                Aucun utilisateur disponible
                            </p>
                            <p className="text-gray-500">
                                Tous les utilisateurs sont déjà membres de cette commission.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="mt-2 pt-2">
                                <h3 className="font-medium mb-3">Sélectionner un utilisateur</h3>
                                <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto p-2">
                                    {availableUsers.map((user) => (
                                        <div
                                            key={user.id}
                                            className="flex items-center p-3 border rounded-md hover:bg-primary/30 cursor-pointer"
                                            onClick={() => handleAddMember(user.id)}
                                        >
                                            <div className="flex-shrink-0 mr-4">
                                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
                                                    <Users className="h-6 w-6 text-gray-500" />
                                                </div>
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
                                                disabled={isAddingMember}
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

