# Decisiones de arquitectura y uso de IA

## 1. Organización del repositorio

Backend y frontend viven en **un solo repositorio**:

- Un solo `docker-compose.yml` en la raíz levanta toda la solución con un comando.
- Un cambio de contrato (endpoint + pantalla que lo usa) se revisa y se versiona en el mismo commit.
- Una sola entrega: un README, un historial y un Pull Request.

Cada proyecto conserva su propia herramienta y su propio `Dockerfile`, así que se construyen y
despliegan de forma independiente.

```
backend/
  src/Creditos.Domain/   Entidades y reglas de negocio, sin dependencias de infraestructura
  src/Creditos.Api/      Endpoints, EF Core, autenticación
frontend/creditos-web/   SPA en React
docker-compose.yml
```

## 2. Backend (ASP.NET Core, .NET 10)

### Estructura: vertical slices

- Un archivo por caso de uso en `Features/<Módulo>/` (`CrearCliente.cs`, `AprobarSolicitud.cs`...),
  con su `Request`, `Validator`, `Response` y `Endpoint` juntos.
- Si un caso de uso supera ~150 líneas o necesita varios archivos, se convierte en carpeta.
- Lo compartido dentro de un módulo va en `Features/<Módulo>/Shared/`; lo compartido por toda la API,
  en `Common/` (paginación, manejo de errores).
- Los endpoints se registran automáticamente mediante la interfaz `IEndpoint`.

### Reglas de negocio en el dominio

Las reglas viven en `Creditos.Domain` y no en los endpoints:

- `SolicitudCredito.Estado` tiene *setter* privado: solo cambia con `Aprobar()`, `Rechazar()` y
  `Desembolsar()`, que validan el estado actual. Es imposible, por ejemplo, desembolsar un crédito no
  aprobado desde cualquier parte del código.
- Las reglas devuelven un `Result` con errores tipados (`Validation`, `NotFound`, `Conflict`) en lugar
  de lanzar excepciones; la API los convierte en `ProblemDetails` con el código HTTP correspondiente.
- Los cálculos son funciones puras que se pueden probar de forma aislada: `CalculadoraEdad`,
  `CalculadoraCuotaNivelada`, `GeneradorPlanPagos`.
- FluentValidation valida la forma de la petición en el borde; el dominio protege las invariantes.

| Regla | Dónde se aplica |
|---|---|
| No se aceptan solicitudes de clientes mayores de 80 años | `CrearSolicitud` |
| Solo se dictaminan solicitudes pendientes | `SolicitudCredito.Aprobar/Rechazar` |
| Observaciones obligatorias en el dictamen | Validador + dominio |
| Solo se desembolsan créditos aprobados | `SolicitudCredito.Desembolsar` |
| Una solicitud genera como máximo un crédito | Índice único en `Creditos.SolicitudId` |

### Transaccionalidad (ACID)

- **Aprobación**: el cambio de estado, la creación del crédito, su número y todas las cuotas del plan se
  guardan en una **transacción explícita**. Si algo falla, no queda nada a medias.
- **Desembolso**: el cambio de estado, los datos de la transferencia y la reprogramación del plan se
  confirman en un único `SaveChanges`, que EF Core ejecuta en una transacción.
- **Concurrencia optimista**: `Estado` es token de concurrencia (`UPDATE ... WHERE Estado = <leído>`).
  Si dos usuarios aprueban o desembolsan lo mismo a la vez, el segundo recibe `409` en lugar de repetir
  la operación. Se eligió el enfoque optimista porque SQLite no tiene bloqueo por fila
  (`SELECT ... FOR UPDATE`) y los conflictos son excepcionales.

### Otras decisiones

- **Número de crédito**: `Id` entero interno + `NumeroCredito` de negocio (`CR-00000001`), derivado del
  `Id` dentro de la misma transacción. Legible e incremental; no se usó UUID porque un número de crédito
  se lee, se imprime y se dicta.
- **Plan de pagos**: cuota nivelada (sistema francés) con capital, interés y saldo por cuota. La última
  cuota absorbe los centavos de redondeo para que el saldo termine en 0.
- **Autenticación**: ASP.NET Core Identity (usuarios, contraseñas con hash, bloqueo por intentos) y JWT
  firmado con HMAC-SHA256, con vida corta (15 minutos).
- **Refresh token** (7 días) en una **cookie `httpOnly`**, `Secure` y `SameSite=Strict`, limitada a
  `/api/auth`: JavaScript no puede leerla (protege contra XSS) y otro sitio no puede enviarla (protege
  contra CSRF). Tiene **rotación**: cada renovación revoca el token usado y entrega uno nuevo; si se
  presenta un token ya rotado, se interpreta como robo y se revocan todas las sesiones del usuario. En la
  base se guarda solo el hash SHA-256, y cerrar sesión lo revoca y borra la cookie.
- En el frontend, el access token vive **solo en memoria**. Al recargar la página, la sesión se recupera
  con la cookie; y el token se renueva automáticamente antes de que venza o ante un `401`, con una sola
  renovación compartida entre peticiones simultáneas.
- **Persistencia**: EF Core + SQLite con migraciones aplicadas al iniciar, restricciones `CHECK` para los
  enums y fechas guardadas y devueltas en UTC.
- **Listas**: paginación y búsqueda en el servidor (`PagedResponse<T>`).

## 3. Frontend (React + Vite)

### Stack

- **TanStack Router**: rutas por archivos; página, filtros y búsqueda viven en la URL (validados con zod),
  así que se pueden compartir y el botón atrás funciona.
