// Firebase Cloud Messaging Service Worker for background notifications
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBoaE303Ofp0AzaqQxVczbkPGjumUKy1fs",
  authDomain: "aayupcrm.firebaseapp.com",
  projectId: "aayupcrm",
  storageBucket: "aayupcrm.firebasestorage.app",
  messagingSenderId: "789545656558",
  appId: "1:789545656558:web:db8fd908d322a3bd8993ff",
  measurementId: "G-J76PV66NHY"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification?.title || payload.data?.title || 'CRM Notification';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'You have a new update in CRM.',
    icon: '/logo.png',
    badge: '/logo.png',
    data: payload.data || {}
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
