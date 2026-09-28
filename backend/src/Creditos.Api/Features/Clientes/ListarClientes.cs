using Creditos.Api.Common.Endpoints;
using Creditos.Api.Common.Pagination;
using Creditos.Api.Database;
using Creditos.Api.Features.Clientes.Shared;
using Creditos.Domain.Clientes;

using FluentValidation;
using FluentValidation.Results;

using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace Creditos.Api.Features.Clientes;

public static class ListarClientes
{
    public sealed record Request(int Page = 1, int PageSize = 10, string? Search = null);

    public sealed class Validator : AbstractValidator<Request>
    {
        public Validator()
        {
            RuleFor(r => r.Page).GreaterThanOrEqualTo(1).WithName("Página");
            RuleFor(r => r.PageSize).InclusiveBetween(1, 100).WithName("Tamaño de página");
            RuleFor(r => r.Search).MaximumLength(150).WithName("Búsqueda");
        }
    }

    public sealed class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapGet("clientes", Handle)
                .WithTags(Tags.Clientes)
                .RequireAuthorization();
        }

        private static async Task<Results<Ok<PagedResponse<ClienteResponse>>, ValidationProblem>> Handle(
            [AsParameters] Request request,
            IValidator<Request> validator,
            CreditosContext context,
            TimeProvider timeProvider,
            CancellationToken cancellationToken)
        {
            ValidationResult validationResult = await validator.ValidateAsync(request, cancellationToken);

            if (!validationResult.IsValid)
            {
                return TypedResults.ValidationProblem(validationResult.ToDictionary());
            }

            IQueryable<Cliente> query = context.Clientes.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                // LIKE en SQLite no distingue mayúsculas de minúsculas (en caracteres ASCII).
                string patron = $"%{request.Search.Trim()}%";

                query = query.Where(c =>
                    EF.Functions.Like(c.Cedula, patron) ||
                    EF.Functions.Like(c.NombreCompleto, patron) ||
                    EF.Functions.Like(c.CorreoElectronico, patron) ||
                    EF.Functions.Like(c.Telefono, patron));
            }

            PagedResponse<Cliente> page = await query
                .OrderBy(c => c.NombreCompleto)
                .ThenBy(c => c.Id)
                .ToPagedResponseAsync(request.Page, request.PageSize, cancellationToken);

            DateOnly hoy = DateOnly.FromDateTime(timeProvider.GetLocalNow().DateTime);

            return TypedResults.Ok(page.Map(c => ClienteResponse.FromEntity(c, hoy)));
        }
    }
}
