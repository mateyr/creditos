using Creditos.Api.Authentication;
using Creditos.Api.Common.Endpoints;
using Creditos.Api.Database;

using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Creditos.Api.Features.Auth;

public static class Refresh
{
    public sealed class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPost("auth/refresh", Handle)
                .WithTags(Tags.Auth)
                .AllowAnonymous();
        }

        private static async Task<Results<Ok<AccessTokenResponse>, ProblemHttpResult>> Handle(
            HttpRequest request,
            HttpResponse response,
            CreditosContext context,
            UserManager<IdentityUser> userManager,
            AuthTokenService authTokenService,
            TimeProvider timeProvider,
            CancellationToken cancellationToken)
        {
            string? token = RefreshTokenCookie.Read(request);

            if (string.IsNullOrEmpty(token))
            {
                return SesionExpirada(response);
            }

            DateTime now = timeProvider.GetUtcNow().UtcDateTime;
            string hash = RefreshToken.Hash(token);

            RefreshToken? refreshToken = await context.RefreshTokens
                .FirstOrDefaultAsync(t => t.TokenHash == hash, cancellationToken);

            if (refreshToken is null)
            {
                return SesionExpirada(response);
            }

            if (refreshToken.RevokedAt is not null)
            {
                // Un token ya rotado que se vuelve a usar indica que pudo ser robado:
                // se cierran todas las sesiones del usuario.
                await context.RefreshTokens
                    .Where(t => t.UserId == refreshToken.UserId && t.RevokedAt == null)
                    .ExecuteUpdateAsync(s => s.SetProperty(t => t.RevokedAt, now), cancellationToken);

                return SesionExpirada(response);
            }

            IdentityUser? user = await userManager.FindByIdAsync(refreshToken.UserId);

            if (!refreshToken.IsActive(now) || user is null)
            {
                return SesionExpirada(response);
            }

            // Rotación: el token usado se revoca y se guarda junto con el nuevo en el mismo SaveChanges.
            refreshToken.RevokedAt = now;

            AuthTokens tokens = await authTokenService.IssueAsync(user, cancellationToken);
            RefreshTokenCookie.Append(response, tokens);

            return TypedResults.Ok(new AccessTokenResponse(tokens.AccessToken));
        }

        private static ProblemHttpResult SesionExpirada(HttpResponse response)
        {
            RefreshTokenCookie.Delete(response);

            return TypedResults.Problem(
                "La sesión expiró. Inicia sesión nuevamente.",
                statusCode: StatusCodes.Status401Unauthorized);
        }
    }
}
