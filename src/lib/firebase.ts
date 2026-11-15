import { initializeApp, type FirebaseApp } from 'firebase/app'
import { browserLocalPersistence, connectAuthEmulator, getAuth, setPersistence, type Auth } from 'firebase/auth'
import {
  connectFirestoreEmulator,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from 'firebase/firestore'

const env = import.meta.env
const useEmulators = env.VITE_USE_EMULATORS === 'true'

/**
 * Configuración PÚBLICA del Firebase Web SDK del proyecto presupuestosya-e5962.
 * No es una credencial: Firebase la diseña para ir en el frontend y la seguridad
 * la aplican las reglas de Firestore y los dominios autorizados de Auth.
 * Se puede sobrescribir con variables VITE_FIREBASE_* (ver .env.example).
 */
const PUBLIC_WEB_CONFIG = {
  apiKey: 'AIzaSyB3rV6sVWT9TcsjQzo1G5EuUBxkUoTdmX8',
  authDomain: 'presupuestosya-e5962.firebaseapp.com',
  projectId: 'presupuestosya-e5962',
  storageBucket: 'presupuestosya-e5962.firebasestorage.app',
  messagingSenderId: '932642994111',
  appId: '1:932642994111:web:2cedc3c1e4b4ce5ab6530a',
}

const EMULATOR_CONFIG = {
  apiKey: 'demo-key',
  authDomain: 'demo-presupuestosya.firebaseapp.com',
  projectId: 'demo-presupuestosya',
  appId: 'demo-app',
}

const config = useEmulators
  ? EMULATOR_CONFIG
  : {
      apiKey: env.VITE_FIREBASE_API_KEY || PUBLIC_WEB_CONFIG.apiKey,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || PUBLIC_WEB_CONFIG.authDomain,
      projectId: env.VITE_FIREBASE_PROJECT_ID || PUBLIC_WEB_CONFIG.projectId,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || PUBLIC_WEB_CONFIG.storageBucket,
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || PUBLIC_WEB_CONFIG.messagingSenderId,
      appId: env.VITE_FIREBASE_APP_ID || PUBLIC_WEB_CONFIG.appId,
    }

const app: FirebaseApp = initializeApp(config)
const auth: Auth = getAuth(app)
auth.languageCode = 'es'
void setPersistence(auth, browserLocalPersistence)

// Caché local persistente: las recargas reutilizan datos y el listener
// solo trae documentos modificados, lo que reduce lecturas facturables.
const db: Firestore = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
})

if (useEmulators) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
}

export function getFirebase() {
  return { app, auth, db }
}
