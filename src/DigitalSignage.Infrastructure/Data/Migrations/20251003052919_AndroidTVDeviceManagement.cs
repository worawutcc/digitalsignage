using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace DigitalSignage.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AndroidTVDeviceManagement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AndroidVersion",
                table: "Devices",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ApiLevel",
                table: "Devices",
                type: "integer",
                maxLength: 10,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DeactivatedBy",
                table: "Devices",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DisplayResolution",
                table: "Devices",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MacAddress",
                table: "Devices",
                type: "character varying(17)",
                maxLength: 17,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Manufacturer",
                table: "Devices",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Model",
                table: "Devices",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SerialNumber",
                table: "Devices",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "deactivated_at",
                table: "Devices",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "DeviceConfigurations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DeviceId = table.Column<int>(type: "integer", nullable: false),
                    DisplayOrientation = table.Column<int>(type: "integer", nullable: false),
                    Resolution = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    RefreshRate = table.Column<int>(type: "integer", nullable: false, defaultValue: 60),
                    ScreenTimeout = table.Column<int>(type: "integer", nullable: false, defaultValue: 30),
                    PowerManagement = table.Column<int>(type: "integer", nullable: false),
                    NetworkConfig = table.Column<string>(type: "text", nullable: true),
                    AppPermissions = table.Column<string>(type: "text", nullable: true),
                    RemoteManagementEnabled = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    ProxySettings = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeviceConfigurations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DeviceConfigurations_Devices_DeviceId",
                        column: x => x.DeviceId,
                        principalTable: "Devices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DeviceConfigurations_Users_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DeviceStatusLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DeviceId = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Details = table.Column<string>(type: "text", nullable: true),
                    Timestamp = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "NOW() AT TIME ZONE 'UTC'"),
                    Source = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeviceStatusLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DeviceStatusLogs_Devices_DeviceId",
                        column: x => x.DeviceId,
                        principalTable: "Devices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RegistrationRecords",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DeviceId = table.Column<int>(type: "integer", nullable: false),
                    Action = table.Column<int>(type: "integer", nullable: false),
                    Details = table.Column<string>(type: "text", nullable: true),
                    IpAddress = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: false),
                    UserAgent = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Timestamp = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "NOW() AT TIME ZONE 'UTC'"),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    Success = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    ErrorMessage = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RegistrationRecords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RegistrationRecords_Devices_DeviceId",
                        column: x => x.DeviceId,
                        principalTable: "Devices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RegistrationRecords_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Devices_DeactivatedBy",
                table: "Devices",
                column: "DeactivatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Devices_MacAddress",
                table: "Devices",
                column: "MacAddress",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DeviceConfigurations_DeviceId",
                table: "DeviceConfigurations",
                column: "DeviceId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DeviceConfigurations_UpdatedBy",
                table: "DeviceConfigurations",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceStatusLogs_DeviceId_Timestamp",
                table: "DeviceStatusLogs",
                columns: new[] { "DeviceId", "Timestamp" });

            migrationBuilder.CreateIndex(
                name: "IX_RegistrationRecords_DeviceId_Timestamp",
                table: "RegistrationRecords",
                columns: new[] { "DeviceId", "Timestamp" });

            migrationBuilder.CreateIndex(
                name: "IX_RegistrationRecords_UserId",
                table: "RegistrationRecords",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Devices_Users_DeactivatedBy",
                table: "Devices",
                column: "DeactivatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Devices_Users_DeactivatedBy",
                table: "Devices");

            migrationBuilder.DropTable(
                name: "DeviceConfigurations");

            migrationBuilder.DropTable(
                name: "DeviceStatusLogs");

            migrationBuilder.DropTable(
                name: "RegistrationRecords");

            migrationBuilder.DropIndex(
                name: "IX_Devices_DeactivatedBy",
                table: "Devices");

            migrationBuilder.DropIndex(
                name: "IX_Devices_MacAddress",
                table: "Devices");

            migrationBuilder.DropColumn(
                name: "AndroidVersion",
                table: "Devices");

            migrationBuilder.DropColumn(
                name: "ApiLevel",
                table: "Devices");

            migrationBuilder.DropColumn(
                name: "DeactivatedBy",
                table: "Devices");

            migrationBuilder.DropColumn(
                name: "DisplayResolution",
                table: "Devices");

            migrationBuilder.DropColumn(
                name: "MacAddress",
                table: "Devices");

            migrationBuilder.DropColumn(
                name: "Manufacturer",
                table: "Devices");

            migrationBuilder.DropColumn(
                name: "Model",
                table: "Devices");

            migrationBuilder.DropColumn(
                name: "SerialNumber",
                table: "Devices");

            migrationBuilder.DropColumn(
                name: "deactivated_at",
                table: "Devices");
        }
    }
}
