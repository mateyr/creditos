using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Creditos.Api.Database.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Clientes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Cedula = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    NombreCompleto = table.Column<string>(type: "TEXT", maxLength: 150, nullable: false),
                    CorreoElectronico = table.Column<string>(type: "TEXT", maxLength: 150, nullable: false),
                    Telefono = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    FechaNacimiento = table.Column<DateOnly>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Clientes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Solicitudes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ClienteId = table.Column<int>(type: "INTEGER", nullable: false),
                    TipoEmpleo = table.Column<int>(type: "INTEGER", nullable: false),
                    LugarTrabajo = table.Column<string>(type: "TEXT", maxLength: 150, nullable: false),
                    AntiguedadLaboral = table.Column<int>(type: "INTEGER", nullable: false),
                    IngresoMensual = table.Column<decimal>(type: "TEXT", precision: 18, scale: 2, nullable: false),
                    MontoSolicitado = table.Column<decimal>(type: "TEXT", precision: 18, scale: 2, nullable: false),
                    CantidadCuotas = table.Column<int>(type: "INTEGER", nullable: false),
                    TasaInteresAnual = table.Column<decimal>(type: "TEXT", precision: 5, scale: 2, nullable: false),
                    Periodicidad = table.Column<int>(type: "INTEGER", nullable: false),
                    CuotaNivelada = table.Column<decimal>(type: "TEXT", precision: 18, scale: 2, nullable: false),
                    Estado = table.Column<int>(type: "INTEGER", nullable: false),
                    Observaciones = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Solicitudes", x => x.Id);
                    table.CheckConstraint("CK_Solicitudes_Estado", "\"Estado\" IN (0, 1, 2, 3)");
                    table.CheckConstraint("CK_Solicitudes_Periodicidad", "\"Periodicidad\" IN (1, 12, 24)");
                    table.CheckConstraint("CK_Solicitudes_TipoEmpleo", "\"TipoEmpleo\" IN (1, 2)");
                    table.ForeignKey(
                        name: "FK_Solicitudes_Clientes_ClienteId",
                        column: x => x.ClienteId,
                        principalTable: "Clientes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Clientes_Cedula",
                table: "Clientes",
                column: "Cedula",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Solicitudes_ClienteId",
                table: "Solicitudes",
                column: "ClienteId");

            migrationBuilder.CreateIndex(
                name: "IX_Solicitudes_Estado",
                table: "Solicitudes",
                column: "Estado");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Solicitudes");

            migrationBuilder.DropTable(
                name: "Clientes");
        }
    }
}
