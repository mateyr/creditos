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
