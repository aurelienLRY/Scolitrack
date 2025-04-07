import { Card, Button, DeleteButton, UpdateButton } from "@/components/ui";
import { EducationLevel } from "@prisma/client";
import { GraduationCap, Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function EducationLevelCard({
  onComplete,
  educationLevels,
  onEdit,
  onDelete,
}: {
  onComplete: () => void;
  educationLevels: EducationLevel[];
  onEdit: (level: EducationLevel) => void;
  onDelete: (level: EducationLevel) => void;
}) {
  return educationLevels.length === 0 ? (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className="p-8 min-w-[300px] w-fit max-w-[520px] "
        variant="primary"
      >
        <div className="text-center mb-6">
          <GraduationCap className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <p className="text-xl font-semibold mb-2">
            Aucun niveau d&apos;enseignement configuré
          </p>
          <p className="text-gray-500 mb-6">
            Configurez les niveaux d&apos;enseignement pour organiser vos
            classes.
          </p>
          <Button
            onClick={onComplete}
            variant="solid"
            color="success"
            size="lg"
          >
            Ajouter un niveau
          </Button>
        </div>
      </Card>
    </motion.div>
  ) : (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="w-full"
    >
      <Card className="p-6 space-y-6 min-w-[350px]  " variant="primary">
        <h3 className="text-xl font-semibold">Niveaux d&apos;enseignement</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-4">
          {educationLevels.map((level, index) => (
            <motion.div
              key={level.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: 0.2 + index * 0.1 }}
              className="flex justify-between items-center p-3 md:min-w-[400px] border rounded-lg hover:bg-primary/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm bg-white/80 text-black p-3  rounded-full font-semibold">
                  {level.code}
                </span>
                <p className="">{level.name}</p>
              </div>
              <div className="flex ">
                <UpdateButton
                  iconOnly
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(level)}
                />

                <DeleteButton
                  iconOnly
                  onClick={() => onDelete(level)}
                  size="icon"
                  variant="ghost"
                />
              </div>
            </motion.div>
          ))}
        </div>
        <Button
          title="Ajouter un niveau"
          variant="outline"
          size="sm"
          color="secondary"
          onClick={onComplete}
        >
          <Plus size={32} />
        </Button>
      </Card>
    </motion.div>
  );
}
