// Pruebas de reglas de Firestore contra los emuladores (Auth + Firestore).
// Ejecutar con: npm run test:emulators
import { deleteApp, initializeApp, type FirebaseApp } from 'firebase/app'
import { connectAuthEmulator, createUserWithEmailAndPassword, getAuth } from 'firebase/auth'
import {
  Timestamp,
  addDoc,
  collection,
  connectFirestoreEmulator,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Firestore,
} from 'firebase/firestore'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const PROJECT = 'demo-presupuestosya'
const apps: FirebaseApp[] = []

function client(name: string) {
  const app = initializeApp({ apiKey: 'demo-key', projectId: PROJECT, appId: 'demo-app' }, name)
  apps.push(app)
  const auth = getAuth(app)
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  const db = getFirestore(app)
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
  return { auth, db }
}

async function signedIn(name: string) {
  const c = client(name)
  const cred = await createUserWithEmailAndPassword(c.auth, `${name}-${Date.now()}@test.dev`, 'secreto123')
  return { ...c, uid: cred.user.uid }
}

const denied = (p: Promise<unknown>) => expect(p).rejects.toMatchObject({ code: 'permission-denied' })

const service = (over: Record<string, unknown> = {}) => ({
  name: 'Diseño de logo',
  description: 'Tres propuestas',
  price: 150,
  unit: 'servicio',
  archived: false,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
  ...over,
})

let A: Awaited<ReturnType<typeof signedIn>>
let B: Awaited<ReturnType<typeof signedIn>>
let anon: { db: Firestore }

beforeAll(async () => {
  A = await signedIn('alice')
  B = await signedIn('bob')
  anon = client('anon')
})

afterAll(async () => {
  await Promise.all(apps.map((a) => deleteApp(a)))
})

describe('preferencias (users/{uid})', () => {
  it('el dueño crea y lee su perfil válido', async () => {
    await setDoc(doc(A.db, 'users', A.uid), { businessName: 'Estudio Alice', currency: 'BRL', updatedAt: serverTimestamp() })
    const snap = await getDoc(doc(A.db, 'users', A.uid))
    expect(snap.data()?.currency).toBe('BRL')
  })

  it('rechaza moneda no soportada', () =>
    denied(setDoc(doc(A.db, 'users', A.uid), { businessName: 'X', currency: 'BTC', updatedAt: serverTimestamp() })))

  it('rechaza campos extra (p. ej. logo)', () =>
    denied(setDoc(doc(A.db, 'users', A.uid), { businessName: 'X', currency: 'USD', updatedAt: serverTimestamp(), logoUrl: 'x' })))

  it('rechaza nombre de más de 80 caracteres', () =>
    denied(setDoc(doc(A.db, 'users', A.uid), { businessName: 'a'.repeat(81), currency: 'USD', updatedAt: serverTimestamp() })))

  it('rechaza updatedAt que no sea la hora del servidor', () =>
    denied(setDoc(doc(A.db, 'users', A.uid), { businessName: 'X', currency: 'USD', updatedAt: Timestamp.fromDate(new Date(2000, 1, 1)) })))

  it('otro usuario no puede leer ni escribir el perfil ajeno', async () => {
    await denied(getDoc(doc(B.db, 'users', A.uid)))
    await denied(setDoc(doc(B.db, 'users', A.uid), { businessName: 'hack', currency: 'USD', updatedAt: serverTimestamp() }))
  })

  it('sin sesión no se puede leer', () => denied(getDoc(doc(anon.db, 'users', A.uid))))

  it('no se puede listar la colección users', () => denied(getDocs(collection(A.db, 'users'))))
})

describe('tabulador (users/{uid}/services)', () => {
  let id = ''

  it('el dueño registra un servicio válido', async () => {
    const ref = await addDoc(collection(A.db, 'users', A.uid, 'services'), service())
    id = ref.id
    const snap = await getDoc(ref)
    expect(snap.data()?.name).toBe('Diseño de logo')
  })

  it('el dueño lista su catálogo', async () => {
    const snap = await getDocs(collection(A.db, 'users', A.uid, 'services'))
    expect(snap.size).toBeGreaterThanOrEqual(1)
  })

  it.each([
    ['nombre vacío', { name: '' }],
    ['precio negativo', { price: -1 }],
    ['precio como texto', { price: '100' }],
    ['unidad inválida', { unit: 'mes' }],
    ['descripción > 300', { description: 'a'.repeat(301) }],
    ['campo extra', { color: 'rojo' }],
    ['createdAt del cliente', { createdAt: Timestamp.now() }],
  ])('rechaza servicio con %s', (_label, over) => denied(addDoc(collection(A.db, 'users', A.uid, 'services'), service(over))))

  it('rechaza servicio sin descripción (campo obligatorio)', () => {
    const { description: _omit, ...rest } = service()
    return denied(addDoc(collection(A.db, 'users', A.uid, 'services'), rest))
  })

  it('el dueño edita y archiva', async () => {
    const ref = doc(A.db, 'users', A.uid, 'services', id)
    await updateDoc(ref, { price: 200, updatedAt: serverTimestamp() })
    await updateDoc(ref, { archived: true, updatedAt: serverTimestamp() })
    const snap = await getDoc(ref)
    expect(snap.data()).toMatchObject({ price: 200, archived: true })
  })

  it('no se puede modificar createdAt', () =>
    denied(updateDoc(doc(A.db, 'users', A.uid, 'services', id), { createdAt: Timestamp.now(), updatedAt: serverTimestamp() })))

  it('otro usuario no puede leer, crear, editar ni borrar servicios ajenos', async () => {
    await denied(getDocs(collection(B.db, 'users', A.uid, 'services')))
    await denied(getDoc(doc(B.db, 'users', A.uid, 'services', id)))
    await denied(addDoc(collection(B.db, 'users', A.uid, 'services'), service()))
    await denied(updateDoc(doc(B.db, 'users', A.uid, 'services', id), { price: 1, updatedAt: serverTimestamp() }))
    await denied(deleteDoc(doc(B.db, 'users', A.uid, 'services', id)))
  })

  it('sin sesión no se puede leer el catálogo', () => denied(getDocs(collection(anon.db, 'users', A.uid, 'services'))))

  it('el dueño elimina su servicio', async () => {
    await deleteDoc(doc(A.db, 'users', A.uid, 'services', id))
    expect((await getDoc(doc(A.db, 'users', A.uid, 'services', id))).exists()).toBe(false)
  })

  it('colecciones fuera del modelo están cerradas', () =>
    denied(setDoc(doc(A.db, 'users', A.uid, 'otros', 'x'), { a: 1 })))
})
