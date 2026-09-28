using Microsoft.AspNetCore.Identity;

namespace Creditos.Api.Authentication;

public interface ITokenProvider
{
    string Create(IdentityUser user);
}
