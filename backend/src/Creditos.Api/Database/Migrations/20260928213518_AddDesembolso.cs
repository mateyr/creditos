using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Creditos.Api.Database.Migrations
{
    /// <inheritdoc />
    public partial class AddDesembolso : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Banco",
                table: "Creditos",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaDesembolso",
                table: "Creditos",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NumeroCuenta",
                table: "Creditos",
                type: "TEXT",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddCheckConstraint(
                name: "CK_Creditos_Banco",
                table: "Creditos",
                sql: "\"Banco\" IS NULL OR \"Banco\" IN (1, 2, 3, 4)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_Creditos_Banco",
                table: "Creditos");

            migrationBuilder.DropColumn(
                name: "Banco",
                table: "Creditos");

            migrationBuilder.DropColumn(
                name: "FechaDesembolso",
                table: "Creditos");

            migrationBuilder.DropColumn(
                name: "NumeroCuenta",
                table: "Creditos");
        }
    }
}
