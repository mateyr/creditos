using Creditos.Api.Authentication;
using Creditos.Api.Common.Endpoints;
using Creditos.Api.Database;

using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace Creditos.Api.Features.Auth;

public static class Logout
{
    public sealed class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            // Anónimo: se debe poder cerrar sesión aunque el access token ya haya expirado.
            app.MapPost("auth/logout", Handle)
                .WithTags(Tags.Auth)
                .AllowAnonymous();
        }

        private static async Task<NoContent> Handle(
            HttpRequest request,
            HttpResponse response,
            CreditosContext context,
            TimeProvider timeProvider,
            CancellationToken cancellationToken)
        {
            string? token = RefreshTokenCookie.Read(request);

            if (!string.IsNullOrEmpty(token))
            {
                string hash = RefreshToken.Hash(token);
                DateTime now = timeProvider.GetUtcNow().UtcDateTime;

                await context.RefreshTokens
                    .Where(t => t.TokenHash == hash && t.RevokedAt == null)
                    .ExecuteUpdateAsync(s => s.SetProperty(t => t.RevokedAt, now), cancellationToken);
            }

            RefreshTokenCookie.Delete(response);

            return TypedResults.NoContent();
        }
    }
}
