using Creditos.Domain.Creditos;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Creditos.Api.Database.Configurations;

internal sealed class CuotaPlanPagoConfiguration : IEntityTypeConfiguration<CuotaPlanPago>
{
    public void Configure(EntityTypeBuilder<CuotaPlanPago> builder)
    {
        builder.ToTable("CuotasPlanPago");

        builder.HasIndex(c => new { c.CreditoId, c.NumeroCuota }).IsUnique();

        builder.Property(c => c.Cuota).HasPrecision(18, 2);
        builder.Property(c => c.Capital).HasPrecision(18, 2);
        builder.Property(c => c.Interes).HasPrecision(18, 2);
        builder.Property(c => c.Saldo).HasPrecision(18, 2);
    }
}
