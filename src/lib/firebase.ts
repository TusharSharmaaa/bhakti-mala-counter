import { initializeApp } from "firebase/app";
import { getMessaging, isSupported, type Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyATAn4Bv6wvyfcth6vwcvLF-Glrq1-j7pM",
  authDomain: "jap-notificatin.firebaseapp.com",
  projectId: "jap-notificatin",
  storageBucket: "jap-notificatin.firebasestorage.app",
  messagingSenderId: "354062802995",
  appId: "1:354062802995:web:6dd90b81ab72ffe33c8346",
};

export const firebaseApp = initializeApp(firebaseConfig);

let messagingInstance: Messaging | null = null;

export async function getMessagingIfSupported() {
  if (!(await isSupported())) return null;
  if (!messagingInstance) {
    messagingInstance = getMessaging(firebaseApp);
  }
  return messagingInstance;
}

// Your public VAPID key from Firebase console (Web Push certificates)
export const VAPID_PUBLIC_KEY =
  "BGtHOahxwlCkRn5OQRX5U1fzmlrZ9pkMemZkWRBJX2e_6c6Eke92kbffxbIa7UEkFtEG96nQwm0pAzYoD6JoixA";



