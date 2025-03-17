import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";

/**
 * Route pour enregistrer les souscriptions des utilisateurs
 *
 * Cette route permet d'enregistrer les souscriptions des utilisateurs
 * en récupérant l'endpoint de la souscription depuis la requête.
 *
 */

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    console.log("session", session);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const subscription = await request.json();

    if (
      !subscription?.endpoint ||
      !subscription?.keys?.p256dh ||
      !subscription?.keys?.auth
    ) {
      return NextResponse.json(
        { message: "Données de souscription incomplètes" },
        { status: 400 }
      );
    }

    // Vérifier si une souscription existe déjà pour cet endpoint
    const existingSubscription = await prisma.pushSubscription.findUnique({
      where: { endpoint: subscription.endpoint },
    });

    if (existingSubscription) {
      return NextResponse.json(
        { message: "Souscription déjà existante" },
        { status: 200 }
      );
    }

    // Créer une nouvelle souscription
    await prisma.pushSubscription.create({
      data: {
        userId: session.user.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    });

    return NextResponse.json(
      { message: "Souscription enregistrée avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de la souscription:", error);
    return NextResponse.json(
      { message: "Erreur lors de l'enregistrement" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const subscription = await request.json();

    if (!subscription?.endpoint) {
      return NextResponse.json(
        { message: "Endpoint manquant" },
        { status: 400 }
      );
    }

    // Supprimer la souscription
    await prisma.pushSubscription.delete({
      where: { endpoint: subscription.endpoint },
    });

    return NextResponse.json(
      { message: "Souscription supprimée avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la suppression de la souscription:", error);
    return NextResponse.json(
      { message: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}