- **TanStack Query**: caché de datos; los `loader` precargan la página antes de mostrarla.
- **TanStack Form + zod**: mismas reglas de validación que el backend.
- **TanStack Table v9** y **shadcn/ui** (Base UI + Tailwind CSS) para la interfaz.
- **axios** encapsulado en `lib/api-client.ts`: agrega el token y, ante un `401`, cierra la sesión.

### Estructura por features

```
src/features/<módulo>/
  api/          una consulta o mutación por archivo (p. ej. crear-solicitud.ts con useCrearSolicitud)
  components/
  schemas.ts    esquemas zod de los formularios
  types.ts
```

- Los componentes no llaman a `useMutation` directamente: usan el hook de la feature, que se encarga de
  invalidar la caché. El componente solo agrega lo de la interfaz (avisos, navegación).
  y que un componente cargue módulos que no usa.
- Las dependencias entre features van en un solo sentido: `creditos → solicitudes → clientes`.

### Interfaz

- La cuota nivelada se calcula **en vivo** en el formulario de solicitud (misma fórmula que el backend,
  que la vuelve a calcular al guardar y es la fuente de verdad).
- Las pantallas de comité y desembolso muestran **solo** los datos que pide el enunciado.
- Las acciones irreversibles (aprobar, rechazar, desembolsar) piden confirmación; el número de cuenta se
  escribe dos veces.

## 4. Docker

- **API**: build multi-etapa (`sdk` → `aspnet`) y ejecución con el usuario sin privilegios `app`.
- **Frontend**: build con pnpm y servido por `nginx-unprivileged`. nginx también reenvía `/api` al
  backend: el navegador ve un solo origen, así que no hace falta CORS.
- **SQLite** persistido en el volumen `creditos-data`.
- **Configuración** por variables de entorno de ASP.NET Core con valores locales por defecto
  (`${VAR:-valor}`): basta con `docker compose up --build`, y en un entorno real se reemplazan sin tocar
  el archivo.

## 5. Supuestos

Decisiones tomadas donde el enunciado no es explícito:

- **Plazo**: se muestra en meses (`cuotas × 12 / periodos por año`; 24 cuotas quincenales = 12 meses).
- **Observaciones al rechazar**: también son obligatorias, para que el motivo del rechazo quede registrado.
- **Fechas del plan**: el plan se genera al aprobar, pero sus vencimientos se reprograman desde la fecha
  del desembolso, que es cuando empiezan a correr los intereses.
- **Plan de pagos en pantalla**: se muestra una vez desembolsado el crédito, para mantener "limpia" la
  pantalla de desembolso.
- **Número de cuenta**: solo dígitos, entre 8 y 20.
- **Moneda**: córdobas (C$), por los bancos del enunciado.

## 6. Uso de IA

### Herramientas

- **Claude Code** (CLI) con el modelo predeterminado, **Claude Opus 5.5** (`claude-opus-5-5`).
- **Servidores MCP** del proyecto (`.mcp.json`):
  - `shadcn`: catálogo y registro de componentes de shadcn/ui.
  - `inkeepMcp`: documentación actualizada de Zod v4.
- **Skills**:
  - Plugins oficiales de [`dotnet/skills`](https://github.com/dotnet/skills):
    - `dotnet-aspnetcore`: `dotnet-webapi`, `minimal-api-file-upload`, `configuring-opentelemetry-dotnet`,
      `convert-blazor-server-to-webapp`.
    - `dotnet-data`: `create-datadriven-aspnetcore`, `optimizing-ef-core-queries`.
  - Skills incluidas en los paquetes de TanStack (`@tanstack/react-table`, `@tanstack/table-core`,
    `@tanstack/router-plugin`), usadas para seguir la API de TanStack Table v9.

### Forma de trabajo

1. **La base de cada proyecto la armé yo**, verificando contra la documentación oficial actualizada:
   estructura de la solución, EF Core + SQLite y migraciones, Identity + JWT en el backend; Vite,
   TanStack Router, shadcn/ui y la estructura de carpetas en el frontend.
2. **Implementé funcionalidades de ejemplo en el backend** (inicio de sesión, registro de clientes y
   creación de solicitudes) que fijaron las convenciones del proyecto.
3. **Pedí al modelo las siguientes funcionalidades basándose en esos ejemplos**: login y protección de
   rutas en el frontend, CRUD y paginación de clientes, comité de riesgo, plan de pagos, desembolso,
   las pantallas correspondientes y Docker. Para cada
   una, primero se discutía el diseño y después se implementaba.
4. **Verificación**: el modelo probó cada endpoint contra la API y la base reales (incluidos los casos de
   error y la concurrencia) y el entorno Docker desde un clon limpio; yo probé la interfaz manualmente.

### Revisión del código generado

Todo el código generado por la IA se revisó antes de cada commit; los commits los hice yo. Correcciones
que surgieron de esa revisión:

- Estructura del backend: un archivo por caso de uso y lo compartido en `Shared/`, en lugar de archivos
  sueltos.
- Nombres técnicos en inglés (`Page`, `PageSize`) y de negocio en español.
- Separar solicitudes y créditos: un cliente puede tener varios créditos, así que el crédito tiene su
  propia lista y pantalla.
- Reorganizar el frontend por features y mover las mutaciones a hooks de TanStack Query.
- Quitar los barrel files que había introducido el modelo, por el riesgo de dependencias circulares.
- Contenedores sin usuario root y configuración sin archivo `.env`.
- Mejoras de interfaz: confirmación en acciones irreversibles, espaciado y tablas sin scroll horizontal.
