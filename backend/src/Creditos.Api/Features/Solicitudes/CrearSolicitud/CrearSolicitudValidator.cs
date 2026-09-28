using FluentValidation;

namespace Creditos.Api.Features.Solicitudes.CrearSolicitud;

public sealed class CrearSolicitudValidator : AbstractValidator<CrearSolicitudRequest>
{
    public CrearSolicitudValidator()
    {
        RuleFor(r => r.ClienteId).GreaterThan(0).WithMessage("El cliente es requerido.");

        // Información laboral
        RuleFor(r => r.TipoEmpleo).IsInEnum().WithMessage("El tipo de empleo no es válido.");
        RuleFor(r => r.LugarTrabajo).NotEmpty().MaximumLength(150).WithName("Lugar de trabajo");
        RuleFor(r => r.AntiguedadLaboral).GreaterThanOrEqualTo(0).WithName("Antigüedad laboral");
        RuleFor(r => r.IngresoMensual).GreaterThan(0).WithName("Ingreso mensual");

        // Condiciones del crédito
        RuleFor(r => r.MontoSolicitado).GreaterThan(0).WithName("Monto solicitado");
        RuleFor(r => r.CantidadCuotas).InclusiveBetween(1, 360).WithName("Cantidad de cuotas");
        RuleFor(r => r.TasaInteresAnual).GreaterThan(0).LessThanOrEqualTo(100).WithName("Tasa de interés anual");
        RuleFor(r => r.Periodicidad).IsInEnum().WithMessage("La periodicidad no es válida.");
    }
}
