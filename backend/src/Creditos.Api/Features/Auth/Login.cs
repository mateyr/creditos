using Creditos.Api.Authentication;
using Creditos.Api.Common.Endpoints;

using FluentValidation;
using FluentValidation.Results;

using Microsoft.AspNetCore.Identity;

namespace Creditos.Api.Features.Auth;

public static class Login
{
    public sealed record Request(string UserName, string Password);

    public sealed record Response(string AccessToken);

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

        private static async Task<IResult> Handle(
            Request request,
            IValidator<Request> validator,
            UserManager<IdentityUser> userManager,
            SignInManager<IdentityUser> signInManager,
            ITokenProvider tokenProvider,
            CancellationToken cancellationToken)
        {
            ValidationResult validationResult = await validator.ValidateAsync(request, cancellationToken);

            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
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

            return Results.Ok(new Response(tokenProvider.Create(user)));
        }

        private static IResult InvalidCredentials() =>
            Results.Problem("Usuario o contraseña incorrectos.", statusCode: StatusCodes.Status401Unauthorized);
    }
}
