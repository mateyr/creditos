using Creditos.Api.Common.Endpoints;
using Creditos.Api.Common.Extensions;
using Creditos.Api.Database;
using Creditos.Domain.Creditos;
using Creditos.Domain.Solicitudes;

using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace Creditos.Api.Features.Creditos;

public static class ObtenerCredito
{
    public sealed record Response(
        int Id,
        string NumeroCredito,
        int SolicitudId,
        // Datos que muestra la pantalla de desembolso
        string Cedula,
        string NombreCompleto,
        decimal Monto,
        decimal TasaInteresAnual,
        Periodicidad Periodicidad,
        decimal PlazoMeses,
        int CantidadCuotas,
        decimal CuotaNivelada,
        EstadoSolicitud Estado,
        DateTime FechaCreacion,
        // Transferencia (solo si ya se desembolsó)
        Banco? Banco,
        string? NumeroCuenta,
        DateTime? FechaDesembolso);

    public sealed class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapGet("creditos/{id:int}", Handle)
                .WithTags(Tags.Creditos)
                .RequireAuthorization();
        }

        private static async Task<Results<Ok<Response>, ProblemHttpResult>> Handle(
            int id,
            CreditosContext context,
            CancellationToken cancellationToken)
        {
            Credito? credito = await context.Creditos
                .AsNoTracking()
                .Include(c => c.Solicitud)
                    .ThenInclude(s => s.Cliente)
                .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

            if (credito is null)
            {
                return CreditoErrors.NoEncontrado(id).ToProblem();
            }

            SolicitudCredito solicitud = credito.Solicitud;

            return TypedResults.Ok(new Response(
                credito.Id,
                credito.NumeroCredito,
                credito.SolicitudId,
                solicitud.Cliente.Cedula,
                solicitud.Cliente.NombreCompleto,
                solicitud.MontoSolicitado,
                solicitud.TasaInteresAnual,
                solicitud.Periodicidad,
                solicitud.PlazoMeses,
                solicitud.CantidadCuotas,
                solicitud.CuotaNivelada,
                solicitud.Estado,
                credito.FechaCreacion,
                credito.Banco,
                credito.NumeroCuenta,
                credito.FechaDesembolso));
        }
    }
}
