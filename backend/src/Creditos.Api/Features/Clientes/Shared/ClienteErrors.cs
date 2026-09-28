using Microsoft.AspNetCore.Http.HttpResults;

namespace Creditos.Api.Features.Clientes.Shared;

internal static class ClienteErrors
{
    public static ProblemHttpResult NoEncontrado(int id) =>
        TypedResults.Problem(
            $"No existe un cliente con el id {id}.",
            title: "Cliente no encontrado",
            statusCode: StatusCodes.Status404NotFound);

    public static ProblemHttpResult CedulaDuplicada(string cedula) =>
        TypedResults.Problem(
            $"Ya existe un cliente con la cédula {cedula}.",
            title: "Cliente duplicado",
            statusCode: StatusCodes.Status409Conflict);

    public static ProblemHttpResult TieneSolicitudes() =>
        TypedResults.Problem(
            "No se puede eliminar el cliente porque tiene solicitudes de crédito registradas.",
            title: "Cliente con solicitudes",
            statusCode: StatusCodes.Status409Conflict);
}
