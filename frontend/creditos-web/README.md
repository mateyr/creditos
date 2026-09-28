# creditos-web

Frontend del sistema de créditos: login, solicitudes, comité de riesgo y desembolso.

## Stack

- React 19 + TypeScript + Vite
- TanStack Router (rutas basadas en archivos en `src/routes/`)
- TanStack Query
- shadcn/ui (Base UI) + Tailwind CSS

## Requisitos

- Node.js 24+
- pnpm

## Comandos

```bash
pnpm install     # instalar dependencias
pnpm dev         # servidor de desarrollo en http://localhost:5173
pnpm build       # typecheck + build de producción
pnpm lint        # ESLint
pnpm format      # Prettier
```

En desarrollo, Vite redirige `/api` al backend en `http://localhost:5269` (se puede cambiar con la variable `API_URL`).

## Estructura

```
src/
  routes/          rutas (routeTree.gen.ts se genera solo)
  components/      componentes de la app
  components/ui/   componentes de shadcn
  hooks/
  lib/
```

Para agregar un componente de shadcn:

```bash
pnpm dlx shadcn@latest add <componente>
```
