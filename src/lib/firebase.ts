import { initializeApp, type FirebaseApp } from 'firebase/app'
import { browserLocalPersistence, connectAuthEmulator, getAuth, setPersistence, type Auth } from 'firebase/auth'
import {
  connectFirestoreEmulator,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from 'firebase/firestore'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

/** true cuando el build no tiene la configuración web de Firebase. */
export const firebaseMissingConfig = !config.apiKey || !config.projectId || !config.appId

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null

if (!firebaseMissingConfig) {
  app = initializeApp(config)
  auth = getAuth(app)
  auth.languageCode = 'es'
  void setPersistence(auth, browserLocalPersistence)

  // Caché local persistente: las recargas reutilizan datos y el listener
  // solo trae documentos modificados, lo que reduce lecturas facturables.
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  })

  if (import.meta.env.VITE_USE_EMULATORS === 'true') {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
    connectFirestoreEmulator(db, '127.0.0.1', 8080)
  }
}

export function getFirebase() {
  if (!auth || !db) throw new Error('Firebase no está configurado')
  return { app: app!, auth, db }
}
