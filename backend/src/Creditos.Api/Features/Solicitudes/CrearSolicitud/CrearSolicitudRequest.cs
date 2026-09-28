using Creditos.Domain.Solicitudes;

namespace Creditos.Api.Features.Solicitudes.CrearSolicitud;

public sealed record CrearSolicitudRequest(
    int ClienteId,
    // Información laboral
    TipoEmpleo TipoEmpleo,
    string LugarTrabajo,
    int AntiguedadLaboral,
    decimal IngresoMensual,
    // Condiciones del crédito
    decimal MontoSolicitado,
    int CantidadCuotas,
    decimal TasaInteresAnual,
    Periodicidad Periodicidad);

public sealed record CrearSolicitudResponse(int Id, decimal CuotaNivelada);
