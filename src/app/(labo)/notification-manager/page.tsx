"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/inputs/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/inputs/select";
import { useNotification } from "@/hooks/useNotification";
import { NotificationContent } from "@/types/notification.type";
import { useRoles } from "@/hooks/query/useRoles";
import Textarea from "@/components/ui/inputs/textarea";
import { LoadingPage } from "@/components/ui/Loading";

export default function NotificationManager() {
  const { isSubscribed, subscribe, unsubscribe, pushMessage } =
    useNotification();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetType, setTargetType] = useState<"user" | "role">("user");
  const [targetId, setTargetId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { data: roles, isLoading: isRolesLoading } = useRoles();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const notification: NotificationContent = {
      title,
      message,
      icon: "/icons/Message.png",
      target: {
        type: targetType,
        id: targetId,
      },
      data: {
        path: "/private/dashboard",
        icon: "/icons/Message.png",
        timestamp: Date.now(),
      },
    };

    await pushMessage(notification);
    setIsLoading(false);
  };

  if (isRolesLoading || !roles) {
    return <LoadingPage />;
  }

  return (
    <div className="flex flex-col gap-4 items-center justify-center   w-full min-h-[calc(100vh-170px)]">
      <h2 className="">Gestionnaire de Notifications</h2>

      <div className="mb-8">
        <Button
          onClick={isSubscribed ? unsubscribe : subscribe}
          color={isSubscribed ? "destructive" : "default"}
        >
          {isSubscribed
            ? "Désactiver les notifications"
            : "Activer les notifications"}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md w-full">
        <Input
          label="Titre"
          id="title"
          value={title}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setTitle(e.target.value)
          }
          placeholder="Titre de la notification"
          required
        />
        <Textarea
          label="Message"
          id="message"
          value={message}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            setMessage(e.target.value)
          }
        />

        <Select
          label="Type de cible"
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

        <div className="space-y-2">
          {targetType === "user" ? (
            <Input
              label="ID de l'utilisateur"
              id="targetId"
              value={targetId}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setTargetId(e.target.value)
              }
              placeholder="ID de l'utilisateur"
              required
            />
          ) : (
            <Select value={targetId} onValueChange={setTargetId} label="Rôle">
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le rôle" />
              </SelectTrigger>
              <SelectContent>
                {roles.data?.map((role) => (
                  <SelectItem key={role.id} value={role.name}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          variant="solid"
          color="accent"
        >
          {isLoading ? "Envoi en cours..." : "Envoyer la notification"}
        </Button>
      </form>
    </div>
  );
}
