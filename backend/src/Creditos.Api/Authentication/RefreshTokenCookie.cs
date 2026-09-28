namespace Creditos.Api.Authentication;

public static class RefreshTokenCookie
{
    private const string Name = "creditos.refresh";
    private const string Path = "/api/auth";

    public static void Append(HttpResponse response, AuthTokens tokens) =>
        response.Cookies.Append(Name, tokens.RefreshToken, Options(tokens.RefreshTokenExpiresAt));

    public static string? Read(HttpRequest request) => request.Cookies[Name];

    public static void Delete(HttpResponse response) =>
        response.Cookies.Delete(Name, Options(expiresAt: null));

    private static CookieOptions Options(DateTime? expiresAt) => new()
    {
        HttpOnly = true,
        Secure = true,
        SameSite = SameSiteMode.Strict,
        Path = Path,
        Expires = expiresAt
    };
}
