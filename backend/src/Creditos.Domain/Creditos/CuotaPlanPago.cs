namespace Creditos.Domain.Creditos;

/// <summary>Una fila de la tabla de amortización del crédito.</summary>
public sealed class CuotaPlanPago
{
    public int Id { get; set; }

    public int CreditoId { get; set; }

    public int NumeroCuota { get; set; }
    public DateOnly FechaVencimiento { get; set; }

    /// <summary>Valor total de la cuota (capital + interés).</summary>
    public decimal Cuota { get; set; }
    public decimal Capital { get; set; }
    public decimal Interes { get; set; }

    /// <summary>Saldo pendiente del préstamo después de pagar esta cuota.</summary>
    public decimal Saldo { get; set; }
}
