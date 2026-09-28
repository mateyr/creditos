using Microsoft.AspNetCore.Identity;

namespace Creditos.Api.Database;

public static class UserSeeder
{
    public static async Task SeedDefaultUserAsync(this WebApplication app)
    {
        using IServiceScope scope = app.Services.CreateScope();

        UserManager<IdentityUser> userManager =
            scope.ServiceProvider.GetRequiredService<UserManager<IdentityUser>>();
        IConfiguration configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();

        string userName = configuration["DefaultUser:UserName"]
            ?? throw new InvalidOperationException("Missing configuration value 'DefaultUser:UserName'.");
        string password = configuration["DefaultUser:Password"]
            ?? throw new InvalidOperationException("Missing configuration value 'DefaultUser:Password'.");

        if (await userManager.FindByNameAsync(userName) is not null)
        {
            return;
        }

        IdentityResult result = await userManager.CreateAsync(new IdentityUser { UserName = userName }, password);

        if (!result.Succeeded)
        {
            string errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Failed to create default user: {errors}");
        }
    }
}
