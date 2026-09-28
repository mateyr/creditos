using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;

namespace Creditos.Api.Common.Extensions;

// Agrega el esquema JWT Bearer al documento OpenAPI para que Scalar muestre
// el campo del token y lo envíe en las llamadas protegidas.
internal sealed class BearerSecuritySchemeTransformer(IAuthenticationSchemeProvider authenticationSchemeProvider)
    : IOpenApiDocumentTransformer
{
    public async Task TransformAsync(
        OpenApiDocument document,
        OpenApiDocumentTransformerContext context,
        CancellationToken cancellationToken)
    {
        IEnumerable<AuthenticationScheme> authenticationSchemes =
            await authenticationSchemeProvider.GetAllSchemesAsync();

        if (authenticationSchemes.All(scheme => scheme.Name != JwtBearerDefaults.AuthenticationScheme))
        {
            return;
        }

        OpenApiSecurityScheme securityScheme = new()
        {
            Name = "JWT Authentication",
            Description = "Token JWT obtenido en /api/auth/login",
            In = ParameterLocation.Header,
            Type = SecuritySchemeType.Http,
            Scheme = JwtBearerDefaults.AuthenticationScheme,
            BearerFormat = "JWT"
        };

        document.Components ??= new OpenApiComponents();
        document.Components.SecuritySchemes ??= new Dictionary<string, IOpenApiSecurityScheme>();
        document.Components.SecuritySchemes[JwtBearerDefaults.AuthenticationScheme] = securityScheme;

        document.Security ??= [];
        document.Security.Add(new OpenApiSecurityRequirement
        {
            [new OpenApiSecuritySchemeReference(JwtBearerDefaults.AuthenticationScheme, document)] = []
        });
    }
}
