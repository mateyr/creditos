# Contexto de build: la carpeta backend/ (incluye Directory.*.props y los dos proyectos).

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Primero solo los archivos de proyecto: la capa del restore se reutiliza mientras
# no cambien las dependencias, aunque cambie el código.
COPY Directory.Build.props Directory.Packages.props ./
COPY src/Creditos.Domain/Creditos.Domain.csproj src/Creditos.Domain/
COPY src/Creditos.Api/Creditos.Api.csproj src/Creditos.Api/
RUN dotnet restore src/Creditos.Api/Creditos.Api.csproj

COPY src/ src/
RUN dotnet publish src/Creditos.Api/Creditos.Api.csproj \
    --configuration Release \
    --no-restore \
    --output /app/publish \
    /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

# Carpeta de la base SQLite (volumen en docker-compose). Pertenece al usuario sin
# privilegios "app": Docker copia este dueño al volumen la primera vez que lo crea.
RUN mkdir -p /app/data && chown $APP_UID:$APP_UID /app/data

COPY --from=build /app/publish .

# La API no corre como root.
USER $APP_UID

EXPOSE 8080
ENTRYPOINT ["dotnet", "Creditos.Api.dll"]
