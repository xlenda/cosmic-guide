// Service Worker do Cosmic Guide — só existe pra viabilizar Web Push (o app é
// só web, sem publicação em loja, então esta é a única forma de notificação
// real de celular hoje — ver lib/webPush.js). Não faz cache/offline: escopo
// mínimo, só "push" (recebe e mostra a notificação) e "notificationclick"
// (abre/foca o app ao tocar nela).

self.addEventListener("push", (event) => {
  let data = { title: "✨ Cosmic Guide", body: "Seu pensamento cósmico do dia chegou." };
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data.body = event.data.text() || data.body;
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/cosmic-guide/icon.png",
      badge: "/cosmic-guide/icon.png",
      tag: "cosmic-guide-daily-thought", // substitui a notificação de ontem em vez de empilhar
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = "/cosmic-guide/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(targetUrl) && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
