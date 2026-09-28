using Creditos.Api.Common.Endpoints;
using Creditos.Api.Database;
using Creditos.Domain.Clientes;

using FluentValidation;
using FluentValidation.Results;

using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Creditos.Api.Features.Clientes;

public static class CrearCliente
{
    public sealed record Request(
        string Cedula,
        string NombreCompleto,
        string CorreoElectronico,
        string Telefono,
        DateOnly FechaNacimiento);

    public sealed record Response(int Id);

    public sealed class Validator : AbstractValidator<Request>
    {
        public Validator(TimeProvider timeProvider)
        {
            DateOnly hoy = DateOnly.FromDateTime(timeProvider.GetLocalNow().DateTime);

            RuleFor(r => r.Cedula)
                .NotEmpty().WithMessage("La cédula es requerida.")
                .Matches(@"^\d{3}-\d{6}-\d{4}[A-Z]$").WithMessage("La cédula debe tener el formato 000-000000-0000A.");

            RuleFor(r => r.NombreCompleto).NotEmpty().MaximumLength(150).WithName("Nombre completo");
            RuleFor(r => r.CorreoElectronico).NotEmpty().EmailAddress().MaximumLength(150).WithName("Correo electrónico");
            RuleFor(r => r.Telefono).NotEmpty().MaximumLength(20).WithName("Teléfono");
            RuleFor(r => r.FechaNacimiento).LessThan(hoy).WithMessage("La fecha de nacimiento no es válida.");
        }
    }

    public sealed class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPost("clientes", Handle)
                .WithTags(Tags.Clientes)
                .RequireAuthorization();
        }

        private static async Task<Results<Created<Response>, ValidationProblem, Conflict<ProblemDetails>>> Handle(
            Request request,
            IValidator<Request> validator,
            CreditosContext context,
            CancellationToken cancellationToken)
        {
            ValidationResult validationResult = await validator.ValidateAsync(request, cancellationToken);

            if (!validationResult.IsValid)
            {
                return TypedResults.ValidationProblem(validationResult.ToDictionary());
            }

            if (await context.Clientes.AnyAsync(c => c.Cedula == request.Cedula, cancellationToken))
            {
                return TypedResults.Conflict(new ProblemDetails
                {
                    Title = "Cliente duplicado",
                    Detail = $"Ya existe un cliente con la cédula {request.Cedula}.",
                    Status = StatusCodes.Status409Conflict
                });
            }

            Cliente cliente = new()
            {
                Cedula = request.Cedula,
                NombreCompleto = request.NombreCompleto,
                CorreoElectronico = request.CorreoElectronico,
                Telefono = request.Telefono,
                FechaNacimiento = request.FechaNacimiento
            };

            context.Clientes.Add(cliente);

            await context.SaveChangesAsync(cancellationToken);

            return TypedResults.Created($"/api/clientes/{cliente.Id}", new Response(cliente.Id));
        }
    }
}
