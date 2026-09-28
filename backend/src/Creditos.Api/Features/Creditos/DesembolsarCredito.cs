using Creditos.Api.Common.Endpoints;
using Creditos.Api.Common.Extensions;
using Creditos.Api.Database;
using Creditos.Domain.Creditos;
using Creditos.Domain.Shared;

using FluentValidation;
using FluentValidation.Results;

using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace Creditos.Api.Features.Creditos;

public static class DesembolsarCredito
{
    public sealed record Request(Banco Banco, string NumeroCuenta);

    public sealed class Validator : AbstractValidator<Request>
    {
        public Validator()
        {
            RuleFor(r => r.Banco).IsInEnum().WithMessage("Selecciona un banco destino válido.");

            RuleFor(r => r.NumeroCuenta)
                .NotEmpty().WithMessage("El número de cuenta es requerido.")
                .Matches(@"^\d{8,20}$").WithMessage("El número de cuenta debe tener entre 8 y 20 dígitos, sin espacios ni guiones.");
        }
    }

    public sealed class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPost("creditos/{id:int}/desembolsar", Handle)
                .WithTags(Tags.Creditos)
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

            // El plan se carga porque el desembolso reprograma sus vencimientos.
            Credito? credito = await context.Creditos
                .Include(c => c.Solicitud)
                .Include(c => c.PlanPagos)
                .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

            if (credito is null)
            {
                return CreditoErrors.NoEncontrado(id).ToProblem();
            }

            Result resultado = credito.Solicitud.Desembolsar(
                request.Banco, request.NumeroCuenta, timeProvider.GetUtcNow().UtcDateTime);

            if (resultado.IsFailure)
            {
                return resultado.Error!.ToProblem();
            }

            // Un solo SaveChanges: estado, transferencia y fechas del plan se confirman juntos.
            await context.SaveChangesAsync(cancellationToken);

            return TypedResults.NoContent();
        }
    }
}
