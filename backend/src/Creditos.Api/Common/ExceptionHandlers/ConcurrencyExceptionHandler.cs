using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Creditos.Api.Common.ExceptionHandlers;

/// <summary>
/// Otra petición modificó el registro entre la lectura y el guardado (p. ej. dos desembolsos
/// o dictámenes simultáneos de la misma solicitud). Se responde 409 en lugar de un error 500.
/// </summary>
internal sealed class ConcurrencyExceptionHandler(IProblemDetailsService problemDetailsService) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        if (exception is not DbUpdateConcurrencyException)
        {
            return false;
        }

        httpContext.Response.StatusCode = StatusCodes.Status409Conflict;

        return await problemDetailsService.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = httpContext,
            Exception = exception,
            ProblemDetails = new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "Operación no permitida",
                Detail = "La solicitud fue modificada por otra operación. Actualiza la página e inténtalo de nuevo."
            }
        });
    }
}
