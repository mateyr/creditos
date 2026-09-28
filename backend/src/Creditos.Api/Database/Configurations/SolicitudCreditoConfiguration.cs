using Creditos.Domain.Solicitudes;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Creditos.Api.Database.Configurations;

internal sealed class SolicitudCreditoConfiguration : IEntityTypeConfiguration<SolicitudCredito>
{
    public void Configure(EntityTypeBuilder<SolicitudCredito> builder)
    {
        builder.ToTable("Solicitudes", t =>
        {
            t.HasCheckConstraint("CK_Solicitudes_Estado", "\"Estado\" IN (0, 1, 2, 3)");
            t.HasCheckConstraint("CK_Solicitudes_Periodicidad", "\"Periodicidad\" IN (1, 12, 24)");
            t.HasCheckConstraint("CK_Solicitudes_TipoEmpleo", "\"TipoEmpleo\" IN (1, 2)");
        });

        builder.HasOne(s => s.Cliente)
            .WithMany()
            .HasForeignKey(s => s.ClienteId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(s => s.LugarTrabajo).HasMaxLength(150);
        builder.Property(s => s.Observaciones).HasMaxLength(500);

        builder.Property(s => s.IngresoMensual).HasPrecision(18, 2);
        builder.Property(s => s.MontoSolicitado).HasPrecision(18, 2);
        builder.Property(s => s.TasaInteresAnual).HasPrecision(5, 2);
        builder.Property(s => s.CuotaNivelada).HasPrecision(18, 2);

        builder.HasIndex(s => s.Estado);
    }
}
