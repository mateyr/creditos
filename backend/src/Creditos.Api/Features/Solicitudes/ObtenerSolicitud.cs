using Creditos.Api.Common.Endpoints;
using Creditos.Api.Common.Extensions;
using Creditos.Api.Database;
using Creditos.Domain.Clientes;
using Creditos.Domain.Solicitudes;

using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace Creditos.Api.Features.Solicitudes;

public static class ObtenerSolicitud
{
    public sealed record Response(
        int Id,
        // Información personal
        int ClienteId,
        string Cedula,
        string NombreCompleto,
        int Edad,
        // Información laboral
        TipoEmpleo TipoEmpleo,
        string LugarTrabajo,
        int AntiguedadLaboral,
        decimal IngresoMensual,
        // Condiciones del crédito
        decimal MontoSolicitado,
        int CantidadCuotas,
        decimal TasaInteresAnual,
        Periodicidad Periodicidad,
        decimal PlazoMeses,
        decimal CuotaNivelada,
        // Dictamen
        EstadoSolicitud Estado,
        string? Observaciones,
        DateTime FechaCreacion,
        DateTime? FechaDictamen,
        int? CreditoId,
        string? NumeroCredito);

    public sealed class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapGet("solicitudes/{id:int}", Handle)
                .WithTags(Tags.Solicitudes)
                .RequireAuthorization();
        }

        private static async Task<Results<Ok<Response>, ProblemHttpResult>> Handle(
            int id,
            CreditosContext context,
            TimeProvider timeProvider,
            CancellationToken cancellationToken)
        {
            SolicitudCredito? solicitud = await context.Solicitudes
                .AsNoTracking()
                .Include(s => s.Cliente)
                .Include(s => s.Credito)
                .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);

            if (solicitud is null)
            {
                return SolicitudErrors.NoEncontrada(id).ToProblem();
            }

            DateOnly hoy = DateOnly.FromDateTime(timeProvider.GetLocalNow().DateTime);

            return TypedResults.Ok(new Response(
                solicitud.Id,
                solicitud.ClienteId,
                solicitud.Cliente.Cedula,
                solicitud.Cliente.NombreCompleto,
                CalculadoraEdad.Calcular(solicitud.Cliente.FechaNacimiento, hoy),
                solicitud.TipoEmpleo,
                solicitud.LugarTrabajo,
                solicitud.AntiguedadLaboral,
                solicitud.IngresoMensual,
                solicitud.MontoSolicitado,
                solicitud.CantidadCuotas,
                solicitud.TasaInteresAnual,
                solicitud.Periodicidad,
                solicitud.PlazoMeses,
                solicitud.CuotaNivelada,
                solicitud.Estado,
                solicitud.Observaciones,
                solicitud.FechaCreacion,
                solicitud.FechaDictamen,
                solicitud.Credito?.Id,
                solicitud.Credito?.NumeroCredito));
        }
    }
}
