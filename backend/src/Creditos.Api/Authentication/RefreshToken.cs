using System.Security.Cryptography;
using System.Text;

namespace Creditos.Api.Authentication;

/// <summary>
/// Token de larga duración para obtener nuevos access tokens sin volver a pedir credenciales.
/// Solo se guarda el hash: si alguien lee la base de datos, no puede usar los tokens.
/// </summary>
public sealed class RefreshToken
{
    public int Id { get; set; }
    public required string TokenHash { get; set; }
    public required string UserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime? RevokedAt { get; set; }

    public bool IsActive(DateTime now) => RevokedAt is null && ExpiresAt > now;

    public static string Hash(string token) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
}
