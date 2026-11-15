/**
 * Firestore guarda las escrituras en cola cuando no hay conexión y la promesa
 * no se resuelve hasta sincronizar. Online esperamos la confirmación; offline
 * devolvemos 'queued' para no bloquear la interfaz.
 */
export async function commitWrite(p: Promise<unknown>): Promise<'saved' | 'queued'> {
  if (typeof navigator === 'undefined' || navigator.onLine) {
    await p
    return 'saved'
  }
  p.catch((e) => console.error('Escritura pendiente rechazada', e))
  return 'queued'
}

export const QUEUED_MSG = 'Sin conexión: el cambio se sincronizará al reconectar'
