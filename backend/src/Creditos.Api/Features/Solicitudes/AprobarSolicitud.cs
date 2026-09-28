using Creditos.Api.Common.Endpoints;
using Creditos.Api.Common.Extensions;
using Creditos.Api.Database;
using Creditos.Domain.Creditos;
using Creditos.Domain.Shared;
using Creditos.Domain.Solicitudes;

using FluentValidation;
using FluentValidation.Results;

using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore.Storage;

namespace Creditos.Api.Features.Solicitudes;

public static class AprobarSolicitud
{
    public sealed record Request(string Observaciones);

    public sealed record Response(int CreditoId, string NumeroCredito, int CantidadCuotas);

    public sealed class Validator : AbstractValidator<Request>
    {
        public Validator()
        {
            RuleFor(r => r.Observaciones)
                .NotEmpty().WithMessage("Las observaciones son requeridas para aprobar la solicitud.")
                .MaximumLength(500).WithName("Observaciones");
        }
    }

    public sealed class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPost("solicitudes/{id:int}/aprobar", Handle)
                .WithTags(Tags.Solicitudes)
                .RequireAuthorization();
        }

        private static async Task<Results<Ok<Response>, ValidationProblem, ProblemHttpResult>> Handle(
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

            Result<Credito> resultado = solicitud.Aprobar(request.Observaciones, timeProvider.GetUtcNow().UtcDateTime);

            if (resultado.IsFailure)
            {
                return resultado.Error!.ToProblem();
            }

            Credito credito = resultado.Value;

            // El cambio de estado, el crédito y sus cuotas se confirman juntos o no se guarda nada.
            // Se necesitan dos SaveChanges porque el número del crédito se deriva del Id generado.
            await using IDbContextTransaction transaction =
                await context.Database.BeginTransactionAsync(cancellationToken);

            context.Creditos.Add(credito);
            await context.SaveChangesAsync(cancellationToken);

            credito.AsignarNumero();
            await context.SaveChangesAsync(cancellationToken);

            await transaction.CommitAsync(cancellationToken);

            return TypedResults.Ok(new Response(credito.Id, credito.NumeroCredito, credito.PlanPagos.Count));
        }
    }
}
