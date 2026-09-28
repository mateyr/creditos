using Creditos.Api.Common.Endpoints;
using Creditos.Api.Common.Extensions;
using Creditos.Api.Database;
using Creditos.Domain.Creditos;

using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace Creditos.Api.Features.Creditos;

public static class ObtenerPlanPagos
{
    public sealed record Response(
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

    public sealed class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapGet("creditos/{id:int}/plan-pagos", Handle)
                .WithTags(Tags.Creditos)
                .RequireAuthorization();
        }

        private static async Task<Results<Ok<Response>, ProblemHttpResult>> Handle(
            int id,
            CreditosContext context,
            CancellationToken cancellationToken)
        {
            if (!await context.Creditos.AnyAsync(c => c.Id == id, cancellationToken))
            {
                return CreditoErrors.NoEncontrado(id).ToProblem();
            }

            List<CuotaResponse> cuotas = await context.CuotasPlanPago
                .AsNoTracking()
                .Where(c => c.CreditoId == id)
                .OrderBy(c => c.NumeroCuota)
                .Select(c => new CuotaResponse(
                    c.NumeroCuota, c.FechaVencimiento, c.Cuota, c.Capital, c.Interes, c.Saldo))
                .ToListAsync(cancellationToken);

            // Los totales se suman en memoria: SQLite no puede sumar columnas decimal en la consulta.
            return TypedResults.Ok(new Response(
                cuotas.Sum(c => c.Capital),
                cuotas.Sum(c => c.Interes),
                cuotas.Sum(c => c.Cuota),
                cuotas));
        }
    }
}
