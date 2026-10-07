import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBoaE303Ofp0AzaqQxVczbkPGjumUKy1fs",
  authDomain: "aayupcrm.firebaseapp.com",
  projectId: "aayupcrm",
  storageBucket: "aayupcrm.firebasestorage.app",
  messagingSenderId: "789545656558",
  appId: "1:789545656558:web:db8fd908d322a3bd8993ff",
  measurementId: "G-J76PV66NHY"
};

const VAPID_KEY = "BKUmqyPT9WEfCi7_YTHV0eS8U-06YtLMkhVxB7nv_0JByKmgn7jRykwGIttBE4BFQCQaYKLAjn6LrxivrmlonLE";

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Request FCM Token & Permission for Live Web Push Notifications
export async function requestNotificationPermission() {
  try {
    const supported = await isSupported();
    if (!supported) {
      console.log("Firebase Messaging is not supported on this browser.");
      return null;
    }

    if (!('Notification' in window)) {
      console.log('This browser does not support desktop notifications.');
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');

      // Register or get service worker
      let serviceWorkerRegistration = null;
      if ('serviceWorker' in navigator) {
        serviceWorkerRegistration = await navigator.serviceWorker.ready;
      }

      const messaging = getMessaging(app);
      const currentToken = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: serviceWorkerRegistration || undefined,
      });

      if (currentToken) {
        console.log('FCM Registration Token:', currentToken);
        localStorage.setItem('fcm_token', currentToken);
        return currentToken;
      } else {
        console.log('No registration token available. Request permission to generate one.');
      }
    } else {
      console.log('Unable to get permission to notify.');
    }
  } catch (err) {
    console.error('Error getting notification permission or token:', err);
  }
  return null;
}

// Listen for foreground live messages
export async function onMessageListener(callback) {
  const supported = await isSupported();
  if (!supported) return () => {};

  const messaging = getMessaging(app);
  return onMessage(messaging, (payload) => {
    console.log('Foreground notification received:', payload);
    if (callback) callback(payload);
  });
}
