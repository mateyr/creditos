using Creditos.Api.Common.Endpoints;
using Creditos.Api.Common.Extensions;
using Creditos.Api.Database;
using Creditos.Domain.Shared;
using Creditos.Domain.Solicitudes;

using FluentValidation;
using FluentValidation.Results;

using Microsoft.AspNetCore.Http.HttpResults;

namespace Creditos.Api.Features.Solicitudes;

public static class RechazarSolicitud
{
    public sealed record Request(string Observaciones);

    public sealed class Validator : AbstractValidator<Request>
    {
        public Validator()
        {
            RuleFor(r => r.Observaciones)
                .NotEmpty().WithMessage("Las observaciones son requeridas: indica el motivo del rechazo.")
                .MaximumLength(500).WithName("Observaciones");
        }
    }

    public sealed class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPost("solicitudes/{id:int}/rechazar", Handle)
                .WithTags(Tags.Solicitudes)
                .RequireAuthorization();
        }

        private static async Task<Results<NoContent, ValidationProblem, ProblemHttpResult>> Handle(
            int id,
            Request request,
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

            SolicitudCredito? solicitud = await context.Solicitudes.FindAsync([id], cancellationToken);

            if (solicitud is null)
            {
                return SolicitudErrors.NoEncontrada(id).ToProblem();
            }

            Result resultado = solicitud.Rechazar(request.Observaciones, timeProvider.GetUtcNow().UtcDateTime);

            if (resultado.IsFailure)
            {
                return resultado.Error!.ToProblem();
            }

            await context.SaveChangesAsync(cancellationToken);

            return TypedResults.NoContent();
        }
    }
}
