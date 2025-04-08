import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ClassRoomWithPersonnel } from "@/types/classroom.type";

interface ClassRoomHeaderProps {
  classRoom: ClassRoomWithPersonnel;
  backLink?: string;
  backLabel?: string;
  action?: React.ReactNode;
}

export default function ClassRoomHeader({
  classRoom,
  backLink = "/private/setup-application/classrooms",
  backLabel = "Retour aux classes",
  action,
}: ClassRoomHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        {backLink && (
          <Link
            href={backLink}
            className="flex items-center text-sm text-gray-500 hover:text-secondary mb-4"
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> {backLabel}
          </Link>
        )}

        <div className="flex items-center gap-2">
          <div
            className="flex items-center justify-center rounded-full p-1 min-w-16 min-h-16"
            style={{ backgroundColor: classRoom.colorCode || "#4A90E2" }}
          >
            {classRoom.logoUrl ? (
              <Image
                src={classRoom.logoUrl}
                alt={classRoom.name}
                width={60}
                height={60}
                className="rounded-full object-cover aspect-square"
              />
            ) : (
              <span className="text-white text-2xl font-bold text-center">
                {classRoom.name.charAt(0)}
              </span>
            )}
          </div>

          <div>
            <h3>Classe : {classRoom.name}</h3>

            {/* Afficher le niveau d'éducation */}
            {classRoom.educationLevels &&
              classRoom.educationLevels.length > 0 && (
                <div className="flex gap-2 ms-2 mt-1">
                  {classRoom.educationLevels.map(
                    (level: {
                      educationLevel: {
                        id: string;
                        name: string;
                        code: string;
                      };
                    }) => (
                      <span
                        key={level.educationLevel.id}
                        className="inline-block px-3 py-1 bg-secondary text-sm rounded-full font-medium"
                      >
                        {level.educationLevel.code}
                      </span>
                    )
                  )}
                </div>
              )}
          </div>
        </div>
      </div>
      {action && action}
    </div>
  );
}
