# PresupuestosYA

Crea presupuestos profesionales de servicios a partir de tu propio tabulador de precios.

**Stack:** React + Vite + TypeScript · Tailwind CSS · Firebase Authentication · Cloud Firestore · Firebase Hosting (plan Spark, costo US$0).

## Estado

- **Gate 1** — autenticación, dashboard, tabulador de servicios (CRUD + archivar), preferencias, reglas de seguridad y despliegue.
- Gates 2 y 3 — pendientes (las secciones aparecen marcadas como *Próximamente*).

## Modelo de datos

```
users/{uid}                      { businessName, currency, updatedAt }
users/{uid}/services/{serviceId} { name, description, price, unit, archived, createdAt, updatedAt }
```

Las reglas (`firestore.rules`) aíslan los datos por UID y validan tipos, tamaños, moneda, unidad y timestamps del servidor.

## Desarrollo

```bash
npm install
cp .env.example .env.local   # completa con tu firebaseConfig
npm run dev
```

Pruebas (requieren Java 21 para los emuladores):

```bash
npm run build:emulators
npx playwright install chromium
npm run test:emulators       # reglas de Firestore + flujo E2E en móvil y escritorio
```

## Despliegue

Cada push a `main` ejecuta `.github/workflows/ci-deploy.yml`: typecheck, build, pruebas con emuladores y, si todo pasa, `firebase deploy --only hosting,firestore:rules` usando el secret `FIREBASE_SERVICE_ACCOUNT`.
