using Creditos.Domain.Clientes;

namespace Creditos.Api.Features.Clientes.Shared;

public sealed record ClienteResponse(
    int Id,
    string Cedula,
    string NombreCompleto,
    string CorreoElectronico,
    string Telefono,
    DateOnly FechaNacimiento,
    int Edad)
{
    public static ClienteResponse FromEntity(Cliente cliente, DateOnly hoy) =>
        new(
            cliente.Id,
            cliente.Cedula,
            cliente.NombreCompleto,
            cliente.CorreoElectronico,
            cliente.Telefono,
            cliente.FechaNacimiento,
            CalculadoraEdad.Calcular(cliente.FechaNacimiento, hoy));
}
