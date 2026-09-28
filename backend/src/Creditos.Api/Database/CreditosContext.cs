using Creditos.Domain.Clientes;
using Creditos.Domain.Creditos;
using Creditos.Domain.Solicitudes;

using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Creditos.Api.Database;

public sealed class CreditosContext(DbContextOptions<CreditosContext> options)
    : IdentityDbContext<IdentityUser>(options)
{
    public DbSet<Cliente> Clientes { get; set; }

    public DbSet<SolicitudCredito> Solicitudes { get; set; }

    public DbSet<Credito> Creditos { get; set; }

    public DbSet<CuotaPlanPago> CuotasPlanPago { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(CreditosContext).Assembly);
    }
}
