namespace Creditos.Domain.Clientes;

public sealed class Cliente
{
    public int Id { get; set; }
    public required string Cedula { get; set; }
    public required string NombreCompleto { get; set; }
    public required string CorreoElectronico { get; set; }
    public required string Telefono { get; set; }
    public DateOnly FechaNacimiento { get; set; }
}
