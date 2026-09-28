using Creditos.Api.Authentication;
using Creditos.Api.Common.Endpoints;

using FluentValidation;
using FluentValidation.Results;

using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;

namespace Creditos.Api.Features.Auth;

public static class Login
{
    public sealed record Request(string UserName, string Password);

    public sealed class Validator : AbstractValidator<Request>
    {
        public Validator()
        {
            RuleFor(r => r.UserName).NotEmpty().WithMessage("El usuario es requerido.");
            RuleFor(r => r.Password).NotEmpty().WithMessage("La contraseña es requerida.");
        }
    }

    public sealed class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPost("auth/login", Handle)
                .WithTags(Tags.Auth)
                .AllowAnonymous();
        }

        private static async Task<Results<Ok<AccessTokenResponse>, ValidationProblem, ProblemHttpResult>> Handle(
            Request request,
            IValidator<Request> validator,
            HttpResponse response,
            UserManager<IdentityUser> userManager,
            SignInManager<IdentityUser> signInManager,
            AuthTokenService authTokenService,
            CancellationToken cancellationToken)
        {
            ValidationResult validationResult = await validator.ValidateAsync(request, cancellationToken);

            if (!validationResult.IsValid)
            {
                return TypedResults.ValidationProblem(validationResult.ToDictionary());
            }

            IdentityUser? user = await userManager.FindByNameAsync(request.UserName);

            if (user is null)
            {
                return InvalidCredentials();
            }

            SignInResult result = await signInManager.CheckPasswordSignInAsync(
                user, request.Password, lockoutOnFailure: true);

            if (!result.Succeeded)
            {
                return InvalidCredentials();
            }

            AuthTokens tokens = await authTokenService.IssueAsync(user, cancellationToken);
            RefreshTokenCookie.Append(response, tokens);

            return TypedResults.Ok(new AccessTokenResponse(tokens.AccessToken));
        }

        private static ProblemHttpResult InvalidCredentials() =>
            TypedResults.Problem("Usuario o contraseña incorrectos.", statusCode: StatusCodes.Status401Unauthorized);
    }
}
