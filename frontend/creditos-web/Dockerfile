FROM node:24-alpine AS build
WORKDIR /app

# Misma versión de pnpm que genera el pnpm-lock.yaml del repositorio.
RUN npm install --global pnpm@12.6.0

# Primero solo los manifiestos: la capa de dependencias se reutiliza si no cambian.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# Variante oficial de nginx que corre sin root (escucha en 8080 en lugar de 80).
FROM nginxinc/nginx-unprivileged:1.29-alpine AS final

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
