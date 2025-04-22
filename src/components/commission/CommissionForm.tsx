"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { 
  CommissionFormData, 
  CommissionSchema,
  CommissionUpdateSchema
} from "@/schemas/commissionSchema";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/inputs/Input";
import Textarea from "@/components/ui/inputs/textarea";
import { useEstablishment } from "@/hooks/query/useEstablishment";
import { 
  useCreateCommission, 
  useUpdateCommission,
  useCommission
} from "@/hooks/query/useCommission";
import { Commission } from "@prisma/client";
import Modal, { ModalContent } from "@/components/ui/modal";
import { Resolver } from "react-hook-form";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { SketchPicker } from "react-color";


interface CommissionFormProps {
  commission?: Commission;
  commissionId?: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSuccess?: () => void;
}

export default function CommissionForm({
  commission: initialCommission,
  commissionId,
  isOpen,
  setIsOpen,
  onSuccess
}: CommissionFormProps) {
  const { data: establishmentData } = useEstablishment();
  const establishmentId = establishmentData?.data?.id;

  // Si commissionId est fourni, charger les détails de la commission
  const { data: commissionData, isLoading: isLoadingCommission } = useCommission(commissionId);
  const commission = commissionId ? commissionData?.data : initialCommission;

  // Hooks pour la création et la mise à jour
  const { mutate: createCommission, isPending: isCreating } = useCreateCommission();
  const { mutate: updateCommission, isPending: isUpdating } = useUpdateCommission(commission?.id);

  const isEditMode = !!commission;
  const isLoading = isCreating || isUpdating || isLoadingCommission;
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    getValues,
  } = useForm<CommissionFormData>({
    resolver: yupResolver(isEditMode ? CommissionUpdateSchema : CommissionSchema) as Resolver<CommissionFormData>,
    defaultValues: {
      name: commission?.name || "",
      speciality: commission?.speciality || "",
      description: commission?.description || "",
      establishmentId: commission?.establishmentId || establishmentId || "",
      colorCode: commission?.colorCode || "#3B82F6",
    },
  });

  useEffect(() => {
    // Mettre à jour les valeurs par défaut lorsque la commission change
    if (commission) {
      reset({
        name: commission.name,
        speciality: commission.speciality || "",
        description: commission.description || "",
        establishmentId: commission.establishmentId,
        colorCode: commission.colorCode || "#3B82F6",
      });
    }
  }, [commission, reset]);

  useEffect(() => {
    // Si le mode création et qu'on a récupéré l'établissement
    if (!isEditMode && establishmentId && !getValues("establishmentId")) {
      setValue("establishmentId", establishmentId);
    }
  }, [establishmentId, setValue, getValues, isEditMode]);

  const handleFormSubmit = (data: CommissionFormData) => {
    if (isEditMode && commission) {
      updateCommission(data, {
        onSuccess: () => {
          onSuccess?.();
          reset();
          setIsOpen(false);
        },
      });
    } else {
      createCommission(data, {  
        onSuccess: () => {
          onSuccess?.();
          reset();
          setIsOpen(false);
        },
      });
    }
  };

  const handleClose = () => {
    reset();
    setIsOpen(false);
  };

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorCode, setColorCode] = useState(getValues("colorCode"));

  const handleColorChange = (color: { hex: string }) => {
    setColorCode(color.hex);
    setValue("colorCode", color.hex);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? "Modifier la commission" : "Créer une nouvelle commission"}
    >
      <ModalContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <Input
            label="Nom de la commission"
            placeholder="Commission communication"
            {...register("name")}
            error={errors.name}
          />

          <Input
            label="Spécialité"
            placeholder="Communication"
            {...register("speciality")}
            error={errors.speciality}
          />

          <Textarea
            label="Description"
            placeholder="Description de la commission"
            {...register("description")}
            error={errors.description}
          />


          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Couleur de la commission</label>
            <div className="flex items-center gap-2">
              <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-10 p-1 flex items-center justify-between"
                  >
                    <span>Sélectionner une couleur</span>
                    <div
                      className="w-6 h-6 rounded-md ml-2"
                      style={{ backgroundColor: colorCode }}
                    />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-none">
                  <SketchPicker
                    color={colorCode}
                    onChange={handleColorChange}
                    disableAlpha
                  />
                </PopoverContent>
              </Popover>
            </div>
            <input type="hidden" {...register("colorCode")} value={colorCode} />
          </div>

          <input 
            type="hidden" 
            {...register("establishmentId")} 
          />

          <div className="flex justify-between mt-6">
            <Button
              type="button"
              variant="link"
              onClick={handleClose}
              className="text-destructive/50"
            >
              Annuler
            </Button>
            
            <Button
              type="submit"
              variant="solid"
              color="accent"
              disabled={isLoading}
            >
              {isLoading 
                ? isEditMode 
                  ? "Mise à jour..." 
                  : "Enregistrement..." 
                : isEditMode 
                  ? "Mettre à jour" 
                  : "Créer"}
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
} 