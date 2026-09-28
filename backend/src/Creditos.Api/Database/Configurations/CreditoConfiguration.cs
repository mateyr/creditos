using Creditos.Domain.Creditos;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Creditos.Api.Database.Configurations;

internal sealed class CreditoConfiguration : IEntityTypeConfiguration<Credito>
{
    public void Configure(EntityTypeBuilder<Credito> builder)
    {
        builder.ToTable("Creditos");

        builder.Property(c => c.NumeroCredito).HasMaxLength(20);
        builder.HasIndex(c => c.NumeroCredito).IsUnique();

        // Una solicitud solo puede generar un crédito: el índice único lo garantiza
        // incluso si dos aprobaciones de la misma solicitud llegan al mismo tiempo.
        builder.HasOne(c => c.Solicitud)
            .WithOne(s => s.Credito)
            .HasForeignKey<Credito>(c => c.SolicitudId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(c => c.PlanPagos)
            .WithOne()
            .HasForeignKey(c => c.CreditoId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
