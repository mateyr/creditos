using Creditos.Domain.Clientes;
using Creditos.Domain.Solicitudes;

using Microsoft.EntityFrameworkCore;

namespace Creditos.Api.Database;

public sealed class CreditosContext(DbContextOptions<CreditosContext> options) : DbContext(options)
{
    public DbSet<Cliente> Clientes { get; set; }

    public DbSet<SolicitudCredito> Solicitudes { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(CreditosContext).Assembly);
    }
}

