using System.Security.Cryptography;

using Creditos.Api.Database;

using Microsoft.AspNetCore.Identity;

namespace Creditos.Api.Authentication;

public sealed record AuthTokens(string AccessToken, string RefreshToken, DateTime RefreshTokenExpiresAt);

public sealed record AccessTokenResponse(string AccessToken);

public sealed class AuthTokenService(
    CreditosContext context,
    ITokenProvider tokenProvider,
    TimeProvider timeProvider,
    IConfiguration configuration)
{
    /// <summary>
    /// Crea los tokens y guarda el refresh token. Los cambios pendientes del contexto (p. ej. revocar
    /// el refresh token anterior al renovar) se confirman en el mismo SaveChanges.
    /// </summary>
    public async Task<AuthTokens> IssueAsync(IdentityUser user, CancellationToken cancellationToken)
    {
        DateTime now = timeProvider.GetUtcNow().UtcDateTime;
        string refreshToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        DateTime expiresAt = now.AddDays(configuration.GetValue<int>("Jwt:RefreshTokenExpirationInDays"));

        context.RefreshTokens.Add(new RefreshToken
        {
            TokenHash = RefreshToken.Hash(refreshToken),
            UserId = user.Id,
            CreatedAt = now,
            ExpiresAt = expiresAt
        });

        await context.SaveChangesAsync(cancellationToken);

        return new AuthTokens(tokenProvider.Create(user), refreshToken, expiresAt);
    }
}
