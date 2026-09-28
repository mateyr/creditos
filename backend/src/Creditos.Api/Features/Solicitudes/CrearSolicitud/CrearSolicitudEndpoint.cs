using Creditos.Api.Common.Endpoints;
using Creditos.Api.Database;
using Creditos.Domain.Clientes;
using Creditos.Domain.Solicitudes;

using FluentValidation;
using FluentValidation.Results;

using Microsoft.AspNetCore.Http.HttpResults;

namespace Creditos.Api.Features.Solicitudes.CrearSolicitud;

public sealed class CrearSolicitudEndpoint : IEndpoint
{
    private const int EdadMaxima = 80;

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("solicitudes", Handle)
            .WithTags(Tags.Solicitudes)
            .RequireAuthorization();
    }

    private static async Task<Results<Created<CrearSolicitudResponse>, ValidationProblem>> Handle(
        CrearSolicitudRequest request,
        IValidator<CrearSolicitudRequest> validator,
        CreditosContext context,
        TimeProvider timeProvider,
        CancellationToken cancellationToken)
    {
        ValidationResult validationResult = await validator.ValidateAsync(request, cancellationToken);

        if (!validationResult.IsValid)
        {
            return TypedResults.ValidationProblem(validationResult.ToDictionary());
        }

        Cliente? cliente = await context.Clientes.FindAsync([request.ClienteId], cancellationToken);

        if (cliente is null)
        {
            return ClienteInvalido("El cliente no existe.");
        }

        DateOnly hoy = DateOnly.FromDateTime(timeProvider.GetLocalNow().DateTime);

        if (CalculadoraEdad.Calcular(cliente.FechaNacimiento, hoy) > EdadMaxima)
        {
            return ClienteInvalido($"No se permiten solicitudes de clientes mayores de {EdadMaxima} años.");
        }

        SolicitudCredito solicitud = new()
        {
            ClienteId = cliente.Id,
            TipoEmpleo = request.TipoEmpleo,
            LugarTrabajo = request.LugarTrabajo,
            AntiguedadLaboral = request.AntiguedadLaboral,
            IngresoMensual = request.IngresoMensual,
            MontoSolicitado = request.MontoSolicitado,
            CantidadCuotas = request.CantidadCuotas,
            TasaInteresAnual = request.TasaInteresAnual,
            Periodicidad = request.Periodicidad,
            // Se recalcula en el backend: el valor mostrado en el frontend es solo informativo.
            CuotaNivelada = CalculadoraCuotaNivelada.Calcular(
                request.MontoSolicitado, request.TasaInteresAnual, request.CantidadCuotas, request.Periodicidad),
            Estado = EstadoSolicitud.Pendiente,
            FechaCreacion = timeProvider.GetUtcNow().UtcDateTime
        };

        context.Solicitudes.Add(solicitud);

        await context.SaveChangesAsync(cancellationToken);

        return TypedResults.Created(
            $"/api/solicitudes/{solicitud.Id}",
            new CrearSolicitudResponse(solicitud.Id, solicitud.CuotaNivelada));
    }

    private static ValidationProblem ClienteInvalido(string mensaje) =>
        TypedResults.ValidationProblem(new Dictionary<string, string[]>
        {
            [nameof(CrearSolicitudRequest.ClienteId)] = [mensaje]
        });
}
