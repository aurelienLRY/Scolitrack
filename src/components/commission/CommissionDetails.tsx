"use client";

import React from "react";
import Image from "next/image";
import { Card } from "@/components/ui";
import { Badge } from "@/components/ui/badges";
import { Button } from "@/components/ui/button";
import { TCommissionWithAllRelations } from "@/types/commission.type";
import { Users,  UserPlus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs.21st";

interface CommissionDetailsProps {
    commission: TCommissionWithAllRelations;
    onAddMember?: () => void;
    isLoading?: boolean;
    canManage?: boolean;
}

export default function CommissionDetails({
    commission,
    onAddMember,
    isLoading = false,
    canManage = false,
}: CommissionDetailsProps) {
    if (isLoading) {
        return <SkeletonCommissionDetails />;
    }

    return (
        <div className="space-y-6">
            <Card className="p-6 border-l-8 " style={{ borderLeftColor: commission.colorCode || "" }}>
                <div className="mb-6 ">
                    <div className="flex items-center justify-between">
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
                            <div>
                                <h2 className="text-2xl font-bold">{commission.name}</h2>   
                                {commission.speciality && (
                            <Badge variant="secondary">{commission.speciality}</Badge>
                        )}
                            </div> 
                         
                        </div>
                       
                    </div>
                </div>

                {commission.description && (
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Description</h3>
                        <p className="text-gray-600">{commission.description}</p>
                    </div>
                )}

   

                <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Membres de la commission</h3>
                        {canManage && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onAddMember}
                                className="flex items-center"
                            >
                                <UserPlus className="w-4 h-4 mr-2" />
                                Ajouter un membre
                            </Button>
                        )}
                    </div>

                    {commission.members && commission.members.length > 0 ? (
                        <div className="space-y-3 max-h-[400px] overflow-y-auto p-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {commission.members.map((member) => (
                                <div
                                    key={`${member.userId}-${member.commissionId}`}
                                    className="flex items-center p-3 border rounded-md"
                                >
                                    <div className="flex-shrink-0 mr-4">
                                        <Image
                                            src={member.user?.image || "/icons/my-account.png"}
                                            alt={member.user?.name || "Membre"}
                                            width={40}
                                            height={40}
                                            className="rounded-full"
                                        />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-medium">{member.user?.name}</p>
                                        <p className="text-sm text-gray-500">{member.user?.email}</p>
                                    </div>
                                    <Badge>{member.role}</Badge>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center p-6 border rounded-md bg-gray-50">
                            <Users className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                            <p className="text-gray-500">
                                Aucun membre dans cette commission.
                            </p>
                            {canManage && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onAddMember}
                                    className="mt-2"
                                >
                                    Ajouter un membre
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}

export function CommissionsDetailsTabs({ commissions, isLoading }: { commissions: TCommissionWithAllRelations[], isLoading: boolean }) {

    if (isLoading) {
        return <SkeletonCommissionDetails />;
    }
    return (
        <Tabs defaultValue={commissions[0].id}>
            <TabsList>
                {commissions.map((commission) => (
                    <TabsTrigger key={commission.id} value={commission.id}>
                        {commission.name}
                    </TabsTrigger>
                ))}
            </TabsList>
            {commissions.map((commission) => (
                <TabsContent key={commission.id} value={commission.id}>
                    <CommissionDetails
                        key={commission.id}
                        commission={commission}
                        onAddMember={() => { }}
                        isLoading={isLoading}
                    />
                </TabsContent>
            ))}
        </Tabs>
    )
}

function SkeletonCommissionDetails() {
    return (
        <Card className="p-6">
            <div className="mb-6 border-b pb-4">
                <div className="flex items-center">
                    <Skeleton className="w-10 h-10 rounded-md mr-4" />
                    <div>
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-36" />
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-2" />
                <Skeleton className="h-4 w-4/6" />
            </div>

            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-24" />
            </div>

            <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-9 w-36" />
                </div>

                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center p-3 border rounded-md">
                            <Skeleton className="w-10 h-10 rounded-full mr-4" />
                            <div className="flex-grow">
                                <Skeleton className="h-5 w-32 mb-1" />
                                <Skeleton className="h-4 w-48" />
                            </div>
                            <Skeleton className="h-6 w-20" />
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
} 