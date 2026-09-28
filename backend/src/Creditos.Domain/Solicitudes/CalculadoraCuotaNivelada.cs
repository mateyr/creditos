namespace Creditos.Domain.Solicitudes;

public static class CalculadoraCuotaNivelada
{
    // Cuota = Monto * [ i * (1 + i)^n ] / [ (1 + i)^n - 1 ],  con  i = (TasaAnual / 100) / periodos por año
    public static decimal Calcular(decimal monto, decimal tasaInteresAnual, int cantidadCuotas, Periodicidad periodicidad)
    {
        decimal tasaPeriodica = tasaInteresAnual / 100m / (int)periodicidad;

        // decimal no tiene Pow; se multiplica en un ciclo para no perder precisión con double.
        decimal factor = 1m;
        for (int cuota = 0; cuota < cantidadCuotas; cuota++)
        {
            factor *= 1m + tasaPeriodica;
        }

        decimal cuotaNivelada = monto * (tasaPeriodica * factor) / (factor - 1m);

        return Math.Round(cuotaNivelada, 2, MidpointRounding.AwayFromZero);
    }
}
