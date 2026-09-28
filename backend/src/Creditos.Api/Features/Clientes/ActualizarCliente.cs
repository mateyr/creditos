using Creditos.Api.Common.Endpoints;
using Creditos.Api.Database;
using Creditos.Api.Features.Clientes.Shared;
using Creditos.Domain.Clientes;

using FluentValidation;
using FluentValidation.Results;

using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace Creditos.Api.Features.Clientes;

public static class ActualizarCliente
{
    public sealed class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPut("clientes/{id:int}", Handle)
                .WithTags(Tags.Clientes)
                .RequireAuthorization();
        }

        private static async Task<Results<NoContent, ValidationProblem, ProblemHttpResult>> Handle(
            int id,
            ClienteRequest request,
            IValidator<ClienteRequest> validator,
            CreditosContext context,
            CancellationToken cancellationToken)
        {
            ValidationResult validationResult = await validator.ValidateAsync(request, cancellationToken);

            if (!validationResult.IsValid)
            {
                return TypedResults.ValidationProblem(validationResult.ToDictionary());
            }

            Cliente? cliente = await context.Clientes.FindAsync([id], cancellationToken);

            if (cliente is null)
            {
                return ClienteErrors.NoEncontrado(id);
            }

            if (await context.Clientes.AnyAsync(c => c.Cedula == request.Cedula && c.Id != id, cancellationToken))
            {
                return ClienteErrors.CedulaDuplicada(request.Cedula);
            }

            cliente.Cedula = request.Cedula;
            cliente.NombreCompleto = request.NombreCompleto;
            cliente.CorreoElectronico = request.CorreoElectronico;
            cliente.Telefono = request.Telefono;
            cliente.FechaNacimiento = request.FechaNacimiento;

            await context.SaveChangesAsync(cancellationToken);

            return TypedResults.NoContent();
        }
    }
}
