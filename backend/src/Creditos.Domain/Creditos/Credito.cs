using Creditos.Domain.Solicitudes;

namespace Creditos.Domain.Creditos;

/// <summary>Crédito otorgado al aprobar una solicitud, con su plan de pagos.</summary>
public sealed class Credito
{
    private const string PrefijoNumero = "CR-";

    public int Id { get; set; }

    /// <summary>Número de negocio del crédito (p. ej. CR-00000001); se asigna con <see cref="AsignarNumero"/>.</summary>
    public string NumeroCredito { get; private set; } = string.Empty;

    public int SolicitudId { get; set; }
    public SolicitudCredito Solicitud { get; set; } = null!;

    public DateTime FechaCreacion { get; set; }

    public List<CuotaPlanPago> PlanPagos { get; set; } = [];

    // Transferencia del desembolso; vacíos mientras el crédito no se haya desembolsado.
    public Banco? Banco { get; private set; }
    public string? NumeroCuenta { get; private set; }
    public DateTime? FechaDesembolso { get; private set; }

    /// <summary>
    /// Registra la transferencia y reprograma los vencimientos del plan desde la fecha del
    /// desembolso: los intereses corren desde que el cliente recibe el dinero, no desde la aprobación.
    /// Se invoca desde <see cref="SolicitudCredito.Desembolsar"/>, que valida el estado.
    /// </summary>
    internal void RegistrarDesembolso(Banco banco, string numeroCuenta, DateTime fecha, Periodicidad periodicidad)
    {
        Banco = banco;
        NumeroCuenta = numeroCuenta;
        FechaDesembolso = fecha;

        GeneradorPlanPagos.ReprogramarVencimientos(PlanPagos, periodicidad, DateOnly.FromDateTime(fecha));
    }

    /// <summary>
    /// Deriva el número incremental del Id generado por la base de datos. Se llama después
    /// de insertar el crédito y dentro de la misma transacción de la aprobación.
    /// </summary>
    public void AsignarNumero()
    {
        if (Id <= 0)
        {
            throw new InvalidOperationException("El crédito debe guardarse antes de asignarle un número.");
        }

        NumeroCredito = $"{PrefijoNumero}{Id:D8}";
    }
}
