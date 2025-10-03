using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigitalSignage.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class FixMissingBaseEntityConfigurations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "UpdatedBy",
                table: "RegistrationRecords",
                newName: "updated_by");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "RegistrationRecords",
                newName: "updated_at");

            migrationBuilder.RenameColumn(
                name: "CreatedBy",
                table: "RegistrationRecords",
                newName: "created_by");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "RegistrationRecords",
                newName: "created_at");

            migrationBuilder.AlterColumn<int>(
                name: "updated_by",
                table: "RegistrationRecords",
                type: "integer",
                nullable: false,
                defaultValue: -1,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<DateTime>(
                name: "updated_at",
                table: "RegistrationRecords",
                type: "timestamp without time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<int>(
                name: "created_by",
                table: "RegistrationRecords",
                type: "integer",
                nullable: false,
                defaultValue: -1,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<DateTime>(
                name: "created_at",
                table: "RegistrationRecords",
                type: "timestamp without time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.CreateIndex(
                name: "IX_RegistrationRecord_CreatedAt",
                table: "RegistrationRecords",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_RegistrationRecord_UpdatedAt",
                table: "RegistrationRecords",
                column: "updated_at");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_RegistrationRecord_CreatedAt",
                table: "RegistrationRecords");

            migrationBuilder.DropIndex(
                name: "IX_RegistrationRecord_UpdatedAt",
                table: "RegistrationRecords");

            migrationBuilder.RenameColumn(
                name: "updated_by",
                table: "RegistrationRecords",
                newName: "UpdatedBy");

            migrationBuilder.RenameColumn(
                name: "updated_at",
                table: "RegistrationRecords",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "created_by",
                table: "RegistrationRecords",
                newName: "CreatedBy");

            migrationBuilder.RenameColumn(
                name: "created_at",
                table: "RegistrationRecords",
                newName: "CreatedAt");

            migrationBuilder.AlterColumn<int>(
                name: "UpdatedBy",
                table: "RegistrationRecords",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldDefaultValue: -1);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "RegistrationRecords",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AlterColumn<int>(
                name: "CreatedBy",
                table: "RegistrationRecords",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldDefaultValue: -1);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "RegistrationRecords",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");
        }
    }
}
