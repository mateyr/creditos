using Creditos.Domain.Clientes;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Creditos.Api.Database.Configurations;

internal sealed class ClienteConfiguration : IEntityTypeConfiguration<Cliente>
{
    public void Configure(EntityTypeBuilder<Cliente> builder)
    {
        builder.ToTable("Clientes");

        builder.Property(c => c.Cedula).HasMaxLength(20);
        builder.HasIndex(c => c.Cedula).IsUnique();

        builder.Property(c => c.NombreCompleto).HasMaxLength(150);
        builder.Property(c => c.CorreoElectronico).HasMaxLength(150);
        builder.Property(c => c.Telefono).HasMaxLength(20);
    }
}
