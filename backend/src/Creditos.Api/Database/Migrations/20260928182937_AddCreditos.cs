using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Creditos.Api.Database.Migrations
{
    /// <inheritdoc />
    public partial class AddCreditos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "FechaDictamen",
                table: "Solicitudes",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Creditos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    NumeroCredito = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    SolicitudId = table.Column<int>(type: "INTEGER", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Creditos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Creditos_Solicitudes_SolicitudId",
                        column: x => x.SolicitudId,
                        principalTable: "Solicitudes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CuotasPlanPago",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    CreditoId = table.Column<int>(type: "INTEGER", nullable: false),
                    NumeroCuota = table.Column<int>(type: "INTEGER", nullable: false),
                    FechaVencimiento = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    Cuota = table.Column<decimal>(type: "TEXT", precision: 18, scale: 2, nullable: false),
                    Capital = table.Column<decimal>(type: "TEXT", precision: 18, scale: 2, nullable: false),
                    Interes = table.Column<decimal>(type: "TEXT", precision: 18, scale: 2, nullable: false),
                    Saldo = table.Column<decimal>(type: "TEXT", precision: 18, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CuotasPlanPago", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CuotasPlanPago_Creditos_CreditoId",
                        column: x => x.CreditoId,
                        principalTable: "Creditos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Creditos_NumeroCredito",
                table: "Creditos",
                column: "NumeroCredito",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Creditos_SolicitudId",
                table: "Creditos",
                column: "SolicitudId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CuotasPlanPago_CreditoId_NumeroCuota",
                table: "CuotasPlanPago",
                columns: new[] { "CreditoId", "NumeroCuota" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CuotasPlanPago");

            migrationBuilder.DropTable(
                name: "Creditos");

            migrationBuilder.DropColumn(
                name: "FechaDictamen",
                table: "Solicitudes");
        }
    }
}
