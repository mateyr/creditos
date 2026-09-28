using Creditos.Domain.Clientes;
using Creditos.Domain.Creditos;
using Creditos.Domain.Shared;

namespace Creditos.Domain.Solicitudes;

public sealed class SolicitudCredito
{
    private const int MesesPorAnio = 12;

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

    // El estado solo cambia con las transiciones de abajo, que validan las reglas del negocio.
    public EstadoSolicitud Estado { get; private set; } = EstadoSolicitud.Pendiente;
    public string? Observaciones { get; private set; }
    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaDictamen { get; private set; }

    public Credito? Credito { get; private set; }

    /// <summary>Plazo del crédito en meses (p. ej. 24 cuotas quincenales = 12 meses).</summary>
    public decimal PlazoMeses => (decimal)CantidadCuotas * MesesPorAnio / (int)Periodicidad;

    /// <summary>
    /// Aprueba la solicitud y otorga el crédito con su plan de pagos. El crédito queda
    /// relacionado con la solicitud; su número se asigna al guardarlo (ver <see cref="Credito.AsignarNumero"/>).
    /// </summary>
    public Result<Credito> Aprobar(string observaciones, DateTime fecha)
    {
        if (ValidarDictamen(observaciones) is Error error)
        {
            return error;
        }

        RegistrarDictamen(EstadoSolicitud.Aprobada, observaciones, fecha);

        Credito = new Credito
        {
            Solicitud = this,
            FechaCreacion = fecha,
            PlanPagos = GeneradorPlanPagos.Generar(
                MontoSolicitado, TasaInteresAnual, CantidadCuotas, Periodicidad, DateOnly.FromDateTime(fecha))
        };

        return Credito;
    }

    /// <summary>Rechaza la solicitud; las observaciones registran el motivo del rechazo.</summary>
    public Result Rechazar(string observaciones, DateTime fecha)
    {
        if (ValidarDictamen(observaciones) is Error error)
        {
            return error;
        }

        RegistrarDictamen(EstadoSolicitud.Rechazada, observaciones, fecha);

        return Result.Success();
    }

    /// <summary>
    /// Transfiere el crédito al cliente. Solo se desembolsan solicitudes aprobadas; el cambio de
    /// estado, la transferencia y la reprogramación del plan se guardan juntos.
    /// El crédito debe venir cargado con su plan de pagos.
    /// </summary>
    public Result Desembolsar(Banco banco, string numeroCuenta, DateTime fecha)
    {
        if (Estado != EstadoSolicitud.Aprobada || Credito is null)
        {
            return CreditoErrors.NoAprobado(Estado);
        }

        Estado = EstadoSolicitud.Desembolsada;
        Credito.RegistrarDesembolso(banco, numeroCuenta, fecha, Periodicidad);

        return Result.Success();
    }

    // Todo dictamen (aprobación o rechazo) se emite sobre una solicitud pendiente y debe justificarse.
    private Error? ValidarDictamen(string observaciones)
    {
        if (Estado != EstadoSolicitud.Pendiente)
        {
            return SolicitudErrors.NoPendiente(Estado);
        }

        return string.IsNullOrWhiteSpace(observaciones) ? SolicitudErrors.ObservacionesRequeridas : null;
    }

    private void RegistrarDictamen(EstadoSolicitud estado, string observaciones, DateTime fecha)
    {
        Estado = estado;
        Observaciones = observaciones.Trim();
        FechaDictamen = fecha;
    }
}
