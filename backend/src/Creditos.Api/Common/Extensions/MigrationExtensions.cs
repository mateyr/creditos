using Creditos.Api.Database;

using Microsoft.EntityFrameworkCore;

namespace Creditos.Api.Common.Extensions;

public static class MigrationExtensions
{
    public static void ApplyMigrations(this IApplicationBuilder app)
    {
        using IServiceScope scope = app.ApplicationServices.CreateScope();

        using CreditosContext dbContext =
            scope.ServiceProvider.GetRequiredService<CreditosContext>();

        dbContext.Database.Migrate();
    }
}
