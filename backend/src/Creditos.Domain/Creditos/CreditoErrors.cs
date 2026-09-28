using Creditos.Domain.Shared;
using Creditos.Domain.Solicitudes;

namespace Creditos.Domain.Creditos;

public static class CreditoErrors
{
    public static Error NoEncontrado(int id) =>
        Error.NotFound("Creditos.NoEncontrado", $"No existe un crédito con el id {id}.");

    public static Error NoAprobado(EstadoSolicitud estado) =>
        Error.Conflict(
            "Creditos.NoAprobado",
            estado == EstadoSolicitud.Desembolsada
                ? "El crédito ya fue desembolsado."
                : $"Solo se pueden desembolsar créditos aprobados; la solicitud está {estado.ToString().ToLowerInvariant()}.");
}
