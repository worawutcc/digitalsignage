using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigitalSignage.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddDeviceStatusLogBaseEntityConfiguration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "UpdatedBy",
                table: "DeviceStatusLogs",
                newName: "updated_by");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "DeviceStatusLogs",
                newName: "updated_at");

            migrationBuilder.RenameColumn(
                name: "CreatedBy",
                table: "DeviceStatusLogs",
                newName: "created_by");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "DeviceStatusLogs",
                newName: "created_at");

            migrationBuilder.AlterColumn<int>(
                name: "updated_by",
                table: "DeviceStatusLogs",
                type: "integer",
                nullable: false,
                defaultValue: -1,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<DateTime>(
                name: "updated_at",
                table: "DeviceStatusLogs",
                type: "timestamp without time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<int>(
                name: "created_by",
                table: "DeviceStatusLogs",
                type: "integer",
                nullable: false,
                defaultValue: -1,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<DateTime>(
                name: "created_at",
                table: "DeviceStatusLogs",
                type: "timestamp without time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceStatusLog_CreatedAt",
                table: "DeviceStatusLogs",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceStatusLog_UpdatedAt",
                table: "DeviceStatusLogs",
                column: "updated_at");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_DeviceStatusLog_CreatedAt",
                table: "DeviceStatusLogs");

            migrationBuilder.DropIndex(
                name: "IX_DeviceStatusLog_UpdatedAt",
                table: "DeviceStatusLogs");

            migrationBuilder.RenameColumn(
                name: "updated_by",
                table: "DeviceStatusLogs",
                newName: "UpdatedBy");

            migrationBuilder.RenameColumn(
                name: "updated_at",
                table: "DeviceStatusLogs",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "created_by",
                table: "DeviceStatusLogs",
                newName: "CreatedBy");

            migrationBuilder.RenameColumn(
                name: "created_at",
                table: "DeviceStatusLogs",
                newName: "CreatedAt");

            migrationBuilder.AlterColumn<int>(
                name: "UpdatedBy",
                table: "DeviceStatusLogs",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldDefaultValue: -1);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "DeviceStatusLogs",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AlterColumn<int>(
                name: "CreatedBy",
                table: "DeviceStatusLogs",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldDefaultValue: -1);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "DeviceStatusLogs",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");
        }
    }
}
