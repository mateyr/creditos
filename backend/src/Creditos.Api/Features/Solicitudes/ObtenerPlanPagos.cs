using Creditos.Api.Common.Endpoints;
using Creditos.Api.Common.Extensions;
using Creditos.Api.Database;
using Creditos.Domain.Solicitudes;

using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace Creditos.Api.Features.Solicitudes;

public static class ObtenerPlanPagos
{
    public sealed record Response(
        string NumeroCredito,
        DateTime FechaCreacion,
        decimal TotalCapital,
        decimal TotalIntereses,
        decimal TotalPagar,
        List<CuotaResponse> Cuotas);

    public sealed record CuotaResponse(
        int NumeroCuota,
        DateOnly FechaVencimiento,
        decimal Cuota,
        decimal Capital,
        decimal Interes,
        decimal Saldo);

    private sealed record CreditoConPlan(string NumeroCredito, DateTime FechaCreacion, List<CuotaResponse> Cuotas);

    public sealed class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapGet("solicitudes/{id:int}/plan-pagos", Handle)
                .WithTags(Tags.Solicitudes)
                .RequireAuthorization();
        }

        private static async Task<Results<Ok<Response>, ProblemHttpResult>> Handle(
            int id,
            CreditosContext context,
            CancellationToken cancellationToken)
        {
            if (!await context.Solicitudes.AnyAsync(s => s.Id == id, cancellationToken))
            {
                return SolicitudErrors.NoEncontrada(id).ToProblem();
            }

            CreditoConPlan? credito = await context.Creditos
                .AsNoTracking()
                .Where(c => c.SolicitudId == id)
                .Select(c => new CreditoConPlan(
                    c.NumeroCredito,
                    c.FechaCreacion,
                    c.PlanPagos
                        .OrderBy(p => p.NumeroCuota)
                        .Select(p => new CuotaResponse(
                            p.NumeroCuota, p.FechaVencimiento, p.Cuota, p.Capital, p.Interes, p.Saldo))
                        .ToList()))
                .FirstOrDefaultAsync(cancellationToken);

            if (credito is null)
            {
                return SolicitudErrors.SinCredito(id).ToProblem();
            }

            // Los totales se suman en memoria: SQLite no puede sumar columnas decimal en la consulta.
            return TypedResults.Ok(new Response(
                credito.NumeroCredito,
                credito.FechaCreacion,
                credito.Cuotas.Sum(c => c.Capital),
                credito.Cuotas.Sum(c => c.Interes),
                credito.Cuotas.Sum(c => c.Cuota),
                credito.Cuotas));
        }
    }
}
