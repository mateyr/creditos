using Creditos.Api.Common.Endpoints;
using Creditos.Api.Database;
using Creditos.Api.Features.Clientes.Shared;
using Creditos.Domain.Clientes;

using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace Creditos.Api.Features.Clientes;

public static class EliminarCliente
{
    public sealed class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapDelete("clientes/{id:int}", Handle)
                .WithTags(Tags.Clientes)
                .RequireAuthorization();
        }

        private static async Task<Results<NoContent, ProblemHttpResult>> Handle(
            int id,
            CreditosContext context,
            CancellationToken cancellationToken)
        {
            Cliente? cliente = await context.Clientes.FindAsync([id], cancellationToken);

            if (cliente is null)
            {
                return ClienteErrors.NoEncontrado(id);
            }

            // Un cliente con solicitudes forma parte de un expediente de crédito y no se puede borrar.
            if (await context.Solicitudes.AnyAsync(s => s.ClienteId == id, cancellationToken))
            {
                return ClienteErrors.TieneSolicitudes();
            }

            context.Clientes.Remove(cliente);

            await context.SaveChangesAsync(cancellationToken);

            return TypedResults.NoContent();
        }
    }
}
