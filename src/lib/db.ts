import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Timestamp,
} from 'firebase/firestore'
import { getFirebase } from './firebase'
import {
  DEFAULT_CURRENCY,
  isCurrency,
  isUnit,
  type Profile,
  type Service,
  type ServiceInput,
} from './model'

// Estructura en Firestore (mínima):
//   users/{uid}                     → preferencias { businessName, currency, updatedAt }
//   users/{uid}/services/{serviceId} → tabulador

const userRef = (uid: string) => doc(getFirebase().db, 'users', uid)
const servicesRef = (uid: string) => collection(getFirebase().db, 'users', uid, 'services')

const toDate = (t: unknown) => (t && typeof (t as Timestamp).toDate === 'function' ? (t as Timestamp).toDate() : null)

export function watchProfile(uid: string, cb: (p: Profile | null) => void, onError: (e: Error) => void) {
  return onSnapshot(
    userRef(uid),
    (snap) => {
      if (!snap.exists()) return cb(null)
      const d = snap.data()
      cb({
        businessName: typeof d.businessName === 'string' ? d.businessName : '',
        currency: isCurrency(d.currency) ? d.currency : DEFAULT_CURRENCY,
      })
    },
    onError,
  )
}

export function saveProfile(uid: string, p: Profile) {
  return setDoc(userRef(uid), {
    businessName: p.businessName.trim(),
    currency: p.currency,
    updatedAt: serverTimestamp(),
  })
}

export function watchServices(uid: string, cb: (s: Service[]) => void, onError: (e: Error) => void) {
  // Un único listener por sesión: la primera carga lee el catálogo y
  // después solo se cobran los documentos que cambian.
  return onSnapshot(
    servicesRef(uid),
    (snap) => {
      const list: Service[] = snap.docs.map((d) => {
        const v = d.data({ serverTimestamps: 'estimate' })
        return {
          id: d.id,
          name: String(v.name ?? ''),
          description: String(v.description ?? ''),
          price: Number(v.price ?? 0),
          unit: isUnit(v.unit) ? v.unit : 'servicio',
          archived: Boolean(v.archived),
          createdAt: toDate(v.createdAt),
          updatedAt: toDate(v.updatedAt),
        }
      })
      list.sort((a, b) => (b.createdAt?.getTime() ?? Date.now()) - (a.createdAt?.getTime() ?? Date.now()))
      cb(list)
    },
    onError,
  )
}

const clean = (s: ServiceInput) => ({
  name: s.name.trim(),
  description: s.description.trim(),
  price: Math.round(s.price * 100) / 100,
  unit: s.unit,
})

export function createService(uid: string, s: ServiceInput) {
  return addDoc(servicesRef(uid), {
    ...clean(s),
    archived: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export function updateService(uid: string, id: string, s: ServiceInput) {
  return updateDoc(doc(servicesRef(uid), id), { ...clean(s), updatedAt: serverTimestamp() })
}

export function setServiceArchived(uid: string, id: string, archived: boolean) {
  return updateDoc(doc(servicesRef(uid), id), { archived, updatedAt: serverTimestamp() })
}

export function deleteService(uid: string, id: string) {
  return deleteDoc(doc(servicesRef(uid), id))
}
