// Flujo completo del Gate 1 contra los emuladores de Firebase.
import { expect, test, type Page } from '@playwright/test'

const email = `e2e-${Date.now()}@test.dev`
const password = 'secreto123'

async function noHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow, 'la página no debe desbordar horizontalmente').toBeLessThanOrEqual(1)
}

const shot = (page: Page, name: string) =>
  page.screenshot({ path: `test-results/screens/${test.info().project.name}-${name}.png`, fullPage: true })

test.describe.configure({ mode: 'serial' })

test('rutas protegidas redirigen a login', async ({ page }) => {
  await page.goto('/tabulador')
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('heading', { name: 'Bienvenido de vuelta' })).toBeVisible()
  await noHorizontalOverflow(page)
  await shot(page, '01-login')
})

test('flujo completo: registro, preferencias, tabulador, sesión', async ({ page }, info) => {
  const mail = `${info.project.name}-${email}`

  // Registro
  await page.goto('/registro')
  await shot(page, '02-registro')
  await page.getByLabel('Nombre profesional o comercial').fill('Estudio Luna')
  await page.getByLabel('Correo electrónico').fill(mail)
  await page.getByLabel('Contraseña', { exact: true }).fill(password)
  await page.getByLabel('Confirmar').fill(password)
  await page.getByRole('button', { name: /Crear cuenta/ }).click()

  // Dashboard
  await expect(page.getByRole('heading', { name: 'Estudio Luna' })).toBeVisible()
  await expect(page.getByText('Primeros pasos')).toBeVisible()
  await noHorizontalOverflow(page)
  await shot(page, '03-dashboard-vacio')

  // Preferencias: moneda BRL y nuevo nombre
  await page.goto('/preferencias')
  await page.getByLabel('Nombre profesional o comercial').fill('Estudio Luna Creativa')
  await page.getByLabel('Moneda predeterminada').selectOption('BRL')
  await page.getByRole('button', { name: 'Guardar cambios' }).click()
  await expect(page.getByText('Preferencias guardadas')).toBeVisible()
  await noHorizontalOverflow(page)
  await shot(page, '04-preferencias')

  // Tabulador: estado vacío → crear
  await page.goto('/tabulador')
  await expect(page.getByText('Tu tabulador está vacío')).toBeVisible()
  await shot(page, '05-tabulador-vacio')
  await page.getByRole('button', { name: 'Registrar mi primer servicio' }).click()
  await page.getByLabel('Nombre del servicio').fill('Diseño de logotipo')
  await page.getByLabel(/Descripción/).fill('Tres propuestas y dos rondas de cambios')
  await page.getByLabel(/Precio/).fill('450')
  await page.getByRole('button', { name: 'Registrar servicio' }).click()
  await expect(page.getByText('Servicio registrado')).toBeVisible()

  await page.getByRole('button', { name: 'Nuevo servicio' }).click()
  await page.getByLabel('Nombre del servicio').fill('Consultoría')
  await page.getByLabel(/Precio/).fill('120')
  await page.getByRole('button', { name: 'Hora', exact: true }).click()
  await page.getByRole('button', { name: 'Registrar servicio' }).click()
  await expect(page.getByRole('heading', { name: 'Consultoría' })).toBeVisible()
  await expect(page.getByText('por hora')).toBeVisible()
  await expect(page.getByText(/120,00/)).toBeVisible()

  // Validación: precio vacío
  await page.getByRole('button', { name: 'Nuevo servicio' }).click()
  await page.getByLabel('Nombre del servicio').fill('Sin precio')
  await page.getByRole('button', { name: 'Registrar servicio' }).click()
  await expect(page.getByText('Ingresa un precio válido.')).toBeVisible()
  await page.getByRole('button', { name: 'Cancelar' }).click()

  await noHorizontalOverflow(page)
  await shot(page, '06-tabulador')

  // Editar
  const card = page.locator('article', { hasText: 'Diseño de logotipo' })
  await card.getByRole('button', { name: 'Editar', exact: true }).last().click()
  await page.getByLabel(/Precio/).fill('500')
  await page.getByRole('button', { name: 'Guardar cambios' }).click()
  await expect(page.getByText('Servicio actualizado')).toBeVisible()
  await expect(card.getByText(/500,00/)).toBeVisible()

  // Archivar y restaurar
  await card.getByRole('button', { name: 'Opciones' }).click()
  await page.getByRole('button', { name: 'Archivar' }).click()
  await expect(page.getByText('Servicio archivado')).toBeVisible()
  await expect(page.locator('article', { hasText: 'Diseño de logotipo' })).toHaveCount(0)
  await page.getByRole('button', { name: /archivados/ }).click()
  const archived = page.locator('article', { hasText: 'Diseño de logotipo' })
  await archived.getByRole('button', { name: 'Opciones' }).click()
  await page.getByRole('button', { name: 'Restaurar' }).click()
  await expect(page.getByText('Servicio restaurado')).toBeVisible()
  await page.getByRole('button', { name: /activos/ }).click()

  // Eliminar
  const consult = page.locator('article', { hasText: 'Consultoría' })
  await consult.getByRole('button', { name: 'Opciones' }).click()
  await page.getByRole('button', { name: 'Eliminar' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Eliminar' }).click()
  await expect(page.getByText('Servicio eliminado')).toBeVisible()
  await expect(page.locator('article', { hasText: 'Consultoría' })).toHaveCount(0)

  // Dashboard con datos
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Estudio Luna Creativa' })).toBeVisible()
  await expect(page.getByText('BRL').first()).toBeVisible()
  await shot(page, '07-dashboard')

  // Pendientes identificados
  await page.goto('/historial')
  await expect(page.getByText('Esta sección aún no está disponible')).toBeVisible()

  // Persistencia de sesión tras recargar
  await page.reload()
  await expect(page).toHaveURL(/\/historial$/)

  // Cerrar sesión
  await page.getByRole('button', { name: 'Cerrar sesión' }).first().click()
  await expect(page).toHaveURL(/\/login$/)
  await page.goto('/')
  await expect(page).toHaveURL(/\/login$/)

  // Login con credenciales incorrectas y correctas
  await page.getByLabel('Correo electrónico').fill(mail)
  await page.getByLabel('Contraseña', { exact: true }).fill('incorrecta')
  await page.getByRole('button', { name: /Iniciar sesión/ }).click()
  await expect(page.getByText('Correo o contraseña incorrectos.')).toBeVisible()
  await page.getByLabel('Contraseña', { exact: true }).fill(password)
  await page.getByRole('button', { name: /Iniciar sesión/ }).click()
  await expect(page.getByRole('heading', { name: 'Estudio Luna Creativa' })).toBeVisible()
  // Los datos siguen ahí tras volver a entrar
  await page.goto('/tabulador')
  await expect(page.getByRole('heading', { name: 'Diseño de logotipo' })).toBeVisible()

  // Recuperación de contraseña
  await page.getByRole('button', { name: 'Cerrar sesión' }).first().click()
  await page.goto('/recuperar')
  await page.getByLabel('Correo electrónico').fill(mail)
  await page.getByRole('button', { name: 'Enviar enlace' }).click()
  await expect(page.getByText('Revisa tu bandeja de entrada')).toBeVisible()
  await shot(page, '08-recuperar')
})
