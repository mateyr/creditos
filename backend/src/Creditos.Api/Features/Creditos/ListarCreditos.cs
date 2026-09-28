using Creditos.Api.Common.Endpoints;
using Creditos.Api.Common.Pagination;
using Creditos.Api.Database;
using Creditos.Domain.Creditos;
using Creditos.Domain.Solicitudes;

using FluentValidation;
using FluentValidation.Results;

using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace Creditos.Api.Features.Creditos;

public static class ListarCreditos
{
    public sealed record Request(int Page = 1, int PageSize = 10, string? Search = null);

    public sealed record Response(
        int Id,
        string NumeroCredito,
        int SolicitudId,
        string Cedula,
        string NombreCompleto,
        decimal Monto,
        decimal TasaInteresAnual,
        int CantidadCuotas,
        Periodicidad Periodicidad,
        decimal PlazoMeses,
        decimal CuotaNivelada,
        EstadoSolicitud Estado,
        DateTime FechaCreacion);

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
            app.MapGet("creditos", Handle)
                .WithTags(Tags.Creditos)
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

            IQueryable<Credito> query = context.Creditos.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                string patron = $"%{request.Search.Trim()}%";

                query = query.Where(c =>
                    EF.Functions.Like(c.NumeroCredito, patron) ||
                    EF.Functions.Like(c.Solicitud.Cliente.Cedula, patron) ||
                    EF.Functions.Like(c.Solicitud.Cliente.NombreCompleto, patron));
            }

            // Se cargan las entidades de la página para reutilizar el plazo calculado en el dominio.
            PagedResponse<Credito> page = await query
                .Include(c => c.Solicitud)
                    .ThenInclude(s => s.Cliente)
                .OrderByDescending(c => c.Id)
                .ToPagedResponseAsync(request.Page, request.PageSize, cancellationToken);

            return TypedResults.Ok(page.Map(c => new Response(
                c.Id,
                c.NumeroCredito,
                c.SolicitudId,
                c.Solicitud.Cliente.Cedula,
                c.Solicitud.Cliente.NombreCompleto,
                c.Solicitud.MontoSolicitado,
                c.Solicitud.TasaInteresAnual,
                c.Solicitud.CantidadCuotas,
                c.Solicitud.Periodicidad,
                c.Solicitud.PlazoMeses,
                c.Solicitud.CuotaNivelada,
                c.Solicitud.Estado,
                c.FechaCreacion)));
        }
    }
}
