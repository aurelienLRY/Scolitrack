"use client";

import { Button, Card, Input } from "@/components/ui";
import { Plus, Trash2 } from "lucide-react";
import type {
  EnrollmentAuthorizedPickupForm,
  EnrollmentEmergencyContactForm,
} from "@/types/enrollment-form.type";

interface FamilyContactsSectionProps {
  readOnly: boolean;
  emergencyContacts: EnrollmentEmergencyContactForm[];
  authorizedPickups: EnrollmentAuthorizedPickupForm[];
  onChangeEmergency: (next: EnrollmentEmergencyContactForm[]) => void;
  onChangePickups: (next: EnrollmentAuthorizedPickupForm[]) => void;
}

export default function FamilyContactsSection({
  readOnly,
  emergencyContacts,
  authorizedPickups,
  onChangeEmergency,
  onChangePickups,
}: FamilyContactsSectionProps) {
  return (
    <div className="space-y-4">
      <Card className="space-y-4 p-5" variant="primary">
        <div>
          <h3 className="text-lg font-semibold">
            Personnes à prévenir en cas d&apos;accident
          </h3>
          <p className="text-sm text-muted-foreground">
            Facultatif — en plus des responsables légaux, si besoin.
          </p>
        </div>

        <div className="space-y-3">
          {emergencyContacts.map((c, index) => (
            <div
              key={`em-${index}`}
              className="grid gap-2 rounded-lg border border-border/50 p-3 sm:grid-cols-12 sm:items-end"
            >
              <div className="sm:col-span-4">
                <Input
                  label="Nom"
                  value={c.lastName}
                  disabled={readOnly}
                  onChange={(e) => {
                    const next = [...emergencyContacts];
                    next[index] = { ...c, lastName: e.target.value };
                    onChangeEmergency(next);
                  }}
                />
              </div>
              <div className="sm:col-span-4">
                <Input
                  label="Prénom"
                  value={c.firstName}
                  disabled={readOnly}
                  onChange={(e) => {
                    const next = [...emergencyContacts];
                    next[index] = { ...c, firstName: e.target.value };
                    onChangeEmergency(next);
                  }}
                />
              </div>
              <div className="sm:col-span-3">
                <Input
                  label="Téléphone"
                  value={c.phoneNumber}
                  disabled={readOnly}
                  onChange={(e) => {
                    const next = [...emergencyContacts];
                    next[index] = { ...c, phoneNumber: e.target.value };
                    onChangeEmergency(next);
                  }}
                />
              </div>
              <div className="sm:col-span-1 flex sm:justify-end">
                {!readOnly && emergencyContacts.length > 1 && (
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="outline"
                    color="destructive"
                    icon={Trash2}
                    iconOnly
                    tooltip="Retirer"
                    onClick={() =>
                      onChangeEmergency(
                        emergencyContacts.filter((_, i) => i !== index)
                      )
                    }
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {!readOnly && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              onChangeEmergency([
                ...emergencyContacts,
                { firstName: "", lastName: "", phoneNumber: "" },
              ])
            }
          >
            <Plus className="mr-1 h-4 w-4" />
            Ajouter un contact
          </Button>
        )}
      </Card>

      <Card className="space-y-4 p-5" variant="primary">
        <div>
          <h3 className="text-lg font-semibold">
            Personnes autorisées à venir chercher l&apos;enfant
          </h3>
          <p className="text-sm text-muted-foreground">
            Facultatif — une pièce d&apos;identité pourra être demandée à
            l&apos;école.
          </p>
        </div>

        <div className="space-y-3">
          {authorizedPickups.map((c, index) => (
            <div
              key={`ap-${index}`}
              className="grid gap-2 rounded-lg border border-border/50 p-3 sm:grid-cols-12 sm:items-end"
            >
              <div className="sm:col-span-4">
                <Input
                  label="Nom"
                  value={c.lastName}
                  disabled={readOnly}
                  onChange={(e) => {
                    const next = [...authorizedPickups];
                    next[index] = { ...c, lastName: e.target.value };
                    onChangePickups(next);
                  }}
                />
              </div>
              <div className="sm:col-span-4">
                <Input
                  label="Prénom"
                  value={c.firstName}
                  disabled={readOnly}
                  onChange={(e) => {
                    const next = [...authorizedPickups];
                    next[index] = { ...c, firstName: e.target.value };
                    onChangePickups(next);
                  }}
                />
              </div>
              <div className="sm:col-span-3">
                <Input
                  label="Téléphone"
                  value={c.phoneNumber}
                  disabled={readOnly}
                  onChange={(e) => {
                    const next = [...authorizedPickups];
                    next[index] = { ...c, phoneNumber: e.target.value };
                    onChangePickups(next);
                  }}
                />
              </div>
              <div className="sm:col-span-1 flex sm:justify-end">
                {!readOnly && authorizedPickups.length > 1 && (
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="outline"
                    color="destructive"
                    icon={Trash2}
                    iconOnly
                    tooltip="Retirer"
                    onClick={() =>
                      onChangePickups(
                        authorizedPickups.filter((_, i) => i !== index)
                      )
                    }
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {!readOnly && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              onChangePickups([
                ...authorizedPickups,
                { firstName: "", lastName: "", phoneNumber: "" },
              ])
            }
          >
            <Plus className="mr-1 h-4 w-4" />
            Ajouter une personne
          </Button>
        )}
      </Card>
    </div>
  );
}
