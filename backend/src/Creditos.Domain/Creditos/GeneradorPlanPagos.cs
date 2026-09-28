using Creditos.Domain.Solicitudes;

namespace Creditos.Domain.Creditos;

/// <summary>Genera la tabla de amortización con cuota nivelada (sistema francés).</summary>
public static class GeneradorPlanPagos
{
    public static List<CuotaPlanPago> Generar(
        decimal monto,
        decimal tasaInteresAnual,
        int cantidadCuotas,
        Periodicidad periodicidad,
        DateOnly fechaInicio)
    {
        decimal tasaPeriodica = tasaInteresAnual / 100m / (int)periodicidad;
        decimal cuotaNivelada = CalculadoraCuotaNivelada.Calcular(monto, tasaInteresAnual, cantidadCuotas, periodicidad);

        List<CuotaPlanPago> plan = new(cantidadCuotas);
        decimal saldo = monto;

        for (int numero = 1; numero <= cantidadCuotas; numero++)
        {
            decimal interes = Math.Round(saldo * tasaPeriodica, 2, MidpointRounding.AwayFromZero);

            // La última cuota liquida el saldo restante para absorber las diferencias de redondeo.
            bool esUltima = numero == cantidadCuotas;
            decimal capital = esUltima ? saldo : cuotaNivelada - interes;

            saldo -= capital;

            plan.Add(new CuotaPlanPago
            {
                NumeroCuota = numero,
                FechaVencimiento = CalcularVencimiento(fechaInicio, numero, periodicidad),
                Cuota = capital + interes,
                Capital = capital,
                Interes = interes,
                Saldo = saldo
            });
        }

        return plan;
    }

    /// <summary>Recalcula las fechas de vencimiento a partir de una nueva fecha de inicio; los montos no cambian.</summary>
    public static void ReprogramarVencimientos(
        IEnumerable<CuotaPlanPago> plan,
        Periodicidad periodicidad,
        DateOnly fechaInicio)
    {
        foreach (CuotaPlanPago cuota in plan)
        {
            cuota.FechaVencimiento = CalcularVencimiento(fechaInicio, cuota.NumeroCuota, periodicidad);
        }
    }

    private static DateOnly CalcularVencimiento(DateOnly fechaInicio, int numeroCuota, Periodicidad periodicidad) =>
        periodicidad switch
        {
            Periodicidad.Anual => fechaInicio.AddYears(numeroCuota),
            Periodicidad.Mensual => fechaInicio.AddMonths(numeroCuota),
            // Dos cuotas por mes: las pares caen en el mismo día del mes y las impares 15 días después.
            Periodicidad.Quincenal => fechaInicio.AddMonths(numeroCuota / 2).AddDays(numeroCuota % 2 * 15),
            _ => throw new ArgumentOutOfRangeException(nameof(periodicidad), periodicidad, null)
        };
}
