using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Creditos.Api.Database.Converters;

/// <summary>
/// SQLite guarda las fechas como texto sin zona horaria. Todas se guardan en UTC, así que al
/// leerlas se marcan como UTC; de lo contrario se serializan sin la "Z" y el cliente no sabe
/// en qué zona están.
/// </summary>
internal sealed class UtcDateTimeConverter() : ValueConverter<DateTime, DateTime>(
    value => value.Kind == DateTimeKind.Utc ? value : value.ToUniversalTime(),
    value => DateTime.SpecifyKind(value, DateTimeKind.Utc));
