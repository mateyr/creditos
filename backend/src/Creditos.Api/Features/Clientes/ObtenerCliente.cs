using Creditos.Api.Common.Endpoints;
using Creditos.Api.Database;
using Creditos.Api.Features.Clientes.Shared;
using Creditos.Domain.Clientes;

using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace Creditos.Api.Features.Clientes;

public static class ObtenerCliente
{
    public sealed class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapGet("clientes/{id:int}", Handle)
                .WithTags(Tags.Clientes)
                .RequireAuthorization();
        }

        private static async Task<Results<Ok<ClienteResponse>, ProblemHttpResult>> Handle(
            int id,
            CreditosContext context,
            TimeProvider timeProvider,
            CancellationToken cancellationToken)
        {
            Cliente? cliente = await context.Clientes
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

            if (cliente is null)
            {
                return ClienteErrors.NoEncontrado(id);
            }

            DateOnly hoy = DateOnly.FromDateTime(timeProvider.GetLocalNow().DateTime);

            return TypedResults.Ok(ClienteResponse.FromEntity(cliente, hoy));
        }
    }
}
