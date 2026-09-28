namespace Creditos.Domain.Shared;

public enum ErrorType
{
    Validation,
    NotFound,
    Conflict
}

/// <summary>Error de negocio: el código lo identifica y la descripción es el mensaje para el usuario.</summary>
public sealed record Error(string Code, string Description, ErrorType Type)
{
    public static Error Validation(string code, string description) => new(code, description, ErrorType.Validation);

    public static Error NotFound(string code, string description) => new(code, description, ErrorType.NotFound);

    public static Error Conflict(string code, string description) => new(code, description, ErrorType.Conflict);
}
