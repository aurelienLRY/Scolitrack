/**
 * Hydrate Family + Student à partir du formPayload lors de l'approbation.
 */

import { prisma } from "@/lib/prisma/prisma";
import type { EnrollmentFormPayload } from "@/types/enrollment-form.type";
import {
  createEmptyFormPayload,
  normalizeFormPayload,
} from "@/types/enrollment-form.type";

function parseFormPayload(
  raw: string | null | undefined,
  fallbackEmail?: string
): EnrollmentFormPayload {
  if (!raw) return createEmptyFormPayload(fallbackEmail);
  try {
    return normalizeFormPayload(
      JSON.parse(raw) as EnrollmentFormPayload,
      fallbackEmail
    );
  } catch {
    return createEmptyFormPayload(fallbackEmail);
  }
}

function familyNameFromPayload(form: EnrollmentFormPayload): string {
  const p1 = form.parents[0];
  const last = p1?.lastName?.trim();
  if (last) return `Famille ${last}`;
  const child = form.children[0];
  if (child?.lastName?.trim()) return `Famille ${child.lastName.trim()}`;
  return "Famille inscription";
}

function legalGuardiansLabel(form: EnrollmentFormPayload): string {
  return form.parents
    .filter((p) => p.firstName?.trim() || p.lastName?.trim())
    .map((p) => `${p.firstName} ${p.lastName}`.trim())
    .filter(Boolean)
    .join(" / ");
}

/**
 * Crée ou réutilise la famille, crée les élèves manquants, lie EnrollmentStudent.
 * Idempotent : ne recrée pas les élèves déjà liés au dossier.
 */
export async function hydrateEnrollmentOnApprove(fileId: string) {
  const file = await prisma.enrollmentFile.findUnique({
    where: { id: fileId },
    include: {
      students: true,
      family: true,
    },
  });

  if (!file) {
    throw new Error("Dossier d'inscription non trouvé");
  }

  const form = parseFormPayload(file.formPayload, file.email);
  if (form.children.length === 0) {
    return { familyId: file.familyId, createdStudents: 0 };
  }

  let familyId = file.familyId;

  if (!familyId) {
    const family = await prisma.family.create({
      data: {
        name: familyNameFromPayload(form),
        notes: `Créée à l'approbation du dossier ${file.id}`,
      },
    });
    familyId = family.id;
    await prisma.enrollmentFile.update({
      where: { id: fileId },
      data: { familyId },
    });
  }

  const educationLevels = await prisma.educationLevel.findMany({
    select: { id: true, code: true, name: true },
  });

  const resolveLevelId = (code: string | undefined) => {
    if (!code) return null;
    const found = educationLevels.find(
      (l) =>
        l.code?.toUpperCase() === code.toUpperCase() ||
        l.name?.toUpperCase() === code.toUpperCase()
    );
    return found?.id ?? null;
  };

  const alreadyLinked = new Set(file.students.map((s) => s.studentId));
  let createdStudents = 0;
  const guardians = legalGuardiansLabel(form) || "Responsable légal";

  for (const child of form.children) {
    if (child.studentId && alreadyLinked.has(child.studentId)) {
      continue;
    }

    const birthDate = child.birthDate
      ? new Date(child.birthDate)
      : new Date("2000-01-01");

    const student = await prisma.student.create({
      data: {
        firstName: child.firstName.trim() || "Prénom",
        lastName: child.lastName.trim() || "Nom",
        birthDate,
        birthPlace: child.birthPlace?.trim() || "Non renseigné",
        previousSchool: child.previousSchool?.trim() || null,
        desiredEnrollmentDate: child.entryDate
          ? new Date(child.entryDate)
          : null,
        insuranceProvider: child.insuranceProvider?.trim() || null,
        insuranceNumber: child.insuranceNumber?.trim() || null,
        hasSplitResidence: Boolean(
          child.sleepsAtParent1 && child.sleepsAtParent2
        ),
        legalGuardians: child.legalGuardians?.trim() || guardians,
        familyId,
        educationLevelId: resolveLevelId(child.targetLevel),
        medicalInfo: child.medical
          ? {
              create: {
                fileNumber: `ENR-${file.id.slice(0, 8)}-${child.localId.slice(0, 6)}`,
                hasRubella: child.medical.hasRubella,
                hasChickenpox: child.medical.hasChickenpox,
                hasTonsillitis: child.medical.hasTonsillitis,
                hasOtitis: child.medical.hasOtitis,
                hasScarletFever: child.medical.hasScarletFever,
                hasWhoopingCough: child.medical.hasWhoopingCough,
                hasMumps: child.medical.hasMumps,
                hasMeasles: child.medical.hasMeasles,
                hasAsthma: child.medical.hasAsthma,
                hasRheumatism: child.medical.hasRheumatism,
                healthDetails: child.medical.healthDetails || null,
                doctorName: child.medical.doctorName || null,
                preferredHospital: child.medical.preferredHospital || null,
                parentRecommendations:
                  child.medical.parentRecommendations || null,
                medicalConsent: child.medical.medicalConsent ?? false,
              },
            }
          : undefined,
      },
    });

    await prisma.enrollmentStudent.create({
      data: {
        fileId,
        studentId: student.id,
      },
    });

    createdStudents += 1;
  }

  return { familyId, createdStudents };
}
