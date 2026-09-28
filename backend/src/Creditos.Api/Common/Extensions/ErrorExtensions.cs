using Creditos.Domain.Shared;

using Microsoft.AspNetCore.Http.HttpResults;

namespace Creditos.Api.Common.Extensions;

public static class ErrorExtensions
{
    /// <summary>Convierte un error de negocio en una respuesta ProblemDetails con el código HTTP que le corresponde.</summary>
    public static ProblemHttpResult ToProblem(this Error error)
    {
        (int statusCode, string title) = error.Type switch
        {
            ErrorType.Validation => (StatusCodes.Status400BadRequest, "Solicitud inválida"),
            ErrorType.NotFound => (StatusCodes.Status404NotFound, "Recurso no encontrado"),
            ErrorType.Conflict => (StatusCodes.Status409Conflict, "Operación no permitida"),
            _ => (StatusCodes.Status500InternalServerError, "Error del servidor")
        };

        return TypedResults.Problem(
            error.Description,
            title: title,
            statusCode: statusCode,
            extensions: new Dictionary<string, object?> { ["code"] = error.Code });
    }
}
