using Creditos.Domain.Clientes;

namespace Creditos.Domain.Solicitudes;

public sealed class SolicitudCredito
{
    public int Id { get; set; }

    public int ClienteId { get; set; }
    public Cliente Cliente { get; set; } = null!;

    public TipoEmpleo TipoEmpleo { get; set; }
    public required string LugarTrabajo { get; set; }
    public int AntiguedadLaboral { get; set; }
    public decimal IngresoMensual { get; set; }

    public decimal MontoSolicitado { get; set; }
    public int CantidadCuotas { get; set; }
    public decimal TasaInteresAnual { get; set; }
    public Periodicidad Periodicidad { get; set; }
    public decimal CuotaNivelada { get; set; }

    public EstadoSolicitud Estado { get; set; } = EstadoSolicitud.Pendiente;
    public string? Observaciones { get; set; }
    public DateTime FechaCreacion { get; set; }
}
