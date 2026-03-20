self.addEventListener('push', e => {
  const data = e.data.json();
  console.log('Push Received...');
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/vite.svg',
    data: { url: data.url }
  });
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url && client.url.includes(e.notification.data.url) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        // Construct the full URL if data.url is a relative path
        const targetUrl = new URL(e.notification.data.url, self.location.origin).href;
        return clients.openWindow(targetUrl);
      }
    })
  );
});
