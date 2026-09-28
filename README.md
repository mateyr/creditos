# Créditos

Simulación del ciclo de vida de una solicitud de crédito en una entidad financiera:

```
Login ──> Solicitud ──> Comité de riesgo ──> Desembolso
          (Pendiente)   (Aprobada/Rechazada)  (Desembolsada)
```

| Capa | Tecnología |
|---|---|
| Backend | ASP.NET Core (.NET 10), Minimal APIs, EF Core, ASP.NET Core Identity + JWT, FluentValidation |
| Frontend | React 19 + Vite, TanStack Router / Query / Form / Table, shadcn/ui, Tailwind CSS |
| Base de datos | SQLite |
| Infraestructura | Docker Compose (API + nginx para el frontend) |

## Ejecutar con Docker (recomendado)

Requisito: [Docker Desktop](https://www.docker.com/products/docker-desktop/) (o Docker Engine con Compose v2).

Desde la raíz del repositorio:

```bash
docker compose up --build
```

No hace falta configurar nada más. Cuando termine de levantar:

- Aplicación: **http://localhost:8080**
- Usuario: **`admin`** · Contraseña: **`Admin123*`**

Al iniciar, la API aplica las migraciones, crea la base de datos y el usuario administrador.

### Base de datos

La base SQLite (`creditos.db`) se guarda en el volumen de Docker `creditos-data`, montado en `/app/data`
dentro del contenedor de la API. Los datos se conservan al detener o reconstruir los contenedores.

```bash
docker compose cp api:/app/data/creditos.db .   # copiar la base para inspeccionarla (p. ej. con DB Browser for SQLite)
docker compose down                              # detener (conserva los datos)
docker compose down -v                           # detener y borrar la base para empezar de cero
```

### Configuración

Los contenedores corren sin usuario root. La API se configura con variables de entorno; el
`docker-compose.yml` trae valores locales por defecto, que se pueden reemplazar desde la terminal:

| Variable | Uso | Valor por defecto |
|---|---|---|
| `JWT_SECRET` | Clave para firmar los JWT (mín. 32 caracteres) | valor de desarrollo |
| `DEFAULT_USER_NAME` | Usuario administrador inicial | `admin` |
| `DEFAULT_USER_PASSWORD` | Contraseña del usuario inicial | `Admin123*` |

```bash
JWT_SECRET="mi-clave-de-al-menos-32-caracteres..." docker compose up --build
```

> Los valores por defecto son solo para ejecutar la prueba en local. En un entorno real se definen
> en el servidor o en el pipeline de despliegue.

## Ejecutar sin Docker (desarrollo)

Requisitos: [.NET SDK 10](https://dotnet.microsoft.com/download), [Node.js 24](https://nodejs.org/) y
[pnpm](https://pnpm.io/installation).

### 1. Backend (http://localhost:5269)

La configuración sensible se guarda con *user secrets* (solo una vez):

```bash
cd backend/src/Creditos.Api
dotnet user-secrets set "Jwt:Secret" "una-clave-local-de-al-menos-32-caracteres"
dotnet user-secrets set "DefaultUser:UserName" "admin"
dotnet user-secrets set "DefaultUser:Password" "Admin123*"
dotnet run
```

La base se crea en `data/creditos.db` en la raíz del repositorio. En desarrollo la documentación de
la API está en http://localhost:5269/scalar.

### 2. Frontend (http://localhost:5173)

```bash
cd frontend/creditos-web
pnpm install
pnpm dev
```

Vite reenvía las llamadas a `/api` al backend en `http://localhost:5269`.

Este entorno es independiente del de Docker: usa su propia base (`data/creditos.db`) y otros puertos.

## Uso

1. **Clientes**: registrar al cliente (información personal).
2. **Solicitudes de crédito → Nueva solicitud**: elegir al cliente, completar la información laboral y
   las condiciones del crédito. La cuota nivelada se calcula en vivo. No se aceptan clientes mayores de 80 años.
3. **Solicitudes de crédito → Evaluar**: el comité ve solo los datos requeridos y emite el dictamen
   con observaciones obligatorias. Al aprobar se crea el crédito (`CR-00000001`) y su plan de pagos.
4. **Créditos → Desembolsar**: elegir banco destino (LAFISE, FICOHSA, BAC Credomatic o Banpro) y número
   de cuenta. Solo se desembolsan créditos aprobados; el plan de pagos se reprograma desde la fecha del desembolso.

## Estructura

```
backend/
  src/Creditos.Domain/      Entidades y reglas de negocio (transiciones de estado, cuota nivelada, plan de pagos)
  src/Creditos.Api/         Endpoints por caso de uso (Features/<módulo>/), EF Core, autenticación
frontend/creditos-web/
  src/features/<módulo>/    api/ (consultas y mutaciones), components/, schemas.ts, types.ts
  src/routes/               Rutas de TanStack Router
docker-compose.yml          Levanta API y frontend
```
