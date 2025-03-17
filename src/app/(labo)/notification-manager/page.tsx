"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { Button } from "@/components/shared/button";
import Input from "@/components/shared/Input";
import { Label } from "@/components/shared/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shared/select";
import { useNotification } from "@/hooks/useNotification";
import { NotificationContent } from "@/types/notificationContent.type";

export default function NotificationManager() {
  const { isSubscribed, subscribe, unsubscribe, pushMessage } =
    useNotification();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetType, setTargetType] = useState<"user" | "role">("user");
  const [targetId, setTargetId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const notification: NotificationContent = {
      title,
      message,
      target: {
        type: targetType,
        id: targetId,
      },
      data: {
        link: "/private/dashboard",
        timestamp: Date.now(),
      },
      actions: [
        {
          action: "open",
          title: "Ouvrir",
        },
      ],
    };

    await pushMessage(notification);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col gap-4 items-center justify-center   w-full min-h-[calc(100vh-170px)]">
      <h2 className="">Gestionnaire de Notifications</h2>

      <div className="mb-8">
        <Button
          onClick={isSubscribed ? unsubscribe : subscribe}
          variant={isSubscribed ? "destructive" : "default"}
        >
          {isSubscribed
            ? "Désactiver les notifications"
            : "Activer les notifications"}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md w-full">
        <div className="space-y-2">
          <Label htmlFor="title">Titre</Label>
          <Input
            id="title"
            value={title}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setTitle(e.target.value)
            }
            placeholder="Titre de la notification"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Input
            id="message"
            value={message}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setMessage(e.target.value)
            }
            placeholder="Contenu de la notification"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetType">Type de cible</Label>
          <Select
            value={targetType}
            onValueChange={(value: string) =>
              setTargetType(value as "user" | "role")
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner le type de cible" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">Utilisateur spécifique</SelectItem>
              <SelectItem value="role">Groupe par rôle</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetId">
            {targetType === "user" ? "ID de l'utilisateur" : "Rôle"}
          </Label>
          {targetType === "user" ? (
            <Input
              id="targetId"
              value={targetId}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setTargetId(e.target.value)
              }
              placeholder="ID de l'utilisateur"
              required
            />
          ) : (
            <Select value={targetId} onValueChange={setTargetId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="TEACHER">Enseignant</SelectItem>
                <SelectItem value="USER">Utilisateur</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        <Button type="submit" disabled={isLoading} variant="accent">
          {isLoading ? "Envoi en cours..." : "Envoyer la notification"}
        </Button>
      </form>
    </div>
  );
}
