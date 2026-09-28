using Creditos.Domain.Shared;

namespace Creditos.Domain.Solicitudes;

public static class SolicitudErrors
{
    public static Error NoEncontrada(int id) =>
        Error.NotFound("Solicitudes.NoEncontrada", $"No existe una solicitud con el id {id}.");

    public static Error NoPendiente(EstadoSolicitud estado) =>
        Error.Conflict(
            "Solicitudes.NoPendiente",
            $"Solo se pueden evaluar solicitudes pendientes; esta solicitud está {estado.ToString().ToLowerInvariant()}.");

    public static Error SinCredito(int id) =>
        Error.NotFound("Solicitudes.SinCredito", $"La solicitud {id} no tiene un crédito aprobado.");

    public static readonly Error ObservacionesRequeridas =
        Error.Validation("Solicitudes.ObservacionesRequeridas", "Las observaciones son requeridas para emitir el dictamen.");
}
