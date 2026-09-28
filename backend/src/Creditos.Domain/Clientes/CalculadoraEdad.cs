namespace Creditos.Domain.Clientes;

public static class CalculadoraEdad
{
    public static int Calcular(DateOnly fechaNacimiento, DateOnly hoy)
    {
        int edad = hoy.Year - fechaNacimiento.Year;

        // Si todavía no cumple años este año, se resta uno.
        return fechaNacimiento > hoy.AddYears(-edad) ? edad - 1 : edad;
    }
}
