const MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'El correo no es válido.',
  'auth/missing-email': 'Escribe tu correo.',
  'auth/missing-password': 'Escribe tu contraseña.',
  'auth/invalid-credential': 'Correo o contraseña incorrectos.',
  'auth/wrong-password': 'Correo o contraseña incorrectos.',
  'auth/user-not-found': 'Correo o contraseña incorrectos.',
  'auth/user-disabled': 'Esta cuenta fue deshabilitada.',
  'auth/email-already-in-use': 'Ya existe una cuenta con este correo.',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
  'auth/password-does-not-meet-requirements': 'La contraseña no cumple los requisitos mínimos.',
  'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.',
  'auth/network-request-failed': 'Sin conexión. Revisa tu internet.',
  'auth/operation-not-allowed': 'El acceso con correo no está habilitado en Firebase.',
}

export function authErrorMessage(err: unknown) {
  const code = (err as { code?: string })?.code ?? ''
  return MESSAGES[code] ?? 'Ocurrió un error inesperado. Inténtalo de nuevo.'
}

export function dbErrorMessage(err: unknown) {
  const code = (err as { code?: string })?.code ?? ''
  if (code === 'permission-denied') return 'No tienes permiso para esta acción o los datos no son válidos.'
  if (code === 'unavailable') return 'Sin conexión. Los cambios se sincronizarán al reconectar.'
  return 'No se pudo guardar. Inténtalo de nuevo.'
}
