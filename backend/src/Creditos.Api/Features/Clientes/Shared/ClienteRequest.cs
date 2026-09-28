using FluentValidation;

namespace Creditos.Api.Features.Clientes.Shared;

/// <summary>Datos del cliente que se capturan al crearlo y al actualizarlo.</summary>
public sealed record ClienteRequest(
    string Cedula,
    string NombreCompleto,
    string CorreoElectronico,
    string Telefono,
    DateOnly FechaNacimiento);

public sealed class ClienteRequestValidator : AbstractValidator<ClienteRequest>
{
    public ClienteRequestValidator(TimeProvider timeProvider)
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
