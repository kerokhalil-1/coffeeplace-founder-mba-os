import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDN5jKPvzvwki5Ei_AmuERtNk0H0rn_KXk",
  authDomain: "coffeeplace-mba-os.firebaseapp.com",
  projectId: "coffeeplace-mba-os",
  storageBucket: "coffeeplace-mba-os.firebasestorage.app",
  messagingSenderId: "409316516608",
  appId: "1:409316516608:web:db8c61ba65af4103b0c9e5"
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
export const db = getFirestore(app)
