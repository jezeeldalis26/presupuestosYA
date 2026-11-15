// Verificación del sitio PUBLICADO (Firebase real) después de cada despliegue.
// Usa una cuenta fija de pruebas y deja su tabulador limpio al terminar.
import { expect, test } from '@playwright/test'

const EMAIL = 'ci-smoke@presupuestosya-e5962.test'
const PASSWORD = 'SmokeTest-PresupuestosYA-1'
const stamp = Date.now().toString(36)

test.describe.configure({ mode: 'serial' })

test('la versión publicada coincide con el commit', async ({ page }) => {
  const res = await page.goto('/')
  expect(res?.status()).toBe(200)
  const expected = process.env.EXPECTED_SHA
  if (expected) await expect(page.locator('meta[name="build-version"]')).toHaveAttribute('content', expected)
})

test('rutas SPA no devuelven 404 al recargar', async ({ page }) => {
  for (const path of ['/tabulador', '/preferencias', '/registro', '/ruta-inexistente']) {
    const res = await page.goto(path)
    expect(res?.status(), path).toBe(200)
  }
})

test('registro/login, preferencias y tabulador persisten en Firebase real', async ({ page }, info) => {
  const name = `Smoke ${info.project.name} ${stamp}`

  // Login con la cuenta de pruebas; si no existe aún, se registra.
  await page.goto('/login')
  await page.getByLabel('Correo electrónico').fill(EMAIL)
  await page.getByLabel('Contraseña', { exact: true }).fill(PASSWORD)
  await page.getByRole('button', { name: /Iniciar sesión/ }).click()
  const welcome = page.getByText(/Buenos días|Buenas tardes|Buenas noches/)
  const wrong = page.getByText('Correo o contraseña incorrectos.')
  await expect(welcome.or(wrong)).toBeVisible({ timeout: 20_000 })
  if (await wrong.isVisible()) {
    await page.goto('/registro')
    await page.getByLabel('Nombre profesional o comercial').fill('Cuenta de pruebas CI')
    await page.getByLabel('Correo electrónico').fill(EMAIL)
    await page.getByLabel('Contraseña', { exact: true }).fill(PASSWORD)
    await page.getByLabel('Confirmar').fill(PASSWORD)
    await page.getByRole('button', { name: /Crear cuenta/ }).click()
    await expect(welcome).toBeVisible({ timeout: 20_000 })
  }

  // Preferencias
  await page.goto('/preferencias')
  await page.getByLabel('Nombre profesional o comercial').fill('Cuenta de pruebas CI')
  await page.getByLabel('Moneda predeterminada').selectOption(info.project.name === 'mobile' ? 'EUR' : 'BRL')
  const save = page.getByRole('button', { name: 'Guardar cambios' })
  if (await save.isEnabled()) {
    await save.click()
    await expect(page.getByText('Preferencias guardadas')).toBeVisible()
  }
  await page.reload()
  await expect(page.getByLabel('Nombre profesional o comercial')).toHaveValue('Cuenta de pruebas CI')

  // Crear servicio con decimales
  await page.goto('/tabulador')
  await page.getByRole('button', { name: 'Nuevo servicio' }).click()
  await page.getByLabel('Nombre del servicio').fill(name)
  await page.getByLabel(/Precio/).fill('1.250,50')
  await page.getByRole('button', { name: 'Registrar servicio' }).click()
  await expect(page.getByText('Servicio registrado')).toBeVisible()

  // Persistencia tras recargar
  await page.reload()
  const card = page.locator('article', { hasText: name })
  await expect(card).toBeVisible({ timeout: 15_000 })
  await expect(card.getByText(/1\.250,50/)).toBeVisible()

  // Editar
  await card.getByRole('button', { name: 'Editar', exact: true }).last().click()
  await page.getByLabel(/Precio/).fill('99,90')
  await page.getByRole('button', { name: 'Guardar cambios' }).click()
  await expect(page.getByText('Servicio actualizado')).toBeVisible()
  await expect(card.getByText(/99,90/)).toBeVisible()

  // Eliminar (deja la cuenta limpia)
  await card.getByRole('button', { name: 'Opciones' }).click()
  await page.getByRole('button', { name: 'Eliminar' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Eliminar' }).click()
  await expect(page.getByText('Servicio eliminado')).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Tabulador' })).toBeVisible()
  await expect(page.locator('article', { hasText: name })).toHaveCount(0)
  await page.screenshot({ path: `test-results/screens/live-${info.project.name}-tabulador.png`, fullPage: true })

  // Cerrar sesión
  await page.getByRole('button', { name: 'Cerrar sesión' }).first().click()
  await expect(page).toHaveURL(/\/login$/)
})
