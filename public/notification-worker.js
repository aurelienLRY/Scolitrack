self.addEventListener("push", function (event) {
  const options = {
    body: event.data.text(),
    icon: "/img/Logo_Scolitrack.png",
    badge: "/img/Logo_Scolitrack.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "Voir plus",
        icon: "/img/Logo_Scolitrack.png",
      },
      {
        action: "close",
        title: "Fermer",
        icon: "/img/Logo_Scolitrack.png",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification("Scolitrack", options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/private/dashboard"));
  }
});
