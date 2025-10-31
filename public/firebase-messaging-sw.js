/* eslint-disable no-undef */
// Firebase Cloud Messaging SW (compat for background messages)
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyATAn4Bv6wvyfcth6vwcvLF-Glrq1-j7pM",
  authDomain: "jap-notificatin.firebaseapp.com",
  projectId: "jap-notificatin",
  storageBucket: "jap-notificatin.firebasestorage.app",
  messagingSenderId: "354062802995",
  appId: "1:354062802995:web:6dd90b81ab72ffe33c8346",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload?.notification?.title || "Notification";
  const options = {
    body: payload?.notification?.body || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: payload?.data || {},
  };
  self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification?.data?.url || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && "focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    }),
  );
});


