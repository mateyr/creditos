using Creditos.Api.Common.Endpoints;
using Creditos.Api.Common.Pagination;
using Creditos.Api.Database;
using Creditos.Domain.Solicitudes;

using FluentValidation;
using FluentValidation.Results;

using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace Creditos.Api.Features.Solicitudes;

public static class ListarSolicitudes
{
    public sealed record Request(
        int Page = 1,
        int PageSize = 10,
        string? Search = null,
        EstadoSolicitud? Estado = null);

    public sealed record Response(
        int Id,
        string Cedula,
        string NombreCompleto,
        decimal MontoSolicitado,
        int CantidadCuotas,
        Periodicidad Periodicidad,
        decimal CuotaNivelada,
        EstadoSolicitud Estado,
        DateTime FechaCreacion,
        string? NumeroCredito);

    public sealed class Validator : AbstractValidator<Request>
    {
        public Validator()
        {
            RuleFor(r => r.Page).GreaterThanOrEqualTo(1).WithName("Página");
            RuleFor(r => r.PageSize).InclusiveBetween(1, 100).WithName("Tamaño de página");
            RuleFor(r => r.Search).MaximumLength(150).WithName("Búsqueda");
            RuleFor(r => r.Estado).IsInEnum().WithMessage("El estado no es válido.");
        }
    }

    public sealed class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapGet("solicitudes", Handle)
                .WithTags(Tags.Solicitudes)
                .RequireAuthorization();
        }

        private static async Task<Results<Ok<PagedResponse<Response>>, ValidationProblem>> Handle(
            [AsParameters] Request request,
            IValidator<Request> validator,
            CreditosContext context,
            CancellationToken cancellationToken)
        {
            ValidationResult validationResult = await validator.ValidateAsync(request, cancellationToken);

            if (!validationResult.IsValid)
            {
                return TypedResults.ValidationProblem(validationResult.ToDictionary());
            }

            IQueryable<SolicitudCredito> query = context.Solicitudes.AsNoTracking();

            if (request.Estado is not null)
            {
                query = query.Where(s => s.Estado == request.Estado);
            }

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                string patron = $"%{request.Search.Trim()}%";

                query = query.Where(s =>
                    EF.Functions.Like(s.Cliente.Cedula, patron) ||
                    EF.Functions.Like(s.Cliente.NombreCompleto, patron));
            }

            PagedResponse<Response> page = await query
                .OrderByDescending(s => s.FechaCreacion)
                .ThenByDescending(s => s.Id)
                .Select(s => new Response(
                    s.Id,
                    s.Cliente.Cedula,
                    s.Cliente.NombreCompleto,
                    s.MontoSolicitado,
                    s.CantidadCuotas,
                    s.Periodicidad,
                    s.CuotaNivelada,
                    s.Estado,
                    s.FechaCreacion,
                    s.Credito != null ? s.Credito.NumeroCredito : null))
                .ToPagedResponseAsync(request.Page, request.PageSize, cancellationToken);

            return TypedResults.Ok(page);
        }
    }
}
